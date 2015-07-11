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
var database = require('bedrock-mongodb');
var httpSignature = require('http-signature');
var identity = require('bedrock-identity');
var jsigs = require('jsonld-signatures')({
  inject: {jsonld: bedrock.jsonld}
});
var ensureAuthenticated = require('bedrock-passport').ensureAuthenticated;
var scheduler = require('bedrock-jobs');
// FIXME: bedrock-views is being included to correct express error handling
// https://github.com/digitalbazaar/bedrock-views/blob/master/lib/views.js#L373-L376
var views = require('bedrock-views');
var store = require('bedrock-credentials-mongodb');
var validate = require('bedrock-validation').validate;
// TODO: database should be exposed via store.database
var BedrockError = bedrock.util.BedrockError;
var config = bedrock.config;

require('bedrock-express');

// load config defaults
require('./config');

// module permissions
var PERMISSIONS = bedrock.config.permission.permissions;

// module API
var api = {};
module.exports = api;

var logger = bedrock.loggers.get('app');

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
    }
  }, function(err) {
    callback(err);
  });
});

bedrock.events.on('bedrock.test.configure', function() {
  // load test config
  require('./test.config');
});

/* Not needed
var forge = require('node-forge');
// FIXME: mock keypair should be removed
var gIssuerKeypair = forge.pki.rsa.generateKeyPair({bits: 512});
*/

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
    'application/json',
    'application/ld+json',
    'text/html'
  ];
  if(!req.accepts(acceptableContentTypes)) {
    res.status(406);
    res.write(JSON.stringify({
      message: 'Requested content types not acceptable.',
      details: {
        accepted: req.get('accept'),
        acceptable: acceptableContentTypes
      }
    }));
    res.end();
    return next();
  }
  if(acceptableContentTypes.indexOf(req.get('Content-Type')) == -1) {
    res.status(415).end();
    return next();
  }
  next();
};

function findCredentialByClaimId(claimId, callback) {
  console.log('CLAIMID:', claimId);
  query = {
    'credential.claim.id': claimId
  };
  store.provider.getAll(null, query, callback);
};

bedrock.events.on('bedrock-express.configure.routes', function(app) {
  // FIXME: determine proper endpoint
  app.get('/creds/claimid/:claimid', function(req, res, next) {
    var claimId = req.params.claimid;
    findCredentialByClaimId(claimId, function(err, results) {
      if(err) {
        return next(new BedrockError(
          'The credential could not be located.',
          'CredentialLookupFailed', {
            httpStatusCode: 400,
            'public': true
          }, err));
      }
      return res.json(results);
    });
  });
  // FIXME: this is a provisional endpoint and authentication is required
  app.put('/creds/:id', function(req, res, next) {
    var credentialId = req.params.id;
    console.log('BODY *****', credentialId, req.body);
    var now = Date.now();
    if(req.body.accepted) {
      var updateQuery = {id: credentialId};
      var updateParams = {
        $set: {
          'meta.updated': now,
          'meta.acceptance': {
            status: 'accepted',
            date: now
          }
        }
      };
      store.provider.collection.update(
        updateQuery, updateParams, function(err, result) {
          if(err) {
            return next(new BedrockError(
              'The credential could not be updated.',
              'UpdateCredentialFailed', {
                httpStatusCode: 400,
                'public': true
              }, err));
          }
          return res.json({status: 'OK'});
        });
    } else {
      return res.json({status: 'Nothing Updated'});
    }
  });
  // FIXME: This is a provisional endpoint
  app.post('/credentiallogin', function(req, res, next) {
    console.log('BODY:', req.body);
    var identity = JSON.parse(req.body.jsonPostData);
    views.getDefaultViewVars(req, function(err, vars) {
      // FIXME: this is likely the identity returned by the authentication
      // or at least verified signatures etc.
      vars.issuer = {};
      vars.issuer.identity = identity;
      vars.issuer.unsignedCredentialEndpoint =
        config.issuer.endpoints.unsignedCredential;
      res.render('index.html', vars);
    });
  });

  app.post(config.issuer.endpoints.unsignedCredential,
    [checkHeaders, validate({body:'credential'}), ensureAuthenticated],
    function(req, res, next) {
      // FIXME: Replace credential signing key from config with key from db
      var options = {};
      options.privateKey = config.issuer.credentialSigningPrivateKey;
      options.publicKeyId = config.issuer.credentialSigningPublicKeyId;
      var credential = req.body;
      api.issue(null, credential, options, function(err) {
        if(err) {
          if(database.isDuplicateError(err)) {
            return next(new BedrockError(
              'The credential is a duplicate and could not be added.',
              'DuplicateCredential', {
                httpStatusCode: 409,
                'public': true
              }));
          }
          return next(new BedrockError(
           'The credential could not be added.',
           'AddCredentialFailed', {
             httpStatusCode: 400,
             'public': true
           }, err));
        }
        // Success
        // TODO: Actual response is TBD
        res.status(200).json({location: credential.id});
      });
    });

/*
  // this code should not be needed because of the above app.post function
  // mock issuer credentials generator
  app.post('/credentials', function(req, res, next) {
    views.getDefaultViewVars(req, function(err, vars) {
      if(err) {
        return next(err);
      }
      var privateKeyPem =
        forge.pki.privateKeyToPem(gIssuerKeypair.privateKey);
      var targetDid = req.cookies.did;
      var identity = {
        '@context': 'https://w3id.org/identity/v1',
        id: targetDid,
        credential: {}
      };
      var credentials = req.body.credential;

      // sign each credential
      async.map(credentials, function(item, callback) {
        jsigs.sign(item['@graph'], {
          privateKeyPem: privateKeyPem,
          creator: config.server.baseUri + '/issuer/keys/1'
        }, function(err, signedCredential) {
          if(err) {
            return callback(err);
          }
          callback(null, {
            '@graph': signedCredential
          });
        });
      }, function(err, results) {
        if(err) {
          return next(err);
        }
        identity.credential = results;
        res.set('Content-Type', 'application/ld+json');
        res.status(200).json(identity);
      });
    });
  });
*/

  // mock issuer credentials storage acknowledgements
  app.post('/acknowledgements', function(req, res, next) {
    views.getDefaultViewVars(req, function(err, vars) {
      if(err) {
        return next(err);
      }
      try {
        if(req.body.jsonPostData) {
          var jsonPostData = JSON.parse(req.body.jsonPostData);
          if(jsonPostData) {
            vars.issuer = {};
            vars.issuer.storedCredential = jsonPostData;
          }
        }
      } catch(e) {
        return next(e);
      }
      //res.cookie('issuer', JSON.stringify(vars.issuer));
      res.render('index.html', vars);
    });
  });

});
