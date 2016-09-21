/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */

'use strict';

var async = require('async');
var brIdentity = require('bedrock-identity');
var brKey = require('bedrock-key');
var config = require('bedrock').config;
var database = require('bedrock-mongodb');
var store = require('bedrock-credentials-mongodb');
var uuid = require('uuid').v4;

var api = {};
module.exports = api;

api.createIdentity = function(options) {
  var userName = options.userName || uuid();
  var newIdentity = {
    id: config.server.baseUri + config['identity-http'].basePath +
      '/' + userName,
    type: 'Identity',
    sysSlug: userName,
    label: userName,
    email: userName + '@bedrock.dev',
    sysPassword: 'password',
    sysPublic: ['label', 'url', 'description'],
    sysResourceRole: [{
      sysRole: 'bedrock.credential.issuer',
      generateResource: 'id'
    }],
    url: config.server.baseUri,
    description: userName
  };
  if(options.credentialSigningKey) {
    newIdentity.sysPreferences = {
      credentialSigningKey: config.server.baseUri + config.key.basePath + '/' +
        options.credentialSigningKey
    };
  }
  return newIdentity;
};

api.createKeyPair = function(options) {
  var keyId = options.keyId || uuid();
  var fullKeyId = config.server.baseUri + config.key.basePath + '/' + keyId;
  var userName = options.userName;
  var publicKey = options.publicKey;
  var privateKey = options.privateKey;
  var ownerId = null;
  if(userName === 'rsa1024Unknown') {
    ownerId = '';
  } else {
    ownerId = config.server.baseUri + config['identity-http'].basePath +
      '/' + userName;
  }
  var newKeyPair = {
    publicKey: {
      '@context': 'https://w3id.org/identity/v1',
      id: fullKeyId,
      type: 'CryptographicKey',
      owner: ownerId,
      label: 'Signing Key 1',
      publicKeyPem: publicKey
    },
    privateKey: {
      type: 'CryptographicKey',
      owner: ownerId,
      label: 'Signing Key 1',
      publicKey: fullKeyId,
      privateKeyPem: privateKey
    }
  };
  if(options.isSigningKey) {
    newKeyPair.isSigningKey = true;
  }
  return newKeyPair;
};

// Insert identities and public keys used for testing into database
api.insertTestData = function(mockData, callback) {
  async.forEachOf(mockData.identities, function(identity, key, callback) {
    async.parallel([
      function(callback) {
        brIdentity.insert(null, identity.identity, callback);
      },
      function(callback) {
        if(identity.keys) {
          return async.each([].concat(identity.keys), function(k, callback) {
            if(k.isSigningKey) {
              return brKey.addPublicKey(
                null, k.publicKey, k.privateKey, callback);
            }
            brKey.addPublicKey(null, k.publicKey, callback);
          }, callback);
        }
        callback();
      }
    ], callback);
  }, function(err) {
    if(err) {
      if(!database.isDuplicateError(err)) {
        // duplicate error means test data is already loaded
        return callback(err);
      }
    }
    callback();
  });
};

api.removeCollections = function(callback) {
  var collectionNames = ['credentialProvider', 'identity', 'publicKey'];
  database.openCollections(collectionNames, function() {
    async.each(collectionNames, function(collectionName, callback) {
      database.collections[collectionName].remove({}, callback);
    }, callback);
  });
};

api.prepareDatabase = function(mockData, callback) {
  async.series([
    function(callback) {
      api.removeCollections(callback);
    },
    function(callback) {
      api.insertTestData(mockData, callback);
    }
  ], callback);
};

api.findCredential = function(credentialId, callback) {
  var query = {'credential.id': credentialId};
  store.provider.collection.count(query, {}, callback);
};

// allows to specify +/- offset in seconds
api.rfc1123 = function(offsetSeconds) {
  offsetSeconds == offsetSeconds || 0;
  var date = new Date(Date.now() + offsetSeconds * 1000);
  var months = ['Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'];
  var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getUTCDay()] + ', ' +
    _pad(date.getUTCDate()) + ' ' +
    months[date.getUTCMonth()] + ' ' +
    date.getUTCFullYear() + ' ' +
    _pad(date.getUTCHours()) + ':' +
    _pad(date.getUTCMinutes()) + ':' +
    _pad(date.getUTCSeconds()) +
    ' GMT';
};

function _pad(val) {
  if(parseInt(val, 10) < 10) {
    val = '0' + val;
  }
  return val;
}
