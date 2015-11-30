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
  '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\n' +
  '-----END RSA PRIVATE KEY-----\n';
config.issuer.credentialSigningKeys.publicKeyId =
  config.server.baseUri + config.issuer.endpoints.signingKey;
config.issuer.credentialSigningKeys.publicKeyPem =
  '-----BEGIN PUBLIC KEY-----\n' +
  'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAv5vs5nqml0QSxsGm1hJt\n' +
  '3K2CTnPotdzV/mEDBE1kmLBxqpD38d/1gWxAQImJgn5oDvsJvqo1HDFsRP6XBT3j\n' +
  'o7PZ9f0ZYVivbSFHtUfKasaCiGeUGj8pzYnCjrKynq5vo8D84hYtF6e1pmDIu2H+\n' +
  'auOv/Nc4XDc+ib3QUFDrffOTZn+lESTH1vUJNE5FkmsFycb3Qslvkc7eNVpd/YOO\n' +
  'DiuvAeq6q/DrvURc5xh6OY7YRZhagY9wfQeWniIBJbnaQahMKzFQ/dLbOAaTI/Bx\n' +
  'JEWZgfHCUlmam+3bsJDRTYqpXIKNRY5PT2KvuYckuRckVe4IqbjPoRpsI0kvjIHY\n' +
  'u64or/c86e0hjqvrvNxsa9ruzbnCinnV6xjbSFoXCA4Xsno+dFQD2xmTPjfhIo7L\n' +
  'q9PoMYQ8Cae9Fa/9SyDrdmEjTiqzYwj7YrCTHsMXo5CqNio/KdOijJFhrbrheKiA\n' +
  'Jwd5rqrXVskO/HilX8MRbM3GD9REXArN5e9BOSL1Dg/Dw1rZRU9k3v76iC6iO5nP\n' +
  'jhnMFuvJu0c3B7fiGCEWWvoIce/fvNsCIXJ9RhucdwH8mm1ftrYKSKiO/KydHCgO\n' +
  'z5WEvd/cqAcBmxqj5WUVxrXoqtRfwG2RxQEq8VGsZJsdiNXIR1AsyZbVhXebB5lt\n' +
  'e/2DZ8CTkAGHOLGyIU+iymcCAwEAAQ==\n' +
  '-----END PUBLIC KEY-----\n';

// credential permissions
var permissions = config.permission.permissions;

permissions.CREDENTIAL_INSERT = {
  id: 'CREDENTIAL_INSERT',
  label: 'Add Credential',
  comment: 'Required to issue Credentials.'
};
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
