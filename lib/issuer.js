/*
 * Bedrock issuer module.
 *
 * This modules exposes an API for issuing and claiming credentials.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
var async = require('async');
var bedrock = require('bedrock');
var brPermission = require('bedrock-permission');
var cors = require('cors');
var credentialsRest = require('bedrock-credentials-rest');
var jsigs = require('jsonld-signatures');
jsigs.use('jsonld', bedrock.jsonld);
var ensureAuthenticated = require('bedrock-passport').ensureAuthenticated;
var rest = require('bedrock-rest');
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

  if(options.publicKeyId && !options.privateKey) {
    throw new Error(
      'options.publicKeyId is set, so options.privateKey ' +
      'must also be set.');
  }
  if(options.privateKey && !options.publicKeyId) {
    throw new Error(
      'options.privateKey is set, so options.publicKeyId ' +
      'must also be set.');
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
    sign: ['checkPermission', function(callback) {
      if(!options.privateKey) {
        return callback(null, credential);
      }
      // digitally-sign credential
      jsigs.sign(credential, {
        algorithm: 'LinkedDataSignature2015',
        privateKeyPem: options.privateKey,
        creator: options.publicKeyId
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
  if(!options.privateKey) {
    return callback(new Error(
      'options.privateKey must be a PEM-formatted private key.'));
  }
  if(!options.publicKeyId) {
    return callback(new Error('options.publicKeyId must be a string.'));
  }

  async.auto({
    checkPermission: function(callback) {
      brPermission.checkPermission(
        actor, PERMISSIONS.CREDENTIAL_REVOKE,
        {resource: id, translate: 'issuer'}, callback);
    },
    get: ['checkPermission', function(callback) {
      store.get(null, id, callback);
    }],
    sign: ['get', function(callback, results) {
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
      // digitally-sign credential
      jsigs.sign(credential, {
        privateKeyPem: options.privateKey,
        creator: options.publicKeyId
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

bedrock.events.on('bedrock-express.configure.routes', function(app) {
  app.post(config.issuer.endpoints.unsignedCredential,
    [checkHeaders, validate({body: 'credential'}), ensureAuthenticated],
    function(req, res, next) {
      // FIXME: Replace credential signing key from config with key from db
      var options = {};
      options.privateKey = config.issuer.credentialSigningPrivateKey;
      options.publicKeyId = config.issuer.credentialSigningPublicKeyId;
      var credential = req.body;
      async.auto({
        generateId: function(callback) {
          api.generateCredentialId(callback);
        },
        issue: ['generateId', function(callback, results) {
          // insert generated id
          credential.id = results.generateId;
          api.issue(req.user.identity, credential, options, function(err) {
            if(err) {
              if(database.isDuplicateError(err)) {
                return callback(new BedrockError(
                  'The credential is a duplicate and could not be added.',
                  'DuplicateCredential', {
                    httpStatusCode: 409,
                    'public': true
                  }));
              }
              return callback(new BedrockError(
               'The credential could not be added.',
               'AddCredentialFailed', {
                 httpStatusCode: 400,
                 'public': true
               }, err));
            }
            callback();
          });
        }]
      }, function(err, result) {
        if(err) {
          return next(err);
        }
        // success
        res.set('Location', credential.id);
        res.status(201).json(credential);
      });
    });

  // FIXME: this endpoint should be secured
  app.post(
    '/credential-signer', [checkHeaders, validate({body: 'credential'})],
    function(req, res, next) {
      var privateKeyPem = config.issuer.credentialSigningKeys.privateKeyPem;
      var publicKeyId = config.issuer.credentialSigningKeys.publicKeyId;
      var credential = req.body;
      async.waterfall([
        function(callback) {
          jsigs.sign(credential, {
            privateKeyPem: privateKeyPem,
            creator: publicKeyId,
            algorithm: 'LinkedDataSignature2015'
          }, callback);
        },
        function(result, callback) {
          res.json(result);
          callback();
        }
      ], function(err) {
        if(err) {
          next(new BedrockError(
           'The credential could not be signed.',
           'SignCredentialFailed', {
             httpStatusCode: 400,
             'public': true
           }, err));
        }
      });
    });

  // FIXME: Temporary route for serving the public signing key
  app.get(config.issuer.endpoints.signingKeys, cors(), function(req, res) {
    var keyInfo = {
      '@context': 'https://w3id.org/identity/v1',
      id: config.issuer.credentialSigningKeys.publicKeyId,
      type: 'CryptographicKey',
      owner: config.server.baseUri + '/issuer',
      publicKeyPem: config.issuer.credentialSigningKeys.publicKeyPem
    };
    res.json(keyInfo);
  });

  // Serve the owner document if the expected response is ld+json
  // FIXME: Unused unless signature must be verified
  app.get('/issuer', cors(), rest.when.prefers.ld, function(req, res, next) {
    res.json({
      '@context': 'https://w3id.org/identity/v1',
      id: config.server.baseUri + '/issuer',
      type: ['Identity', 'https://w3id.org/openbadges#Identity'],
      publicKey: [config.issuer.credentialSigningKeys.publicKeyId]
    });
  });
});
