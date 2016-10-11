/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* globals after, before, it, process, describe,
  require, should */
/* jshint node: true, -W030, -W097 */
'use strict';

var async = require('async');
var bedrock = require('bedrock');
var brKey = require('bedrock-key');
var config = bedrock.config;
var helpers = require('./helpers');
var mockData = require('./mock.data');
var request = require('request');
request = request.defaults({json: true, strictSSL: false});
var uuid = require('uuid').v4;

describe('bedrock-issuer', function() {
  before('Prepare the database', function(done) {
    helpers.prepareDatabase(mockData, done);
  });
  after('Remove test data', function(done) {
    helpers.removeCollections(done);
  });
  describe('configuration', () => {
    it('defines a CredentialIssue event', done => {
      config['event-log'].eventTypes.CredentialIssue.should.be.an('object');
      done();
    });
  });
  describe('HTTP API', function() {
    var unsignedCredentialTemplate = {
      '@context': 'https://w3id.org/credentials/v1',
      issuer: mockData.identities.organizationAlpha.identity.id,
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
      issuer: mockData.identities.organizationAlpha.identity.id,
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
      var issuerId = mockData.identities.issuerAlpha.identity.id;
      var uniqueCredential = createUniqueCredential(issuerId);
      var options = {
        url: config.server.baseUri +
          config.issuer.endpoints.unsignedCredential,
        body: uniqueCredential
      };
      request.post(options, function(err, res, body) {
        res.statusCode.should.equal(400);
        should.exist(body);
        should.exist(body.type);
        body.type.should.equal('PermissionDenied');
        done();
      });
    });

    it('should issue a credential', function(done) {
      var issuerId = mockData.identities.issuerAlpha.identity.id;
      var uniqueCredential = createUniqueCredential(issuerId);
      var options = {
        url: config.server.baseUri + config.issuer.endpoints.unsignedCredential,
        body: uniqueCredential,
        httpSignature: {
          key: mockData.identities.issuerAlpha.keys.privateKey.privateKeyPem,
          keyId: mockData.identities.issuerAlpha.keys.publicKey.id,
          headers: ['date', 'host', 'request-line']
        }
      };
      request.post(options, function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(201);
        should.exist(body.id);
        helpers.findCredential(body.id, function(err, result) {
          should.not.exist(err);
          result.should.equal(1);
          done();
        });
      });
    });

    it('emits a CredentialIssue event after issuing a credential', done => {
      var credentialIssueEvent;
      bedrock.events.on(`bedrock-issuer.credential.CredentialIssue`, e => {
        credentialIssueEvent = e;
      });
      var issuerId = mockData.identities.issuerAlpha.identity.id;
      var uniqueCredential = createUniqueCredential(issuerId);
      var options = {
        url: config.server.baseUri + config.issuer.endpoints.unsignedCredential,
        body: uniqueCredential,
        httpSignature: {
          key: mockData.identities.issuerAlpha.keys.privateKey.privateKeyPem,
          keyId: mockData.identities.issuerAlpha.keys.publicKey.id,
          headers: ['date', 'host', 'request-line']
        }
      };
      request.post(options, function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(201);
        credentialIssueEvent.type.should.equal('CredentialIssue');
        credentialIssueEvent.date.should.be.a('string');
        credentialIssueEvent.resource
          .should.have.same.members([body.id]);
        credentialIssueEvent.issuer.should.equal(issuerId);
        credentialIssueEvent.actor.should.equal(issuerId);
        done();
      });
    });

    it('should return 400 if issuer has no signing key', function(done) {
      var issuerId = mockData.identities.issuerBeta.identity.id;
      var uniqueCredential = createUniqueCredential(issuerId);
      var options = {
        url: config.server.baseUri +
          config.issuer.endpoints.unsignedCredential,
        method: 'POST',
        body: uniqueCredential,
        json: true,
        httpSignature: {
          key: mockData.identities.issuerBeta.keys.privateKey.privateKeyPem,
          keyId: mockData.identities.issuerBeta.keys.publicKey.id,
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
      var keyId = mockData.identities.issuerGamma.identity.sysPreferences
        .credentialSigningKey;
      var issuerId = mockData.identities.issuerGamma.identity.id;
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
              key: mockData.identities.issuerGamma
                .keys[1].privateKey.privateKeyPem,
              keyId: mockData.identities.issuerGamma.keys[1].publicKey.id,
              headers: ['date', 'host', 'request-line']
            }
          };
          request(options, function(err, res) {
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
        var issuerId = mockData.identities.issuerAlpha.identity.id;
        var uniqueCredential = createUniqueCredential(issuerId);
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          headers: {
            'Accept': 'text/csv'
          },
          body: JSON.stringify(uniqueCredential),
          json: false,
          httpSignature: {
            key: mockData.identities.issuerAlpha.keys.privateKey.privateKeyPem,
            keyId: mockData.identities.issuerAlpha.keys.publicKey.id,
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
        var issuerId = mockData.identities.issuerAlpha.identity.id;
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
            key: mockData.identities.issuerAlpha.keys.privateKey.privateKeyPem,
            keyId: mockData.identities.issuerAlpha.keys.publicKey.id,
            headers: ['date', 'host', 'request-line']
          }
        };
        request.post(options, function(err, res) {
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
          key: mockData.identities.issuerAlpha.keys.privateKey.privateKeyPem,
          keyId: mockData.identities.issuerAlpha.keys.publicKey.id,
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
        var issuerId = mockData.identities.issuerAlpha.identity.id;
        var uniqueCredential = createUniqueCredential(issuerId);
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          headers: {
            'date': helpers.rfc1123(302)
          },
          method: 'POST',
          body: uniqueCredential,
          json: true,
          httpSignature: {
            key: mockData.identities.issuerAlpha.keys.privateKey.privateKeyPem,
            keyId: mockData.identities.issuerAlpha.keys.publicKey.id,
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
        var issuerId = mockData.identities.organizationAlpha.identity.id;
        var uniqueCredential = createUniqueCredential(issuerId);
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          method: 'POST',
          body: uniqueCredential,
          json: true,
          httpSignature: {
            key: mockData.identities.organizationAlphaMember
              .keys.privateKey.privateKeyPem,
            keyId: mockData.identities.organizationAlphaMember
              .keys.publicKey.id,
            headers: ['date', 'host', 'request-line']
          }
        };
        request(options, function(err, res, body) {
          should.not.exist(err);
          res.statusCode.should.equal(201);
          should.exist(body.id);
          helpers.findCredential(body.id, function(err, result) {
            should.not.exist(err);
            result.should.equal(1);
            done();
          });
        });
      });

      // an identity without appropriate permissions should not be able to
      // issue a credential on behalf of another identity
      it('should not accept a credential from a non-member', function(done) {
        var issuerId = mockData.identities.organizationAlpha.identity.id;
        var uniqueCredential = createUniqueCredential(issuerId);
        var options = {
          url: config.server.baseUri +
            config.issuer.endpoints.unsignedCredential,
          method: 'POST',
          body: uniqueCredential,
          json: true,
          httpSignature: {
            key: mockData.identities.organizationAlphaNonMember
              .keys.privateKey.privateKeyPem,
            keyId: mockData.identities.organizationAlphaNonMember
              .keys.publicKey.id,
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
