/*
 * Bedrock issuer configuration.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;

config.issuer = {};

// credential permissions
var permissions = config.permission.permissions;
permissions.CREDENTIAL_ISSUE = {
  id: 'CREDENTIAL_ISSUE',
  label: 'Credential Issuance',
  comment: 'Required to issue Credentials.'
};
permissions.CREDENTIAL_CLAIM = {
  id: 'CREDENTIAL_CLAIM',
  label: 'Claim Credential',
  comment: 'Required to claim a Credential.'
};
