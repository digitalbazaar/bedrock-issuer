/*
 * Bedrock issuer test configuration.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');
var fs = require('fs');

config.mocha.tests.push(path.join(__dirname, 'mocha'));

// mongodb config
config.mongodb.name = 'bedrock_issuer_test';
config.mongodb.host = 'localhost';
config.mongodb.port = 27017;
config.mongodb.local.collection = 'bedrock_issuer_test';
// drop all collections on initialization
config.mongodb.dropCollections = {};
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];

// credential roles
var permissions = config.permission.permissions;
var roles = config.permission.roles;
roles['bedrock.credential.issuer'] = {
  id: 'bedrock.credential.issuer',
  label: 'Credential Issuer',
  comment: 'Role for credential issuers.',
  sysPermission: [
    permissions.CREDENTIAL_INSERT.id,
    permissions.CREDENTIAL_ISSUE.id,
    permissions.PUBLIC_KEY_ACCESS.id
  ]
};

// Use local copies of contexts
// constants
var constants = config.constants;
// Identity JSON-LD context URL and local copy
constants.IDENTITY_CONTEXT_V1_URL = 'https://w3id.org/identity/v1';
constants.CONTEXTS[constants.IDENTITY_CONTEXT_V1_URL] = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'contexts/identity-v1.jsonld'),
    {encoding: 'utf8'}));
// Credentials JSON-LD context URL and local copy
constants.CREDENTIALS_CONTEXT_V1_URL = 'https://w3id.org/credentials/v1';
constants.CONTEXTS[constants.CREDENTIALS_CONTEXT_V1_URL] = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, 'contexts/credentials-v1.jsonld'),
    {encoding: 'utf8'}));
