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
config.issuer.endpoints.signingKey = '/keys/1';

// FIXME: this key needs to be stored in a safe place
config.issuer.credentialSigningKeys = {};
config.issuer.credentialSigningKeys.privateKeyPem =
  '-----BEGIN RSA PRIVATE KEY-----\n' +
  'MIIEpQIBAAKCAQEAtTNN2uGiHW1EopfHvxWdIBUcZ5i881ybivtRLENL9cWOTy4Y\n' +
  '8jy7TZJi/jIzykrk0jPZfnf7OR68Y5sJyCojG7eXF3THZAS/j1RNdjmenZF3ROiQ\n' +
  'xYoLJvRhNCBUwz2czalrB9DPtfZjIbkSygoeGR7tZsH7RGSN9l+gNWGGu3nqHePi\n' +
  '5ABUzkczMPwQ8Ht6uTe5HIvcuDaXlMCKpgugyY71gn8PD+gdD09ZA55p3fxvBJGq\n' +
  'Q5K3p/w/Ui2vA8b+1N+iZ6xWAv7bH8SI7qwQCo5/yVGsR+ieEFvZzoiOIgNxEaQD\n' +
  'LeGXcy3KRVMX3Z1CARXZhnaD/SsCZqHAynuiQQIDAQABAoIBAQCM7LvOUdGdhU/u\n' +
  'DJGjQZIUU5bl01qRAyNNsivteuFm4iDN4BIyw50Atasb+7tfx2OzP/QVcgcG46qs\n' +
  '5PV0oaDwe5ac/Yvdc/vv4ybjneiIr4vNIfsGR1hpEYNP4R1LQ23iXbMKPxJseJWc\n' +
  'sq20SK4j53PHiXJ8PKBUTwbwvUrmHpmnC3KetLOGnwZMTN2IwQ8PN7nybknpnaMh\n' +
  'eeUdmaSTt8Odv2P7j3B5m5ZxNryWiJI4u5b1qmiRepnlhbFERuEWGlBPDgaU+6Nl\n' +
  'Ce540JaBjczgx96JM33Gd6UjZpBCvDtU07YAoTAkchpqn1d9YKquiRjY940OJ/P8\n' +
  'U8ztv9NpAoGBAOR55sD8VEOlLlhXR/e/pv9FtRskWC5KB5w5pPbGpuombCH6wZgI\n' +
  'ey/DXW8zXETBRv1kpt65AypreeEFSUpK+SbNB+4FXyXYNmPU+WYrjPs8oXwnhaSa\n' +
  'jRlCeD2LyADaXtu6b7BPcxHj75V0XnFEJJmHIKJwOeuEJ5HUGMvCQMgvAoGBAMsH\n' +
  'cKcu0z3qO2AXosqeo+zPHijz/eXmancgVq4fgfQybZNN3XXEwke6R8I7UDquxOOz\n' +
  'Wv2Zj7Dv8xFYEw8jOK1NxQx7n6PunyiV0FoG1x8UcOof4TA+erGlWZKAbkOP7NZt\n' +
  'f9QocC9xzKwHM1eCt+RRt9zXVQZ1T8/mM7AVrTCPAoGBAL5Z1WeJkoa9MuyE4z/E\n' +
  '29Qn9mhDkngWU1rUJ901ylCgbEyvBuWsgz1a7hg8WS4rPQLV/bTnvXx1CJjx94q/\n' +
  'Be9OuMGUlh4IkeAAyzxVImMas4ulvdFStiWKXHUiZSJYzNkR7gWdW8hW9/+zcQ+6\n' +
  '7yc+DnFnQMo4U2NKqtHv6FsfAoGBAJQzryDqhlp4w7TGLBfZq3EuUyazzE9oXajt\n' +
  'mzhpWXRG50OSoCjaYrL3IHCA2XSspJ5OCwp5cLFIxlaPwwHWxQWEcmVFTGfexKFc\n' +
  'koVU3u0Z/753XOrZgLhyKatOQq7gvZJcxeW5SwLm/+9HJkwn6FIq8JqtOKyJL6Rj\n' +
  'trE/cXezAoGAQXZ3NnDMy/Q5bPorf0ioG1OBjLhCiwUC6V1UJIMerg9oXRm6Nq9k\n' +
  '4XLNFc2PBiUUws0ULbEB3cuQjnNpLt70vMHG3U78zKsd2KJWuG/O4O2HKN6NJbKV\n' +
  '9GQiaGHziE3Ud0lALA3NQVT4wtWi1rLRY3nhnytg4cVZeWexo5oRUe4=\n' +
  '-----END RSA PRIVATE KEY-----\n';
config.issuer.credentialSigningKeys.publicKeyId =
  config.server.baseUri + config.issuer.endpoints.signingKey;

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

// credential roles
var roles = config.permission.roles;
roles['bedrock.credential.issuer'] = {
  id: 'bedrock.credential.issuer',
  label: 'Credential Issuer',
  comment: 'Role for credential issuers.',
  sysPermission: [
    permissions.CREDENTIAL_INSERT.id,
    permissions.CREDENTIAL_ISSUE.id
  ]
};

// view variables
config.views.brand.name = 'bedrock-issuer';
config.views.vars.baseUri = config.server.baseUri;
config.views.vars.title = config.views.brand.name;
config.views.vars.siteTitle = config.views.brand.name;
config.views.vars.supportDomain = config.server.domain;
config.views.vars.style.brand.alt = config.views.brand.name;
