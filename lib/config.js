/*
 * Bedrock issuer configuration.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');

config.issuer = {};

config.issuer.endpoints = {};
config.issuer.endpoints.unsignedCredential = '/credentials/unsigned';
config.issuer.endpoints.signingKeys = '/keys/1';

// FIXME: this key needs to be stored in a safe place
config.issuer.credentialSigningKeys = {};
config.issuer.credentialSigningKeys.privateKeyPem =
  '-----BEGIN RSA PRIVATE KEY-----\n' +
  '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\n' +
  '-----END RSA PRIVATE KEY-----\n';
config.issuer.credentialSigningKeys.publicKeyId =
  config.server.baseUri + config.issuer.endpoints.signingKeys;
config.issuer.credentialSigningKeys.publicKeyPem =
  '-----BEGIN PUBLIC KEY-----\n' +
  'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAwpyOQ5Ewvontyp99s5os\n' +
  'iem/u0AuDNL5MaAHuLsFeDcEAJKacyGVSfeT8+9EQHCqm19VF2V5hSc1rAWF38uU\n' +
  '67g6IYNlVnbCcWKK2R/Q+3y/Jxdl3nteG2MoT9qLk/nlgOHdOsq/trZf/bKD6Lmq\n' +
  'SpFics2WojyGV8B6jKENbMoi1DidszuJvME+4XgA4DbKTXhltxtadSLfJDcl4OWB\n' +
  'm7NyJjNf6Bdw2uf/N9slhDJPTFO2l7cBGG32E9rgBKzP78RBotZA/Ri+WSGIQ/Bb\n' +
  'IjScjRhRrnigsWyhZaWR3znzPVuw4yG/Jd9c8GwECEgryzCFFFb/b0W0XbN/d9cd\n' +
  'jSWDOqnRPQdRlKtNlw9AOUmz0cRmYc5MNeXSkdCVWtGmpzRJCMmDTpuTNHKmTbOQ\n' +
  '9x6kzWRTZyOcmj3BoxKRve5X6/sG10D3rKSyumi+cttnFUgqHFgvIBPNCyBN3Bjz\n' +
  'XCkumjBUS3fJJlcfFvjYveRMDojDrFfkdChkn2HaBIhl4hqa1k3e6ulYbMt3atap\n' +
  'Iy9UetykVP2MBYEL3uuoqz7niic209X9+Iz61M/8mxRLgVbkPhM+gGd6ulCpS8W0\n' +
  '7LFPfjd76yyDxTh+r35kKNDi7VQ/5PXOz+MlCJQ6deRlJjh9XLPdX/xCPMEUTMqZ\n' +
  'kcuah3PMp2FpdpqjfchVSYkCAwEAAQ==\n' +
  '-----END PUBLIC KEY-----\n';

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
