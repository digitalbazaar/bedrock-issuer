/*
 * Bedrock issuer module.
 *
 * This modules exposes an API for issuing and claiming credentials.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
var async = require('async');
var bedrock = require('bedrock');
var brIdentity = require('bedrock-identity');
var brKey = require('bedrock-key');
var brPermission = require('bedrock-permission');
var credentialsRest = require('bedrock-credentials-rest');
var jsigs = require('jsonld-signatures');
jsigs.use('jsonld', bedrock.jsonld);
var ensureAuthenticated = require('bedrock-passport').ensureAuthenticated;
var store = require('bedrock-credentials-mongodb');
var database = require('bedrock-credentials-mongodb').database;
var validate = require('bedrock-validation').validate;
var BedrockError = bedrock.util.BedrockError;
var config = bedrock.config;

// load modules
require('bedrock-express');
require('bedrock-consumer');

// load config defaults
require('./config');

// module permissions
var PERMISSIONS = bedrock.config.permission.permissions;

// module API
var api = {};
module.exports = api;

var logger = bedrock.loggers.get('app');

// distributed ID generator for credentials
var credentialIdGenerator = null;

bedrock.events.on('bedrock-mongodb.ready', function(callback) {
  async.auto({
    createIndexes: function(callback) {
      // create indexes for claimed status
      database.createIndexes([{
        collection: store.provider.name,
        fields: {recipient: 1, 'credential.sysState': 1, id: 1},
        options: {unique: true, background: false}
      }, {
        collection: store.provider.name,
        fields: {issuer: 1, 'credential.sysState': 1, id: 1},
        options: {unique: true, background: false}
      }], callback);
    },
    createIdGenerator: function(callback) {
      database.getDistributedIdGenerator('credential',
        function(err, idGenerator) {
          if(!err) {
            credentialIdGenerator = idGenerator;
          }
          callback(err);
        });
    }
  }, function(err) {
    callback(err);
  });
});

bedrock.events.on('bedrock.test.configure', function() {
  // load test config
  require('./test.config');
});

/**
 * Creates a new CredentialId based on the issuer's URL.
 *
 * @param callback(err, id) called once the operation completes.
 */
api.generateCredentialId = function(callback) {
  credentialIdGenerator.generateId(function(err, id) {
    if(err) {
      return callback(err);
    }
    callback(null, credentialsRest.createCredentialId(id));
  });
};

/**
 * Issues a Credential.
 *
 * @param actor the actor performing the action.
 * @param credential the Credential to issue.
 * @param [options] the options to use:
 *          [privateKey] include to sign the credential.
 *          [publicKeyId] include to identify the key used to sign.
 * @param callback(err, credential) called once the operation completes.
 */
api.issue = function(actor, credential, options, callback) {
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }

  // newly issued credentials start as unclaimed
  credential.sysStatus = 'active';
  credential.sysState = 'unclaimed';

  logger.debug('issuing credential', credential);

  async.auto({
    checkPermission: function(callback) {
      brPermission.checkPermission(
        actor, PERMISSIONS.CREDENTIAL_ISSUE,
        {resource: credential, translate: 'issuer'}, callback);
    },
    getSigningKey: ['checkPermission', function(callback) {
      // TODO: use key `options` if given as alternative to this function
      getCredentialSigningKey(credential, callback);
    }],
    sign: ['getSigningKey', function(callback, results) {
      if(!results.getSigningKey) {
        return callback(null, credential);
      }
      // digitally-sign credential
      // TODO: we'll eventually want to sign credentials using
      // a seperate signing module for security, will need
      // jsigs to support passing a signing function.
      jsigs.sign(credential, {
        algorithm: 'LinkedDataSignature2015',
        privateKeyPem: results.getSigningKey.privateKey.privateKeyPem,
        creator: results.getSigningKey.id
      }, callback);
    }],
    issue: ['sign', function(callback, results) {
      store.provider.insert(actor, results.sign, function(err, record) {
        callback(err, record ? record.credential : null);
      });
    }]
  }, function(err, results) {
    callback(err, results.issue);
  });
};

/**
 * Revokes a Credential based on its ID.
 *
 * @param actor the Identity performing the action.
 * @param id the ID of the Credential to revoke.
 * @param options the options to use:
 *          privateKey the private key to resign with.
 *          publicKeyId used to identify the signing key.
 *          [reason] the reason for revocation.
 * @param callback(err) called once the operation completes.
 */
api.revoke = function(actor, id, options, callback) {
  async.auto({
    checkPermission: function(callback) {
      brPermission.checkPermission(
        actor, PERMISSIONS.CREDENTIAL_REVOKE,
        {resource: id, translate: 'issuer'}, callback);
    },
    get: ['checkPermission', function(callback) {
      store.provider.get(null, id, callback);
    }],
    getSigningKey: ['get', function(callback, results) {
      var credential = results.get;
      // TODO: use key `options` if given as alternative to this function
      getCredentialSigningKey(credential, callback);
    }],
    sign: ['getSigningKey', function(callback, results) {
      var credential = results.get;
      // mark the credential as revoked
      credential.sysStatus = 'disabled';
      credential.sysState = 'revoked';
      credential.revoked = bedrock.util.w3cDate();
      // TODO: temporary; model this better; not yet in context; consider
      // more complicated addition of fields, etc. (may require API changes)
      if(options.reason) {
        credential.revocationReason = options.reason;
      }
      if(!results.getSigningKey) {
        return callback(null, credential);
      }
      // digitally-sign credential
      // TODO: we'll eventually want to sign credentials using
      // a seperate signing module for security, will need
      // jsigs to support passing a signing function.
      jsigs.sign(credential, {
        privateKeyPem: results.getSigningKey.privateKey.privateKeyPem,
        creator: results.getSigningKey.id
      }, callback);
    }],
    update: ['sign', function(callback, results) {
      // TODO: should this be reworked to only update the fields that are
      // changing?
      store.provider.collection.update(
        {id: database.hash(id)}, {
          $set: {credential: database.encode(results.sign)}
        }, database.writeOptions, function(err, result) {
        callback(err, result.result.n);
      });
    }]
  }, function(err, results) {
    callback(err, results.sign);
  });
};

/**
 * Claims a previously issued Credential.
 *
 * @param actor the actor performing the action.
 * @param id the ID of the Credential to claim.
 * @param callback(err) called once the operation completes.
 */
api.claim = function(actor, id, callback) {
  async.auto({
    checkPermission: function(callback) {
      brPermission.checkPermission(
        actor, PERMISSIONS.CREDENTIAL_CLAIM,
        {resource: id, translate: 'recipient'}, callback);
    },
    claim: ['checkPermission', function(callback) {
      // can only claim non-revoked credentials
      store.provider.collection.update({
        id: database.hash(id),
        'credential.sysStatus': 'active',
        'credential.sysState': {$ne: 'revoked'}
      }, {
        $set: {'credential.sysState': 'claimed'}
      }, database.writeOptions, function(err, result) {
        callback(err, result.result.n);
      });
    }],
    checkUpdate: ['claim', function(callback, results) {
      if(results.claim === 0) {
        return callback(new BedrockError(
          'Failed to claim credential. The credential must exist and ' +
          'must not have been revoked.', 'ClaimCredentialError',
          {id: id, httpStatusCode: 400, 'public': true}));
      }
      callback();
    }]
  }, function(err) {
    callback(err);
  });
};

function getCredentialSigningKey(credential, callback) {
  async.auto({
    getIssuer: function(callback) {
      var issuer = credential.issuer;
      brIdentity.get(null, issuer, function(err, results) {
        callback(err, results);
      });
    },
    getPreferredSigningKey: ['getIssuer', function(callback, results) {
      var identity = results.getIssuer;
      var keyId = null;

      if(identity.sysPreferences &&
        identity.sysPreferences.credentialSigningKey) {
        keyId = identity.sysPreferences.credentialSigningKey;
      }
      if(!keyId) {
        return callback(new BedrockError(
          'Preferred credential signing key not designated.', 'NotFound',
          {httpStatusCode: 404, public: true}));
      }
      brKey.getPublicKey({id: keyId}, identity,
        function(err, publicKey, meta, privateKey) {
        if(err) {
          return callback(new BedrockError(
            'Preferred credential signing key not found.', 'NotFound',
            {httpStatusCode: 404, public: true}, err));
        }
        // privateKey may be undefined because it either does not exist
        // or the issuer identity does not have the proper permissions to
        // access the private key
        if(!privateKey || publicKey.sysStatus !== 'active') {
          return callback(new BedrockError(
            'Preferred credential signing key is invalid.', 'InvalidKey',
            {httpStatusCode: 400, public: true}));
        }
        publicKey.privateKey = privateKey;
        callback(null, publicKey);
      });
    }]
  }, function(err, results) {
    callback(err, results.getPreferredSigningKey);
  });
}

// TODO: more acceptable formats?
function checkHeaders(req, res, next) {
  var acceptableContentTypes = [
    'application/ld+json',
    'application/json',
    'text/html'
  ];
  var type = req.accepts(acceptableContentTypes);
  if(!type) {
    res.status(406);
    res.json({
      message: 'Requested content types not acceptable.',
      details: {
        accepted: req.get('accept'),
        acceptable: acceptableContentTypes
      }
    });
    return;
  }
  if(!(req.is('application/ld+json') || req.is('application/json'))) {
    res.sendStatus(415);
    return;
  }
  next();
}

var CREDENTIAL_FRAME = {
  '@type': 'https://w3id.org/credentials#Credential',
  'https://w3id.org/credentials#claim': {}
};
var CREDENTIAL_CONTEXT = [
  config.constants.IDENTITY_CONTEXT_V1_URL,
  config.constants.CREDENTIALS_CONTEXT_V1_URL
];

// FIXME: move blank id removal functions into jsonld.js
// find all blank node ids and objects
// input must have ids expanded and not aliased
// state is {id: [obj, ...], ...}
function findBlankIds(data, state) {
  if(data && typeof data === 'object') {
    if(Array.isArray(data)) {
      data.forEach(value => findBlankIds(value, state));
    } else {
      var id = data['@id'];
      if(id && id.startsWith('_:')) {
        var values = state[id] = (state[id] || []);
        values.push(data);
      }
      Object.keys(data).forEach(key => findBlankIds(data[key], state));
    }
  }
}
function removeBlankIds(data, callback) {
  var state = {};
  findBlankIds(data, state);
  // remove single blank node ids
  Object.keys(state).forEach(id => {
    var values = state[id];
    if(values.length === 1) {
      delete values[0]['@id'];
    }
  });
  callback(null, data);
}

bedrock.events.on('bedrock-express.configure.routes', function(app) {
  app.post(config.issuer.endpoints.unsignedCredential,
    checkHeaders, ensureAuthenticated,
    function(req, res, next) {
      // FIXME: Replace credential signing key from config with key from db
      var options = {};
      async.auto({
        generateId: function(callback) {
          api.generateCredentialId(callback);
        },
        framed: function(callback) {
          bedrock.jsonld.frame(
            req.body, CREDENTIAL_FRAME, function(err, framed) {
            if(err) {
              // if error was a JSON-LD syntax error and the context is an
              // exact match, try to return a more useful validation error
              // instead
              if(err.details && err.details.cause &&
                err.details.cause.name === 'jsonld.SyntaxError' &&
                _compareContext(req.body)) {
                return validate('credential', req.body, function(vErr) {
                  if(vErr) {
                    return callback(vErr);
                  }
                  callback(err);
                });
              }
              return callback(err);
            }
            var g = bedrock.jsonld.getValues(framed, '@graph');
            if(g.length === 0) {
              return callback(new BedrockError(
               'Credential not found.',
               'AddCredentialFailed', {
                 httpStatusCode: 400,
                 'public': true
               }, err));
            }
            if(g.length > 1) {
              return callback(new BedrockError(
               'Multiple credentials found.',
               'AddCredentialFailed', {
                 httpStatusCode: 400,
                 'public': true
               }, err));
            }
            callback(null, g[0]);
          });
        },
        noBlankIds: ['framed', function(callback, results) {
          removeBlankIds(results.framed, callback);
        }],
        compacted: ['noBlankIds', function(callback, results) {
          bedrock.jsonld.compact(
            results.noBlankIds, CREDENTIAL_CONTEXT, function(err, compacted) {
              callback(err, compacted);
            });
        }],
        validated: ['compacted', function(callback, results) {
          validate('credential', results.compacted, callback);
        }],
        issue: ['generateId', 'validated', function(callback, results) {
          // insert generated id
          var credential = results.compacted;
          credential.id = results.generateId;
          api.issue(req.user.identity, credential, options,
            function(err, issued) {
            if(err) {
              if(database.isDuplicateError(err)) {
                return callback(new BedrockError(
                  'The credential is a duplicate and could not be added.',
                  'DuplicateCredential', {httpStatusCode: 409, 'public': true}
                ));
              }
              return callback(new BedrockError(
               'The credential could not be added.', 'AddCredentialFailed',
               {httpStatusCode: 400, 'public': true}, err));
            }
            callback(null, issued);
          });
        }]
      }, function(err, results) {
        if(err) {
          return next(err);
        }
        // success
        res.set('Location', results.issue.id);
        res.status(201).json(results.issue);
      });
    });
});

function _compareContext(doc) {
  // FIXME: could be generalized in the event CREDENTIAL_CONTEXT changes
  return (
    '@context' in doc && Array.isArray(doc['@context']) &&
    doc['@context'].length == CREDENTIAL_CONTEXT.length &&
    doc['@context'][0] === CREDENTIAL_CONTEXT[0] &&
    doc['@context'][1] === CREDENTIAL_CONTEXT[1]);
}
