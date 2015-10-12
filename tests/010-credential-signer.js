/*
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
 /* global require, process, describe, it, should */

'use strict';

var bedrock = require('bedrock');
var config = bedrock.config;
var request = require('request');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// FIXME: this is a temporary service that will be secured
describe('Unauthenticated signing requests', function() {
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

  it('should sign a credential', function(done) {
    request({
      url: config.server.baseUri + '/credential-signer',
      method: 'POST',
      json: true,
      body: unsignedCredentialTemplate
    }, function(err, res, body) {
      should.not.exist(err);
      should.exist(res.statusCode);
      res.statusCode.should.equal(200);
      should.exist(body);
      body.should.be.an('object');
      should.exist(body.signature);
      body.signature.should.be.an('object');
      should.exist(body.signature.type);
      body.signature.type.should.be.a('string');
      body.signature.type.should.equal('GraphSignature2012');
      should.exist(body.signature.created);
      body.signature.created.should.be.a('string');
      should.exist(body.signature.creator);
      body.signature.creator.should.be.a('string');
      body.signature.creator.should.equal(
        config.issuer.credentialSigningKeys.publicKeyId);
      should.exist(body.signature.signatureValue);
      body.signature.signatureValue.should.be.a('string');
      done();
    });
  });

  it('should serve the public signing key', function(done) {
    request({
      url: config.server.baseUri + config.issuer.endpoints.signingKeys,
      method: 'GET',
      json: true
    }, function(err, res, body) {
      should.not.exist(err);
      should.exist(res.statusCode);
      res.statusCode.should.equal(200);
      should.exist(body);
      body.should.be.an('object');
      should.exist(body['@context']);
      body['@context'].should.be.a('string');
      body['@context'].should.equal('https://w3id.org/identity/v1');
      should.exist(body.publicKeyPem);
      body.publicKeyPem.should.be.a('string');
      body.publicKeyPem.should.equal(
        config.issuer.credentialSigningKeys.publicKeyPem);
      should.exist(body.id);
      body.id.should.be.a('string');
      body.id.should.equal(config.issuer.credentialSigningKeys.publicKeyId);
      should.exist(body.owner);
      body.owner.should.be.a('string');
      body.owner.should.equal(config.server.baseUri);
      done();
    });
  });

  describe('public key owner document', function() {
    it('should serve if accept header is application/ld+json', function(done) {
      request({
        url: config.server.baseUri,
        method: 'GET',
        json: true,
        headers: {
          'Accept': 'application/ld+json'
        }
      }, function(err, res, body) {
        should.not.exist(err);
        should.exist(res.statusCode);
        res.statusCode.should.equal(200);
        should.exist(body);
        body.should.be.an('object');
        should.exist(body['@context']);
        body['@context'].should.be.a('string');
        body['@context'].should.equal('https://w3id.org/identity/v1');
        should.exist(body.publicKey);
        body.publicKey.should.be.a('string');
        body.publicKey.should.equal(
          config.issuer.credentialSigningKeys.publicKeyId);
        done();
      });
    });

    it('should return 404 if accept header is text/html', function(done) {
      request({
        url: config.server.baseUri,
        method: 'GET',
        json: true,
        headers: {
          'Accept': 'text/html'
        }
      }, function(err, res, body) {
        should.not.exist(err);
        should.exist(res.statusCode);
        res.statusCode.should.equal(404);
        done();
      });
    });

    it('should return 406 if header is not properly set', function(done) {
      request({
        url: config.server.baseUri,
        method: 'GET',
        json: true,
        headers: {
          'Accept': 'text/csv'
        }
      }, function(err, res, body) {
        should.not.exist(err);
        should.exist(res.statusCode);
        res.statusCode.should.equal(406);
        should.exist(body);
        body.should.be.an('object');
        should.exist(body.message);
        body.message.should.be.a('string');
        should.exist(body.details);
        body.details.should.be.an('object');
        should.exist(body.details.accepted);
        body.details.accepted.should.be.a('string');
        should.exist(body.details.acceptable);
        body.details.acceptable.should.be.an('array');
        done();
      });
    });
  });
});
