/*
 * Bedrock issuer test configuration.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');

config.mocha.tests.push(path.join(__dirname, '..', 'tests'));

// FIXME: this key needs to be stored in a safe place
config.issuer.credentialSigningPrivateKey =
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
config.issuer.credentialSigningPublicKeyId = 'https://example.com/keys/1';

// TODO: Correct these paths to be more accurate
var baseIdPath = config.server.baseUri;
var userName = '';
config.issuer.identities = {};

function createIdentity(userName) {
  var newIdentity = {
    id: baseIdPath + '/' + userName,
    type: 'Identity',
    sysSlug: userName,
    label: userName,
    email: userName + '@bedrock.dev',
    sysPassword: 'password',
    sysPublic: ['label', 'url', 'description'],
    sysResourceRole: [{
      sysRole: 'bedrock.admin',
      generateResource: 'id'
    }],
    url: config.server.baseUri,
    description: userName
  };
  return newIdentity;
};

function createKeyPair(options) {
  var userName = options.userName;
  var publicKey = options.publicKey;
  var privateKey = options.privateKey;
  var newKeyPair = {
    publicKey: {
      '@context': 'someContextURL',
      id: baseIdPath + '/' + userName + '/keys/1',
      type: 'CryptographicKey',
      owner: baseIdPath + '/' + userName,
      label: 'Signing Key 1',
      publicKeyPem: publicKey
    },
    privateKey: {
      type: 'CryptographicKey',
      owner: baseIdPath + '/' + userName,
      label: 'Signing Key 1',
      publicKey: baseIdPath + '/' + userName + '/keys/1',
      privateKeyPem: privateKey
    }
  };
  return newKeyPair;
};

// user with a valid 4096 bit RSA keypair
userName = 'rsa4096';
config.issuer.identities[userName] = {};
config.issuer.identities[userName].identity = createIdentity(userName);
config.issuer.identities[userName].keys = createKeyPair({
  userName: userName,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxBTbcgMr6WY74XoUkXBg\n' +
    'n+0PUP2XE4fbcvALoBSBIlMcWep8TUl4/BGM2FBwbgeEgp9ZRJ8dObiK+ZqQjFOh\n' +
    'Gfj0PYP3Xb0c5Djrm0qmC8NRgVO4h2QNEX3Keps1bC6+S096n5XS9qiRsMfr4vN5\n' +
    'ohV9svSP9mmRs+iEs3UBWJl6uoMpkopCxViI1GhhYGjCoB+MGnVJbgEwPjA4POAm\n' +
    'WyMm76tSx0vpI0HLFdN0S9tghrl4jkAzFaBILMfoakx/LpFOiAApivM7HF6YeDZT\n' +
    'MOk6wVYMbbd1jiiy4PLj+nKl96K7RMU+RQZekAZ6Y2FU7wrAbOVBwaXaaRUTVIrN\n' +
    'hOCl7ihXo4w348rVNmDT0pejbSx2QbOY/X7NfUePIkOpyekRChGCrQL3KIicpKCA\n' +
    'bJG83U4niPsynBI3Y/zWvDgs8R/FxEc/UdlBB6Mr9jAeOhbY5vhH1E5dyThJD9Px\n' +
    'pmlY2PuzeAUscsfoXzxHRo2CLzanbvKJKXxMpMVl9lPyvVQHAevVZJO+kJf+Mpzw\n' +
    'Q5X4x/THt7NpSLDjpTsISQGc+0X3DhKvYzcW0iW/bDc9IqXuCPGqa/xf7XhNRLzg\n' +
    '41J2uX0nX9yWwl1opexN3dCxCsYNKTqBTq3uY1aK6WnWWXWt4t8G42A3bKv/7Ncu\n' +
    '9jEBOHnbHLXdQPk+q6wFNfECAwEAAQ==\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    '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\n' +
    '-----END RSA PRIVATE KEY-----\n'
});

// user with a valid 2048 bit RSA keypair
userName = 'rsa2048';
config.issuer.identities[userName] = {};
config.issuer.identities[userName].identity = createIdentity(userName);
config.issuer.identities[userName].keys = createKeyPair({
  userName: userName,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzhqhuJVKXVbPkexJfMUN\n' +
    'y5bqhfHJ3lX9NkpzxyPijuaQgGC23gUYlE97LFad/QKa06dm0zjO1ThYCAR0mjOE\n' +
    'A1z6Aaf0kuGZ6JWbS0QdfhZ53sNA0t22sRPgil2FFYDgtKwf9Ez09CuE8FWUYeVJ\n' +
    'MFmU/bE3y0bbceXo1n5yX6/Ek/oDoBI/32IaivwVEW+7SxOJykrCvIoFyo2O9Ejh\n' +
    'muZLzse3/kaCoQKF5YPBEsODNW6QrIH2seaO1Rlg51s2lj4XgS+XljsH+KaFOqYL\n' +
    'Oe7DZl9Ffg6veYo3iMu2IRFxvEyy3DtQsnaew6vk7Pvh9ZyXnPVeCrFj+k0SVumO\n' +
    'twIDAQAB\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEogIBAAKCAQEAzhqhuJVKXVbPkexJfMUNy5bqhfHJ3lX9NkpzxyPijuaQgGC2\n' +
    '3gUYlE97LFad/QKa06dm0zjO1ThYCAR0mjOEA1z6Aaf0kuGZ6JWbS0QdfhZ53sNA\n' +
    '0t22sRPgil2FFYDgtKwf9Ez09CuE8FWUYeVJMFmU/bE3y0bbceXo1n5yX6/Ek/oD\n' +
    'oBI/32IaivwVEW+7SxOJykrCvIoFyo2O9EjhmuZLzse3/kaCoQKF5YPBEsODNW6Q\n' +
    'rIH2seaO1Rlg51s2lj4XgS+XljsH+KaFOqYLOe7DZl9Ffg6veYo3iMu2IRFxvEyy\n' +
    '3DtQsnaew6vk7Pvh9ZyXnPVeCrFj+k0SVumOtwIDAQABAoIBAF3/FVx6ccTp75as\n' +
    'fcNyl10Pgfv+jsNg0i+teuoKeqwTiTmTYjMVfeU97n4FLt6SDoyS3zlbwjDKFpPp\n' +
    'fEhLUFy8TaTttYQ7cZb6jC2ibhTwKTqoL+s7hLNzzkcsaaKp+VFM4vHnGxw0sNdv\n' +
    'IFIZYOy1HlcpOLnzoedrJGqWlpD+ZfKi5j6cVmGsPwlaNt/0b7BG9raHFl1pVFGh\n' +
    'Sz+rQeWFhLgPDxivMIZ99OIohsPSriNxA6z+YUyYIbLxbM7tiiMNzBDep3998qXI\n' +
    'icRcAc4q/pGkIfdqjw2HP7PM/0+qQd+nPDC61ZOkOfCmMuj0g5heY6tvZHmClEml\n' +
    'lpInF7kCgYEA7cyl83f5GgRRGH18pNnI/gwzA1z1AcRZLqkxw6rEBZaqQhrgXEGP\n' +
    'NsXPV1J8hmrafY6BjOF5bogvNcKJ4DCp4nZE6u+coB8tTsiSddX5U5Y9Ug9WHOQW\n' +
    'dqrW+k46cLACrqrRyQAmE8DwLJCu8aP3nMEu5ZQbBRoatczWf06JDWMCgYEA3eD0\n' +
    'y51s7lZPzyveAursVUb5Votdm9yN13knRA3pIBWtjFB9zTnXCVfO7wVXlAmZXiCx\n' +
    'h5vW7eg3PQV7D2mYjtmlgFiThS5BckWOzzDS7t1925v+zo16MS8N2Lny9oSQXQIa\n' +
    '4A/FzavQ7l4NRT4cGiHeQ+YAVYXvu5ASyAkKE50CgYBSFGpPkGCmD0lil6XXTOjo\n' +
    'b5OIHKTg+EIELhhkPmQsvaWE7bv1fBePw1VfAbTDvMwvvGmRFB6S/WS2PLDUdled\n' +
    'OE9vfEdmqXw9DlQnYjUOGfSOh4aksEHksfFEMo5PaSFz4rhIlcmO1fDQoRwRghQs\n' +
    'wi2KxsVQzILdr5d2F8iMmwKBgEyos4tCCefS1GI8wsj5R8wy6GTZY+885Zjj2Agw\n' +
    'UjJuqvaGvOBSMpSczPdSPi78nguiehPjaP/rsmIX6auqjTYVxpOwhs+F6sDDfZLi\n' +
    'SI6U4i4lGIVe5i/mFP+jR2ma5ZHs70Io0Ou9iENDJYyd5/Gzb+q/pa/mxaxlG8gX\n' +
    'L28VAoGALyR/L1jQMbtPqgFTIR5q1cLvVCo/JiESDpozPqvWuCJF1TS1DIr2m7cV\n' +
    'M1mckfd+e9mtN349obLW+GXuTmIv+eVVxB4yMUA7XSSnE8JdecBCL7J2Uen+5Ufg\n' +
    'YFG4JWw245y+hCxsK6B+6P3yvotl85MbB8QT30MRFcxZnjttTmk=\n' +
    '-----END RSA PRIVATE KEY-----\n'
});

// user with a valid 2048 bit RSA keypair
// this key will be revoked during test
userName = 'rsa1024Revoked';
config.issuer.identities[userName] = {};
config.issuer.identities[userName].identity = createIdentity(userName);
config.issuer.identities[userName].keys = createKeyPair({
  userName: userName,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCcJEsERAdr0+lwDuW7ZdLOyBek\n' +
    'H8ijsm3z80M02udm/sO67mFxYF/nLNjS7D8sMN/PAcBJ393EiNJCc5hA78+7UeKT\n' +
    'Cj1NVXFWdoY8PqrvNEYEaSw9EkUx8wR2nQ2xmjn9hsNdFGHW9zcwSSVxuKXK5mhG\n' +
    '8eBz24roIEt4SYGS5wIDAQAB\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIICWwIBAAKBgQCcJEsERAdr0+lwDuW7ZdLOyBekH8ijsm3z80M02udm/sO67mFx\n' +
    'YF/nLNjS7D8sMN/PAcBJ393EiNJCc5hA78+7UeKTCj1NVXFWdoY8PqrvNEYEaSw9\n' +
    'EkUx8wR2nQ2xmjn9hsNdFGHW9zcwSSVxuKXK5mhG8eBz24roIEt4SYGS5wIDAQAB\n' +
    'AoGANZDR13XLIffCBrpln6Nv7ZaBXcG1oErvI5iZvsE2T4Qo+7EZ5r5MSE9/VuTL\n' +
    'S0q9DRQptm5Bc1II59kmK2jZ130Xb6SxsefD+lFXxg8Hsh5GjZKc76o88r42dxmj\n' +
    'Hmkhc/NSM50+9DkwqxcGV6qiwnV3a4PkTzOYc2UoCXe5oekCQQDQFSbnRSR5zAL0\n' +
    '8+ka3X9a/oxekdnYqhKRKZ7nPM3pwyh3Y+dbClYDAioBoc51R6BqcsyWtxB8++zN\n' +
    '5jbQ7pDdAkEAwBkiK0/OHVuh8XnT/Ykg2bFdLdaPu36rEYtZyX04w/h6B0xXxdCX\n' +
    'sN6KsfAS4lQH73PMdbGl3e43r38+Zj20kwJAK66lEhvjwmXfoQirQOaK29FgKmI3\n' +
    '91IMv8ibATQ0jgRYNGgWo3gSAmOr6dfL/bbhqDcdV+5qWbKRTdAsZcQPSQJAHLdl\n' +
    'IT5j3IWnNtb0dtE6BPD7se+COxAbeJrxSCqdAsaxT0f9Uwf0tS7/Ysw1tnnDWetg\n' +
    'pDNzTTLgRi7qYBRXWwJAF+oHYKWzCenz/rBK87UG+C5j1F48ofaKQ8Rq93V2fOpI\n' +
    'k+hh1cNd81/UDX4pJ4CVU/bJAl6GZdYzDF18bjSKpg==\n' +
    '-----END RSA PRIVATE KEY-----\n'
});

// user with an invalid 2048 bit RSA keypair
// the public and private keys do not match
userName = 'rsa2048Invalid';
config.issuer.identities[userName] = {};
config.issuer.identities[userName].identity = createIdentity(userName);
config.issuer.identities[userName].keys = createKeyPair({
  userName: userName,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCUj0ghzfW+XAzdXd4NJg2gclvs\n' +
    'vE3DwpAAnvznz+5ZIz/6me0Ta4Nx5Tg8u6us6NVZVhXTcGGENTZHQzdDedrQ5gY0\n' +
    'ENIIMcGVdBjsHw62J3RHOH15o48IvyL7yUUzvLMyDboi6wP95hQAtSYOCcamq+S+\n' +
    '1jnANxlTDuxtQUtmBwIDAQAB\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIICWwIBAAKBgQCcJEsERAdr0+lwDuW7ZdLOyBekH8ijsm3z80M02udm/sO67mFx\n' +
    'YF/nLNjS7D8sMN/PAcBJ393EiNJCc5hA78+7UeKTCj1NVXFWdoY8PqrvNEYEaSw9\n' +
    'EkUx8wR2nQ2xmjn9hsNdFGHW9zcwSSVxuKXK5mhG8eBz24roIEt4SYGS5wIDAQAB\n' +
    'AoGANZDR13XLIffCBrpln6Nv7ZaBXcG1oErvI5iZvsE2T4Qo+7EZ5r5MSE9/VuTL\n' +
    'S0q9DRQptm5Bc1II59kmK2jZ130Xb6SxsefD+lFXxg8Hsh5GjZKc76o88r42dxmj\n' +
    'Hmkhc/NSM50+9DkwqxcGV6qiwnV3a4PkTzOYc2UoCXe5oekCQQDQFSbnRSR5zAL0\n' +
    '8+ka3X9a/oxekdnYqhKRKZ7nPM3pwyh3Y+dbClYDAioBoc51R6BqcsyWtxB8++zN\n' +
    '5jbQ7pDdAkEAwBkiK0/OHVuh8XnT/Ykg2bFdLdaPu36rEYtZyX04w/h6B0xXxdCX\n' +
    'sN6KsfAS4lQH73PMdbGl3e43r38+Zj20kwJAK66lEhvjwmXfoQirQOaK29FgKmI3\n' +
    '91IMv8ibATQ0jgRYNGgWo3gSAmOr6dfL/bbhqDcdV+5qWbKRTdAsZcQPSQJAHLdl\n' +
    'IT5j3IWnNtb0dtE6BPD7se+COxAbeJrxSCqdAsaxT0f9Uwf0tS7/Ysw1tnnDWetg\n' +
    'pDNzTTLgRi7qYBRXWwJAF+oHYKWzCenz/rBK87UG+C5j1F48ofaKQ8Rq93V2fOpI\n' +
    'k+hh1cNd81/UDX4pJ4CVU/bJAl6GZdYzDF18bjSKpg==\n' +
    '-----END RSA PRIVATE KEY-----\n'
});

// rsa1024Unknown contains keys that will not be loaded
// into the identity database
userName = 'rsa1024Unknown';
config.issuer.keysUnknown = {};
config.issuer.keysUnknown[userName] = createKeyPair({
  userName: userName,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCuOm2FjLnUAGM9CqQa5PNyk01/\n' +
    'Maq9m98ZwD+EmKdgyG5Gk8Gh9vBLyHZ1xSisD4ubaRRjcUOaGYkQ67Sp8/g3z/iI\n' +
    '4EezrKKfq5cmSk5iWCExMCvOi8EwAvHL1MVMrU0aHN5wgg8bsJyFUWs9t3qvvpP1\n' +
    'wmNtFmvjyxVs39EZiQIDAQAB\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIICXAIBAAKBgQCuOm2FjLnUAGM9CqQa5PNyk01/Maq9m98ZwD+EmKdgyG5Gk8Gh\n' +
    '9vBLyHZ1xSisD4ubaRRjcUOaGYkQ67Sp8/g3z/iI4EezrKKfq5cmSk5iWCExMCvO\n' +
    'i8EwAvHL1MVMrU0aHN5wgg8bsJyFUWs9t3qvvpP1wmNtFmvjyxVs39EZiQIDAQAB\n' +
    'AoGAWx/aCoCI7NXrEZEQNbTLk4BxhvYOLC9rJ4fCcPJ6kIckDivXmYOTOL+3HW+q\n' +
    'DxvuU7FI5Z3m0qFKbBwrmLwudP1nVAPJP5d4qpIDou9+57ZJRpKweQzIzXVoMi5t\n' +
    'PCEuNw6Tna2a4RfWtclMojc3aqfJer2gGhZcsCWrMdUen4ECQQDcO/tW+WEqcm5v\n' +
    'fjf0XQVzwenyfDofDXHfGRvWi06hbfIf0fydYfSQKbL15nuOUxoH3Y283odY8cOX\n' +
    'oXsrT6hRAkEAyoXKTLviIZKuEv8PbY1ZiYoiS1K3tEZERh1i65jJZbky/cDNPPF0\n' +
    'grqVHX0wXjbMmyzHdilEiuqiyyybr/JHuQJAdp4P115lyRjtBjvzIzhe0WQl/yaN\n' +
    'n1/8bu71IW7SoPu4pw7QgmvZ7zOmYe8LqTJ1GLtptcodF/jPIgIldsRmoQJBALI4\n' +
    'pLt8R9a1pxyuepw03MuN1PomM+WgRGrTZ37e+LTdEsN+DN8JuTdmDN1jktIGNW6F\n' +
    'LI6OaHQ7YcGcYvGmK3kCQCLe1VPycUityxw1L43v4UO7btsVmU8amgGOCQnyICfK\n' +
    'S5z/dlfDhqey+vxmac+U8RTVLGaCeNmkZhnmZEb0eQk=\n' +
    '-----END RSA PRIVATE KEY-----\n'
});
