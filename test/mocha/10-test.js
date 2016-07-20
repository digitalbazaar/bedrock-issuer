/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* globals after, afterEach, before, beforeEach, it, process, describe,
  require, should */
/* jshint node: true, -W030, -W097 */
'use strict';

var async = require('async');
var bedrock = require('bedrock');
var brIdentity = require('bedrock-identity');
var brKey = require('bedrock-key');
var config = bedrock.config;
var database = require('bedrock-credentials-mongodb').database;
var identities = config.issuer.identities;
var request = require('request');
var store = require('bedrock-credentials-mongodb');
var uuid = require('uuid').v4;
var validation = require('bedrock-validation');

describe('bedrock-issuer', function() {
  before('Prepare the database', function(done) {
    prepareDatabase(done);
  });
  after('Remove test data', function(done) {
    removeCollections(done);
  });

  describe('HTTP API', function() {
    var unsignedCredentialTemplate = {
      '@context': 'https://w3id.org/credentials/v1',
      issuer: identities.organizationAlpha.identity.id,
      type: ['Credential', 'BirthDateCredential'],
      name: 'Birth Date Credential',
      image: 'https://images.com/verified-email-badge',
      issued: '2013-06-17T11:11:11Z',
      claim: {
        id: 'did:32e89321-a5f1-48ff-8ec8-a4112be1215c',
        'schema:birthDate': '2013-06-17T11:11:11Z'
      }
    };
    // this credential is missing id property in claim
    var defectiveCredentialTemplate = {
      '@context': 'https://w3id.org/identity/v1',
      issuer: identities.organizationAlpha.identity.id,
      recipient: 'did:someRecipient12345',
      type: ['Credential', 'BirthDateCredential'],
      name: 'Birth Date Credential',
      image: 'https://images.com/verified-email-badge',
      issued: '2013-06-17T11:11:11Z',
      claim: {
        birthDate: '1977-06-17T08:15:00Z',
        birthPlace: {
          address: {
            type: 'PostalAddress',
            streetAddress: '1000 Birthing Center Rd',
            addressLocality: 'San Francisco',
            addressRegion: 'CA',
            postalCode: '98888-1234'
          }
        }
      }
    };

    var testBaseUri = 'https://example.com/credentials/';
    function createUniqueCredential(issuerId) {
      var newCredential = bedrock.util.clone(unsignedCredentialTemplate);
      if(issuerId) {
        newCredential.issuer = issuerId;
      }
      return newCredential;
    }

    // generate credentials with unique ids for testing
    var defectiveCredential1 = bedrock.util.clone(defectiveCredentialTemplate);
    defectiveCredential1.id = testBaseUri + uuid();

    it('should return 400 if the request is not signed', function(done) {
      var issuerId = identities.issuerAlpha.identity.id;
      var uniqueCredential = createUniqueCredential(issuerId);
      var options = {
        url: config.server.baseUri +
          config.issuer.endpoints.unsignedCredential,
        method: 'POST',
        body: uniqueCredential,
        json: true
      };
      request(options, function(err, res, body) {
        res.statusCode.should.equal(400);
        should.exist(body);
        should.exist(body.type);
        body.type.should.equal('PermissionDenied');
        done();
      });
    });

    it('should issue a credential', function(done) {
      this.timeout(30000);
      var issuerId = identities.issuerAlpha.identity.id;
      var uniqueCredential = createUniqueCredential(issuerId);
      var options = {
        url: config.server.baseUri +
          config.issuer.endpoints.unsignedCredential,
        method: 'POST',
        body: uniqueCredential,
        json: true,
        httpSignature: {
          key: identities.issuerAlpha.keys.privateKey.privateKeyPem,
          keyId: identities.issuerAlpha.keys.publicKey.id,
          headers: ['date', 'host', 'request-line']
        }
      };
      request(options, function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(201);
        should.exist(body.id);
        findCredential(body.id, function(err, result) {
          should.not.exist(err);
          result.should.equal(1);
          done();
        });
      });
    });

    it('should return 400 if issuer has no signing key', function(done) {
      var issuerId = identities.issuerBeta.identity.id;
      var uniqueCredential = createUniqueCredential(issuerId);
      var options = {
        url: config.server.baseUri +
          config.issuer.endpoints.unsignedCredential,
        method: 'POST',
        body: uniqueCredential,
        json: true,
        httpSignature: {
          key: identities.issuerBeta.keys.privateKey.privateKeyPem,
          keyId: identities.issuerBeta.keys.publicKey.id,
          headers: ['date', 'host', 'request-line']
        }
      };
      request(options, function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(400);
        should.exist(body);
        should.exist(body.cause);
        should.exist(body.cause.type);
        body.cause.type.should.equal('NotFound');
        done();
      });
    });

    // the preferred signing key for this identity will be revoked
    // issuerGamma has two keys, one for authentication, and one for signing
    // credentials
    it('should return 400 on a revoked signing key', function(done) {
      var keyId = identities.issuerGamma.identity.sysPreferences
        .credentialSigningKey;
      var issuerId = identities.issuerGamma.identity.id;
      var uniqueCredential = createUniqueCredential(issuerId);
      async.auto({
        revokeKey: function(callback) {
          brKey.revokePublicKey(null, keyId, callback);
        },
        postRequest: ['revokeKey', function(callback) {
          var options = {
            url: config.server.baseUri +
              config.issuer.endpoints.unsignedCredential,
            method: 'POST',
            body: uniqueCredential,
            json: true,
            httpSignature: {
              key: identities.issuerGamma.keys[1].privateKey.privateKeyPem,
              keyId: identities.issuerGamma.keys[1].publicKey.id,
              headers: ['date', 'host', 'request-line']
            }
          };
          request(options, function(err, res, body) {
            should.not.exist(err);
            res.statusCode.should.equal(400);
            callback();
          });
        }]
      }, done);
    });

    // valid identity and keys, but `Accept` header is not set properly
    it('should return 406 if the accept header is not set properly',
      function(done) {
        var issuerId = identities.issuerAlpha.identity.id;
        var uniqueCredential = createUniqueCredential(issuerId);
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          headers: {
            'Accept': 'text/csv'
          },
          body: JSON.stringify(uniqueCredential),
          httpSignature: {
            key: identities.issuerAlpha.keys.privateKey.privateKeyPem,
            keyId: identities.issuerAlpha.keys.publicKey.id,
            headers: ['date', 'host', 'request-line']
          }
        };
        request.post(options, function(err, res, body) {
          should.not.exist(err);
          res.statusCode.should.equal(406);
          should.exist(body);
          body.should.be.a('string');
          body.should.contain('application/json');
          done();
        });
      });

    // valid identity and keys, but `Content-Type` header is not set properly
    it('should return 415 if the Content-Type header is not set properly',
      function(done) {
        var issuerId = identities.issuerAlpha.identity.id;
        var uniqueCredential = createUniqueCredential(issuerId);
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/csv'
          },
          body: JSON.stringify(uniqueCredential),
          httpSignature: {
            key: identities.issuerAlpha.keys.privateKey.privateKeyPem,
            keyId: identities.issuerAlpha.keys.publicKey.id,
            headers: ['date', 'host', 'request-line']
          }
        };
        request.post(options, function(err, res, body) {
          should.not.exist(err);
          res.statusCode.should.equal(415);
          done();
        });
      });

    // the malformed credential is missing the claim.id property
    it('should return 400 if credential is malformed', function(done) {
      var options = {
        url: config.server.baseUri +
          config.issuer.endpoints.unsignedCredential,
        method: 'POST',
        body: defectiveCredential1,
        json: true,
        httpSignature: {
          key: identities.issuerAlpha.keys.privateKey.privateKeyPem,
          keyId: identities.issuerAlpha.keys.publicKey.id,
          headers: ['date', 'host', 'request-line']
        }
      };
      request(options, function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(400);
        should.exist(body);
        should.exist(body.type);
        body.type.should.equal('ValidationError');
        should.exist(body.details.errors[0].details.path);
        body.details.errors[0].details.path = 'claim.id';
        done();
      });
    });

    // this test specified a date header outside the clock skew window
    // the datetime in the header is advanced by 302 seconds
    // TODO: this test belongs in bedrock passport
    it('should return 400 if request is outside of +/- 300 sec clock skew',
      function(done) {
        var issuerId = identities.issuerAlpha.identity.id;
        var uniqueCredential = createUniqueCredential(issuerId);
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          headers: {
            'date': _rfc1123(302)
          },
          method: 'POST',
          body: uniqueCredential,
          json: true,
          httpSignature: {
            key: identities.issuerAlpha.keys.privateKey.privateKeyPem,
            keyId: identities.issuerAlpha.keys.publicKey.id,
            headers: ['date', 'host', 'request-line']
          }
        };
        request.post(options, function(err, res, body) {
          should.not.exist(err);
          res.statusCode.should.equal(400);
          should.exist(body);
          should.exist(body.type);
          body.type.should.equal('PermissionDenied');
          done();
        });
      });

    // an identity with appropriate permissions should be able to issue a
    // credential on behalf of another identity
    // the identity authenticates as itself, but the `issuer` in the credential
    // is an organizational identity
    describe('Organization Operations', function() {
      it('should accept a credential from a member', function(done) {
        this.timeout(30000);
        var issuerId = identities.organizationAlpha.identity.id;
        var uniqueCredential = createUniqueCredential(issuerId);
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          method: 'POST',
          body: uniqueCredential,
          json: true,
          httpSignature: {
            key: identities.organizationAlphaMember
              .keys.privateKey.privateKeyPem,
            keyId: identities.organizationAlphaMember.keys.publicKey.id,
            headers: ['date', 'host', 'request-line']
          }
        };
        request(options, function(err, res, body) {
          should.not.exist(err);
          res.statusCode.should.equal(201);
          should.exist(body.id);
          findCredential(body.id, function(err, result) {
            should.not.exist(err);
            result.should.equal(1);
            done();
          });
        });
      });

      // an identity without appropriate permissions should not be able to
      // issue a credential on behalf of another identity
      it('should not accept a credential from a non-member', function(done) {
        var issuerId = identities.organizationAlpha.identity.id;
        var uniqueCredential = createUniqueCredential(issuerId);
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          method: 'POST',
          body: uniqueCredential,
          json: true,
          httpSignature: {
            key: identities.organizationAlphaNonMember
              .keys.privateKey.privateKeyPem,
            keyId: identities.organizationAlphaNonMember.keys.publicKey.id,
            headers: ['date', 'host', 'request-line']
          }
        };
        request(options, function(err, res, body) {
          should.not.exist(err);
          res.statusCode.should.equal(400);
          should.exist(body.type);
          body.type.should.equal('AddCredentialFailed');
          done();
        });
      });
    });
  }); // End REST API

});

// Insert identities and public keys used for testing into database
function insertTestData(done) {
  async.forEachOf(identities, function(identity, key, callback) {
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
        return done(err);
      }
    }
    done();
  });
}

function removeCollections(callback) {
  var collectionNames = ['credentialProvider', 'identity', 'publicKey'];
  database.openCollections(collectionNames, function(err) {
    async.each(collectionNames, function(collectionName, callback) {
      database.collections[collectionName].remove({}, callback);
    }, function(err) {
      callback(err);
    });
  });
}

function prepareDatabase(callback) {
  async.series([
    function(callback) {
      removeCollections(callback);
    },
    function(callback) {
      insertTestData(callback);
    }
  ], function(err) {
    callback(err);
  });
}

function findCredential(credentialId, callback) {
  var query = {'credential.id': credentialId};
  store.provider.collection.count(query, {}, function(err, result) {
    if(err) {
      return callback(err);
    }
    callback(null, result);
  });
}

//--- Internal Functions

function _pad(val) {
  if(parseInt(val, 10) < 10) {
    val = '0' + val;
  }
  return val;
}

// allows to specify +/- offset in seconds
function _rfc1123(offsetSeconds) {
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
}

function postOptions(postData) {
  postData = postData || '';
  var options = {
    host: config.server.domain,
    port: config.server.port,
    path: config.issuer.endpoints.unsignedCredential,
    method: 'POST',
    headers: {
      'Content-Type': 'application/ld+json',
      'Content-Length': postData.length,
      'Accept': 'application/ld+json'
    }
  };
  return options;
}
