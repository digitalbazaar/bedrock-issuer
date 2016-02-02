#!/usr/bin/node 
/*
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
'use strict';

var async = require('async');
var bedrock = require('bedrock');
var request = require('request');
var fs = require('fs');

// test credential to issue
var unsignedCredential = {
  '@context': [
    'https://w3id.org/identity/v1',
    'https://w3id.org/credentials/v1',
    {
      'br': 'urn:bedrock:'
    }
  ],
  // set with issuer option
  issuer: null,
  type: ['Credential', 'br:test:BirthDateCredential'],
  // extended with name option
  name: 'Birth Date Credential',
  image: 'https://example.com/credential',
  // now or set with date option
  issued: null,
  claim: {
    // set with recipient (or issuer) option
    id: null,
    birthDate: '1977-05-25T00:00:00Z',
    birthPlace: {
      address: {
        type: 'PostalAddress',
        streetAddress: '100 Main St',
        addressLocality: 'Springfield',
        addressRegion: 'XY',
        postalCode: '98765-4321'
      }
    }
  }
};

bedrock.events.on('bedrock-cli.init', function() {
  // add a new subcommand executed via: node project.js debug
  bedrock.program
    .option('-k, --strict-ssl', 'Strict SSL.')
    .option('-n, --cred-name <name>', 'Credential name extension.')
    .option('--key-id <key-id>', 'Public key ID.')
    .option('--key-pem <key-file>', 'Private key PEM file.')
    .option('--recipient <recipient>', 'Recipient ID (default to issuer).')
    .option('--issuer <issuer>', 'Issuer ID.')
    .option('--date <date>', 'Issue date.')
    .option('--endpoint <endpoint>', 'Credential signing endpoint.');
});

bedrock.events.on('bedrock-cli.ready', function() {
  if(!bedrock.program.keyId) {
    throw new Error('No key ID specified.');
  }
  if(!bedrock.program.keyPem) {
    throw new Error('No key PEM file specified.');
  }
  if(!bedrock.program.endpoint) {
    throw new Error('No credential signing endpoint specified.');
  }
  if(!bedrock.program.issuer) {
    throw new Error('No issuer ID specified.');
  }
  bedrock.program.strictSsl = !bedrock.program.strictSsl;
});

bedrock.events.on('bedrock.started', function() {
  async.auto({
    privateKeyPem: function(callback) {
      fs.readFile(bedrock.program.keyPem, 'utf8', callback);
    },
    unsigned: function(callback) {
      var unsigned = bedrock.tools.clone(unsignedCredential);
      unsigned.issuer = bedrock.program.issuer;
      unsigned.issued = bedrock.tools.w3cDate(bedrock.program.date);
      unsigned.claim.id = bedrock.program.recipient || bedrock.program.issuer;
      if(bedrock.program.credName) {
        unsigned.name = unsigned.name + ': ' + bedrock.program.credName;
      }
      callback(null, unsigned);
    },
    signed: ['privateKeyPem', 'unsigned', function(callback, results) {
      console.error('Unsigned:', JSON.stringify(results.unsigned, null, 2));
      var options = {
        url: bedrock.program.endpoint,
        method: 'POST',
        strictSSL: bedrock.program.strictSsl,
        body: results.unsigned,
        json: true,
        httpSignature: {
          key: results.privateKeyPem,
          keyId: bedrock.program.keyId,
          headers: ['date', 'host', 'request-line']
        }
      };
      request(options, function(err, res, body) {
        if(err) {
          return callback(err);
        }
        if(res.statusCode !== 201) {
          console.error('Error Body:', JSON.stringify(body, null, 2));
          callback(new Error('Bad status: ' + res.statusCode));
        }
        callback(null, body);
      });
    }]
  }, function(err, results) {
    if(err) {
      console.error('Error:', err);
    } else {
      console.error('Signed:', JSON.stringify(results.signed, null, 2));
    }
    bedrock.exit();
  });
});

bedrock.start();
