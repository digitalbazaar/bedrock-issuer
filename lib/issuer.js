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
var jsigs = require('jsonld-signatures')({
  inject: {jsonld: bedrock.jsonld}
});
var store = require('bedrock-credentials-mongodb');
var BedrockError = bedrock.util.BedrockError;
require('bedrock-express');

// load config defaults
require('./config');

// module permissions
var PERMISSIONS = bedrock.config.permission.permissions;

// module API
var api = {};
module.exports = api;

var logger = bedrock.loggers.get('app');

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
      store.insert(actor, results.sign, function(err, record) {
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
      database.collections.credential.update(
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
      database.collections.credential.update({
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


bedrock.events.on('bedrock-mongodb.ready', function(callback) {
  async.auto({
    createIndexes: function(callback) {
      // create indexes for claimed status
      database.createIndexes([{
        collection: 'credential',
        fields: {recipient: 1, 'credential.sysState': 1, id: 1},
        options: {unique: true, background: false}
      }, {
        collection: 'credential',
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

bedrock.events.on('bedrock.test.configure', function() {
  // load test config
  require('./test.config');
});

bedrock.events.on('bedrock-express.configure.routes', function(app) {
  // TODO: remove
  app.get('/', /*ensureAuthenticated,*/ function(req, res, next) {
    res.status(200).send('Issuer REST API');
  });
});
