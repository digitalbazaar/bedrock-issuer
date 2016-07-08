/*
 * Bedrock issuer configuration.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');

config.issuer = {};

config.issuer.endpoints = {};
config.issuer.endpoints.unsignedCredential = '/credentials';

// credential permissions
var permissions = config.permission.permissions;

permissions.CREDENTIAL_ISSUE = {
  id: 'CREDENTIAL_ISSUE',
  label: 'Credential Issuance',
  comment: 'Required to issue Credentials.'
};
permissions.CREDENTIAL_REVOKE = {
  id: 'CREDENTIAL_REVOKE',
  label: 'Revoke Credential',
  comment: 'Required to revoke a Credential.'
};
permissions.CREDENTIAL_CLAIM = {
  id: 'CREDENTIAL_CLAIM',
  label: 'Claim Credential',
  comment: 'Required to claim a Credential.'
};

// Extend default identity model
config.identity.fields.push(
  'identity.sysPreferences',
  'identity.sysPreferences.credentialSigningKey'
);

// view variables
config.views.brand.name = 'bedrock-issuer';
config.views.vars.baseUri = config.server.baseUri;
config.views.vars.title = config.views.brand.name;
config.views.vars.siteTitle = config.views.brand.name;
config.views.vars.supportDomain = config.server.domain;
config.views.vars.style.brand.alt = config.views.brand.name;
