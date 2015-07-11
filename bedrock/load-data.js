/*
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

var async = require('async');
var bedrock = require('bedrock');
var store = require('bedrock-credentials-mongodb');

var credentialTemplate = {
  '@context': 'https://w3id.org/identity/v1',
  issuer: 'did:035ac948-6bba-44e5-8d79-ccf69fa02ec2',
  type: [
    'Credential',
    'BirthDateCredential'
  ],
  name: 'Birth Date Credential',
  image: 'https://images.com/verified-email-badge',
  issued: '2013-06-17T11:11:11Z',
  claim: {
    id: 'did:e572e76f-e0a0-473b-b02a-70307748b6ab',
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
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-07-24T12:48:38Z',
    creator: 'https://example.com/keys/1',
    signatureValue: 'lRBljDguLA316oTkXoHPxSFYziXTvSZn1Ap2IEZkDc0F93V5BN' +
      'jHXtC+YS7SbwnYfgBb2d4WnvXDSxzGboAEEw/Jcc2/rz0uqfU1/Jbwps5pLMWnHS/' +
      '5JY+9PPbHNS8PZSeonpEH2hTvK+ofv6CVu7voF3PK3q/Jw3tjmJ88XTA='
  }
};

var testBaseUri = 'https://example.com/credentials/';
function createUniqueCredential() {
  var newCredential = bedrock.tools.clone(credentialTemplate);
  newCredential.id = testBaseUri + bedrock.tools.uuid();
  return newCredential;
};

function insertTestData(numberOfRecords, callback) {
  async.times(numberOfRecords, function(n, next) {
    store.provider.insert(
      null, createUniqueCredential(), function(err, result) {
        next(err, result);
      }
    );
  }, callback);
};

bedrock.events.on('bedrock-mongodb.ready', function(callback) {
  insertTestData(1, callback);
});
