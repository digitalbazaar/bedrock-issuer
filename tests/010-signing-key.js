/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* jshint node: true */
/* globals describe, it, should */
'use strict';

var bedrock = require('bedrock');
var config = bedrock.config;
var request = require('request');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

// FIXME: this is a temporary service that will be secured
describe('Signing Key', function() {
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
      body.owner.should.equal(config.server.baseUri + '/issuer');
      done();
    });
  });

  // FIXME: this endpoint has been disabled
  describe('public key owner document', function() {
    it('should serve if accept header is application/ld+json', function(done) {
      request({
        url: config.server.baseUri + '/issuer',
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
        body.publicKey.should.be.an('array');
        body.publicKey[0].should.equal(
          config.issuer.credentialSigningKeys.publicKeyId);
        done();
      });
    });

    it('should return html if accept header is text/html', function(done) {
      request({
        url: config.server.baseUri + '/issuer',
        method: 'GET',
        json: true,
        headers: {
          'Accept': 'text/html'
        }
      }, function(err, res, body) {
        should.not.exist(err);
        should.exist(res.statusCode);
        res.statusCode.should.equal(200);
        done();
      });
    });
  });
});
