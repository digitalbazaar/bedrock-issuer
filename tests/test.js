/*
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
 /* globals after, afterEach, before, beforeEach, it, process, describe,
    require, should */
 /* jshint -W030, -W097 */
'use strict';

var async = require('async');
var bedrock = require('bedrock');
var config = bedrock.config;
var brIdentity = require('bedrock-identity');
// var database = require('bedrock-mongodb');
var request = require('request');
var https = require('https');
var httpSignature = require('http-signature');
var request = require('request');
var store = require('bedrock-credentials-mongodb');
var database = require('bedrock-credentials-mongodb').database;
var validation = require('bedrock-validation');
// node 10.x limits number of simultaneous connections to the same host to 5
https.globalAgent.maxSockets = 50;
var identities = config.issuer.identities;

describe('bedrock-issuer', function() {
  before('Prepare the database', function(done) {
    prepareDatabase(done);
  });
  after('Remove test data', function(done) {
    removeCollections(done);
  });

  describe('REST API', function() {
    // NOTE: the claim.id used here currently exists at authorization.io
    var unsignedCredentialTemplate = {
      '@context': 'https://w3id.org/identity/v1',
      issuer: 'did:someIssuer12345',
      type: ['Credential', 'BirthDateCredential'],
      name: 'Birth Date Credential',
      image: 'https://images.com/verified-email-badge',
      issued: '2013-06-17T11:11:11Z',
      claim: {
        id: 'did:32e89321-a5f1-48ff-8ec8-a4112be1215c',
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
    // this credential is missing id property in claim
    var defectiveCredentialTemplate = {
      '@context': 'https://w3id.org/identity/v1',
      issuer: 'did:someIssuer12345',
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
    function createUniqueCredential() {
      var newCredential = bedrock.tools.clone(unsignedCredentialTemplate);
      return newCredential;
    }

    // generate credentials with unique ids for testing
    var defectiveCredential1 = bedrock.tools.clone(defectiveCredentialTemplate);
    defectiveCredential1.id = testBaseUri + bedrock.tools.uuid();
    var unsignedCredentialDuplicateTest = createUniqueCredential();
    var originalTlsRejectSetting = null;

    beforeEach(function(done) {
      originalTlsRejectSetting = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
      done();
    });

    afterEach(function(done) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = originalTlsRejectSetting;
      done();
    });

    it('should return 400 if the request is not signed', function(done) {
      var uniqueCredential = createUniqueCredential();
      var postData = JSON.stringify(uniqueCredential);
      var options = postOptions(postData);
      var req = https.request(options, function(res) {
        var body = '';
        res.on('data', function(chunk) {body += chunk;});
        res.on('end', function() {
          res.statusCode.should.equal(400);
          var parsedBody = JSON.parse(body);
          should.exist(parsedBody.type);
          parsedBody.type.should.equal('PermissionDenied');
          done();
        });
      });
      req.end(postData);
    });

    it('should accept a single RSA 4096 signed request', function(done) {
      var uniqueCredential = createUniqueCredential();
      var postData = JSON.stringify(uniqueCredential);
      var options = postOptions(postData);
      var req = https.request(options, function(res) {
        var body = '';
        res.on('data', function(chunk) {body += chunk;});
        res.on('end', function() {
          res.statusCode.should.equal(201);
          var parsedBody = JSON.parse(body);
          should.exist(parsedBody.id);
          findCredential(parsedBody.id, function(err, result) {
            should.not.exist(err);
            result.should.equal(1);
            done();
          });
        });
      });
      httpSignature.sign(req, {
        key: identities.rsa4096.keys.privateKey.privateKeyPem,
        keyId: identities.rsa4096.keys.publicKey.id,
        headers: ['date', 'host', 'request-line']
      });
      req.end(postData);
    });

    it('should accept a RSA 4096 signed request using \'request\' module',
      function(done) {
        var uniqueCredential = createUniqueCredential();
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          method: 'POST',
          body: uniqueCredential,
          json: true,
          httpSignature: {
            key: identities.rsa4096.keys.privateKey.privateKeyPem,
            keyId: identities.rsa4096.keys.publicKey.id,
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

    it('should accept a single RSA 2048 signed request', function(done) {
      var uniqueCredential = createUniqueCredential();
      var postData = JSON.stringify(uniqueCredential);
      var options = postOptions(postData);
      var req = https.request(options, function(res) {
        var body = '';
        res.on('data', function(chunk) {body += chunk;});
        res.on('end', function() {
          res.statusCode.should.equal(201);
          var parsedBody = JSON.parse(body);
          should.exist(parsedBody.id);
          findCredential(parsedBody.id, function(err, result) {
            should.not.exist(err);
            result.should.equal(1);
            done();
          });
        });
      });
      httpSignature.sign(req, {
        key: identities.rsa2048.keys.privateKey.privateKeyPem,
        keyId: identities.rsa2048.keys.publicKey.id,
        headers: ['date', 'host', 'request-line']
      });
      req.end(postData);
    });

    it('should return 406 if the accept header is not set properly',
      function(done) {
        var uniqueCredential = createUniqueCredential();
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          headers: {
            'Accept': 'text/csv'
          },
          body: JSON.stringify(uniqueCredential),
          httpSignature: {
            key: identities.rsa4096.keys.privateKey.privateKeyPem,
            keyId: identities.rsa4096.keys.publicKey.id,
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

    it('should return 415 if the Content-Type header is not set properly',
      function(done) {
        var uniqueCredential = createUniqueCredential();
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'text/csv'
          },
          body: JSON.stringify(uniqueCredential),
          httpSignature: {
            key: identities.rsa4096.keys.privateKey.privateKeyPem,
            keyId: identities.rsa4096.keys.publicKey.id,
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
      var postData = JSON.stringify(defectiveCredential1);
      var options = postOptions(postData);
      var req = https.request(options, function(res) {
        var body = '';
        res.on('data', function(chunk) {body += chunk;});
        res.on('end', function() {
          res.statusCode.should.equal(400);
          var parsedBody = JSON.parse(body);
          should.exist(parsedBody.type);
          parsedBody.type.should.equal('ValidationError');
          should.exist(parsedBody.details.errors[0].details.path);
          parsedBody.details.errors[0].details.path = 'claim.id';
          done();
        });
      });
      httpSignature.sign(req, {
        key: identities.rsa2048.keys.privateKey.privateKeyPem,
        keyId: identities.rsa2048.keys.publicKey.id,
        headers: ['date', 'host', 'request-line']
      });
      req.end(postData);
    });

    // FIXME: what qualifies as a duplicate credential?
    it.skip('should return 409 on a duplicate credential', function(done) {
      async.series([
        function(callback) {
          var postData = JSON.stringify(unsignedCredentialDuplicateTest);
          var options = postOptions(postData);
          var req = https.request(options, function(res) {
            res.statusCode.should.equal(200);
            callback(null, 'one');
          });
          httpSignature.sign(req, {
            key: identities.rsa2048.keys.privateKey.privateKeyPem,
            keyId: identities.rsa2048.keys.publicKey.id,
            headers: ['date', 'host', 'request-line']
          });
          req.end(postData);
        },
        function(callback) {
          findCredential(unsignedCredentialDuplicateTest.id,
            function(err, result) {
              should.not.exist(err);
              result.should.equal(1);
              callback();
            });
        },
        // Send the same credential again and expect a 409 response
        function(callback) {
          var postData = JSON.stringify(unsignedCredentialDuplicateTest);
          var options = postOptions(postData);
          var req = https.request(options, function(res) {
            var body = '';
            res.on('data', function(chunk) {body += chunk;});
            res.on('end', function() {
              res.statusCode.should.equal(409);
              var parsedBody = JSON.parse(body);
              should.exist(parsedBody.type);
              parsedBody.type.should.equal('DuplicateCredential');
              findCredential(unsignedCredentialDuplicateTest.id,
                function(err, result) {
                  should.not.exist(err);
                  result.should.equal(1);
                  callback(null, 'two');
                });
            });
          });
          httpSignature.sign(req, {
            key: identities.rsa2048.keys.privateKey.privateKeyPem,
            keyId: identities.rsa2048.keys.publicKey.id,
            headers: ['date', 'host', 'request-line']
          });
          req.end(postData);
        }
      ], function(err, result) {
        done();
      });
    });

    // the key used to sign this request has been revoked
    it('should return 400 on a revoked signing key', function(done) {
      var uniqueCredential = createUniqueCredential();
      var postData = JSON.stringify(uniqueCredential);
      var options = postOptions(postData);
      var req = https.request(options, function(res) {
        var body = '';
        res.on('data', function(chunk) {body += chunk;});
        res.on('end', function() {
          res.statusCode.should.equal(400);
          var parsedBody = JSON.parse(body);
          should.exist(parsedBody.cause.details.publicKey.id);
          should.exist(parsedBody.cause.details.publicKey.revoked);
          done();
        });
      });
      httpSignature.sign(req, {
        key: identities.rsa1024Revoked.keys.privateKey.privateKeyPem,
        keyId: identities.rsa1024Revoked.keys.publicKey.id,
        headers: ['date', 'host', 'request-line']
      });
      req.end(postData);
    });

    // The public/private keys used to sign this request do not match
    // the signature is invalid
    // FIXME: the cause in the message is null, OK?
    it('should return 400 if the request signature cannot be validated',
      function(done) {
        var uniqueCredential = createUniqueCredential();
        var postData = JSON.stringify(uniqueCredential);
        var options = postOptions(postData);
        var req = https.request(options, function(res) {
          var body = '';
          res.on('data', function(chunk) {body += chunk;});
          res.on('end', function() {
            res.statusCode.should.equal(400);
            var parsedBody = JSON.parse(body);
            should.exist(parsedBody.type);
            parsedBody.type.should.equal('PermissionDenied');
            done();
          });
        });
        httpSignature.sign(req, {
          key: identities.rsa2048Invalid.keys.privateKey.privateKeyPem,
          keyId: identities.rsa2048Invalid.keys.publicKey.id,
          headers: ['date', 'host', 'request-line']
        });
        req.end(postData);
      });

    // this test sends a properly signed request, but the public key is not
    //  registered with the server
    // FIXME: the cause on the returned object is null, is that desired?
    it('should return 400 if an unknown public key is referenced in the header',
      function(done) {
        var uniqueCredential = createUniqueCredential();
        var postData = JSON.stringify(uniqueCredential);
        var options = postOptions(postData);
        var req = https.request(options, function(res) {
          var body = '';
          res.on('data', function(chunk) {body += chunk;});
          res.on('end', function() {
            res.statusCode.should.equal(400);
            var parsedBody = JSON.parse(body);
            should.exist(parsedBody.type);
            parsedBody.type.should.equal('PermissionDenied');
            done();
          });
        });
        httpSignature.sign(req, {
          key: config.issuer.keysUnknown
            .rsa1024Unknown.privateKey.privateKeyPem,
          keyId: config.issuer.keysUnknown.rsa1024Unknown.publicKey.id,
          headers: ['date', 'host', 'request-line']
        });
        req.end(postData);
      });

    // only the date header will be signed with http-signature
    it('should return 400 if the proper headers are not signed',
      function(done) {
        var uniqueCredential = createUniqueCredential();
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          json: true,
          body: uniqueCredential,
          httpSignature: {
            key: identities.rsa4096.keys.privateKey.privateKeyPem,
            keyId: identities.rsa4096.keys.publicKey.id,
            headers: ['date']
          }
        };
        request.post(options, function(err, res, body) {
          should.not.exist(err);
          res.statusCode.should.equal(400);
          should.exist(body);
          body.should.be.an('object');
          body.cause.type.should.equal('HttpSignature.MissingHeaders');
          done();
        });
      });

    // this test specified a date header outside the clock skew window
    // the datetime in the header is advanced by 302 seconds
    // FIXME: Only a statusCode, but no body is returned on error.
    it('should return 400 if request is outside of +/- 300 sec clock skew',
      function(done) {
        var uniqueCredential = createUniqueCredential();
        var postData = JSON.stringify(uniqueCredential);
        var options = {
          host: config.server.domain,
          port: config.server.port,
          path: config.issuer.endpoints.unsignedCredential,
          method: 'POST',
          headers: {
            'Content-Type': 'application/ld+json',
            'Content-Length': postData.length,
            'date': _rfc1123(302),
            'Accept': 'application/ld+json'
          }
        };
        var req = https.request(options, function(res) {
          var body = '';
          res.on('data', function(chunk) {body += chunk;});
          res.on('end', function() {
            res.statusCode.should.equal(400);
            var parsedBody = JSON.parse(body);
            should.exist(parsedBody.type);
            parsedBody.type.should.equal('PermissionDenied');
            done();
          });
        });
        httpSignature.sign(req, {
          key: identities.rsa2048.keys.privateKey.privateKeyPem,
          keyId: identities.rsa2048.keys.publicKey.id,
          headers: ['date', 'host', 'request-line']
        });
        req.end(postData);
      });

    describe('Organization Operations', function() {
      it('should accept a credential from a member', function(done) {
        var uniqueCredential = createUniqueCredential();
        uniqueCredential.issuer = identities.organizationAlpha.identity.id;
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

      it('should not accept a credential from a non-member', function(done) {
        var uniqueCredential = createUniqueCredential();
        uniqueCredential.issuer = identities.organizationAlpha.identity.id;
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
  async.forEachOf(identities, function(identity, key, callbackA) {
    async.parallel([
      function(callback) {
        brIdentity.insert(null, identity.identity, callback);
      },
      function(callback) {
        brIdentity.addPublicKey(null, identity.keys.publicKey, callback);
      }
    ], callbackA);
  }, function(err) {
    if(err) {
      if(!database.isDuplicateError(err)) {
        // duplicate error means test data is already loaded
        return done(err);
      }
    }
    // revoke one credential for test
    brIdentity.revokePublicKey(null,
      identities.rsa1024Revoked.keys.publicKey.id,
        function(err, publicKey) {
          if(err) {
            if(err.name !== 'NotFound') {
              // NotFound error occurs if key has already been revoked
              return done(err);
            }
          }
          done();
        }
    );
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
