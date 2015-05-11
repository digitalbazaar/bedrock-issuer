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
        collection: 'credential',
        fields: {recipient: 1, 'credential.sysClaimed': 1, id: 1},
        options: {unique: true, background: false}
      }, {
        collection: 'credential',
        fields: {issuer: 1, 'credential.sysClaimed': 1, id: 1},
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

/**
 * Issues a Credential.
 *
 * @param actor the actor performing the action.
 * @param credential the Credential to issue.
 * @param [options] the options to use.
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

  // mark credential as unclaimed
  credential.sysClaimed = false;

  logger.debug('issuing credential', credential);

  async.auto({
    checkPermission: function(callback) {
      brPermission.checkPermission(
        actor, PERMISSIONS.CREDENTIAL_ISSUE,
        {resource: credential, translate: ['issuer']}, callback);
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
 * Claims a previously issued Credential.
 *
 * @param actor the actor performing the action.
 * @param id the ID of the Credential to claim.
 * @param callback(err) called once the operation completes.
 */
api.claim = function(actor, id, callback) {
  async.auto({
    checkPermission: function(callback) {
      api.checkPermission(
        actor, PERMISSIONS.CREDENTIAL_CLAIM, {resource: id}, callback);
    },
    claim: ['checkPermission', function(callback) {
      /*if(!record) {
        return callback(new BedrockError(
          'Credential not found.', 'NotFound',
          {id: id, httpStatusCode: 404, 'public': true}));
      }*/
      callback();
    }]
  }, function(err) {
    callback(err);
  });
};
