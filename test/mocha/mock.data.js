/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */

'use strict';

var helpers = require('./helpers');

var mock = {};
module.exports = mock;

mock.unsignedCredential = {
  '@context': 'https://w3id.org/credentials/v1',
  type: ['Credential', 'BirthDateCredential'],
  name: 'Birth Date Credential',
  image: 'https://images.com/verified-email-badge',
  issued: '2013-06-17T11:11:11Z',
  claim: {
    id: 'did:32e89321-a5f1-48ff-8ec8-a4112be1215c',
    'schema:birthDate': '2013-06-17T11:11:11Z'
  }
};

// TODO: Correct these paths to be more accurate
var userName = '';
var keyId = '';
mock.identities = {};

// user with a valid 2048 bit RSA keypair
userName = 'issuerAlpha';
keyId = 'b68afe7f-4058-4b07-927d-a7f474d778ef';
mock.identities[userName] = {};
mock.identities[userName].identity = helpers.createIdentity({
  userName: userName,
  credentialSigningKey: keyId
});
mock.identities[userName].keys = helpers.createKeyPair({
  userName: userName,
  keyId: keyId,
  isSigningKey: true,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoYWPwc0AgikzAW8CEX7f\n' +
    'huJm21jzApfmcSplElAIyglLi/DlDK/im1UNYTiQlJ0Vz5UalkcTvNsqRELfzDgc\n' +
    'LaDYTC0QZedpcWupjl1DbK+CK5QGyZJVLkE1V90FMYZex9h0AMlEjpvBE7eOB21a\n' +
    'kXWJGQEEYTK35P+xGX8Y8RwjF23RkJJIlq75T3IujlpAG2zQdGxgQUk18ge8dSVE\n' +
    'taGi+U+hR6yBNCVcMwtmbNgAycw+PRHA7EeS+0e/gKDotTkds6GUIRlhVRrWz1VG\n' +
    'jF2a/I0V5pVeNAYJitZ7jI97+YCJmcDNImPHEtbrjcevoU1BDyalp6KL6nkyicTV\n' +
    'MQIDAQAB\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEogIBAAKCAQEAoYWPwc0AgikzAW8CEX7fhuJm21jzApfmcSplElAIyglLi/Dl\n' +
    'DK/im1UNYTiQlJ0Vz5UalkcTvNsqRELfzDgcLaDYTC0QZedpcWupjl1DbK+CK5QG\n' +
    'yZJVLkE1V90FMYZex9h0AMlEjpvBE7eOB21akXWJGQEEYTK35P+xGX8Y8RwjF23R\n' +
    'kJJIlq75T3IujlpAG2zQdGxgQUk18ge8dSVEtaGi+U+hR6yBNCVcMwtmbNgAycw+\n' +
    'PRHA7EeS+0e/gKDotTkds6GUIRlhVRrWz1VGjF2a/I0V5pVeNAYJitZ7jI97+YCJ\n' +
    'mcDNImPHEtbrjcevoU1BDyalp6KL6nkyicTVMQIDAQABAoIBAGyOJVXs/6B7LAqU\n' +
    'nuE/Ud+HnfVhzME7cecwxQkPvTh8EsgUuPxT4YrgGMP0jkczZAtFfL7vOja9XaTP\n' +
    'BTZtp5KK/ZQE3XZ/lwBhiW1jBQOw2V2MeRtUO+eAb+eDZhAo7N6HfT9iBa+KwrML\n' +
    'tGsNdcc5JVEmu9jPi4RezJoEL7ErVDDqu3RG4411ljzxa4NcZs7YJ1GwDmYNrDP3\n' +
    '9F+0qQ/eHIa6m6W14EH8PQRc7ZMJEhD62FNbo4aRkxuSpNkOibyN51+W7/WjSqdX\n' +
    'MYstjZgOuZvoq2mFRBfuO+0VUsmei1Jf7fPjIhFrYHVSOI4WQxRkKCfQZ3fXsD/P\n' +
    'KVgoFXkCgYEA1vjLq3WLKMiykWtE8UIinYk+omsUTKgRztYR2HsZqB/sKEtVCxbu\n' +
    'F1KoFoIvvHHjhT9MGI1HkmOAtBzaEUQC73EnV4been41FQheQGZTAAMsuhR5Jeyr\n' +
    'IoKHmXEXAJiaUmqgTK46Tip6hOLSPPKkFfpJxEdafpFXt0ycOniud18CgYEAwFlF\n' +
    'rRR+NxvxY0j45Jm3aEqmqfCcgf41B6o3eOtzcj8RHE8zN7f1mwRk2wYKZMgVbkoE\n' +
    'Ch/e4R2nQS4FVtkDRipS6qeR8ahEOyCK1K3OZGaYbc/CJ0WA1rT0vQKkteHZ3Pvt\n' +
    'UDSloDjY5HIk/IhuU1J2qyZMjtHyZJvSGvR4zW8CgYBVvyWWPauFWBCKGqyEQyoF\n' +
    'hoH6TRXqwbtgslip7eg8/Ia5R9sjMkFEAk9TsxgRZagoNShIPspGpPPoY/3Dl0pI\n' +
    'ce0MZ5qEZ6UKv6zAqVAAGEQV8SalrvJQMJqf5NEVBsm/iBJqo7BUD3ORX9wWPX6f\n' +
    '2Zbk+MUq6RSA48kJNav5pwKBgCv5fON4Bu8EdWhUe4qP1g2C252Ig894VZleAfak\n' +
    'Ja2d24SUWspHRWBeXcxxEhk+YR/ozgmeha8Dv4Q4SEI1tPjqnjBFhSkxZf/6jaLX\n' +
    '5ZKwnfKlB+dAjZcIoddAbnWin9NUyUmH78G0nWmE6w3NByQHe1fflqskNn1n3l4J\n' +
    'PEEDAoGAdxa1Na5tylGDZAPHFMipXSbOSW4QwNDm4SSEAooFCEJN0OjC4GrDmYQa\n' +
    'Wvga1b5YHomQVNHQJ4I05PlYUiX44SpbLH//0BmC1VZq5Shh+/mXsHdtAps/fX7b\n' +
    'jnVyCul3EcKcrD4nAxREfXV+kBLoSPhyIWXLZH8gw75yas67F/g=\n' +
    '-----END RSA PRIVATE KEY-----\n'
});

// issuerBeta has not set a credential signing key
userName = 'issuerBeta';
mock.identities[userName] = {};
mock.identities[userName].identity =
  helpers.createIdentity({userName: userName});
mock.identities[userName].keys = helpers.createKeyPair({
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
userName = 'issuerGamma';
keyId = '96bb310b-1ea2-4154-9ab9-cd30e64ecf2d';
mock.identities[userName] = {};
mock.identities[userName].identity = helpers.createIdentity({
  userName: userName,
  credentialSigningKey: keyId
});
// creating two keypairs for this user
mock.identities[userName].keys = [helpers.createKeyPair({
  keyId: keyId,
  userName: userName,
  isSigningKey: true,
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
}), helpers.createKeyPair({
  userName: userName,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA3gxZF06Sz9EDEA8cEDBk\n' +
    'jqDAjI7LUL49/e0plHIdpFp5NSIiHYqFl+fb0Ah0XsliJ9VpW4MEHdqRkD4jvUnr\n' +
    'hQLWjUvVvxMQ7h7mdu+GuN7jYwPf37qtJ/CzDBKUs+tult/ZbehKSKSnKA2eKrR3\n' +
    'eahElcjKP3rSgzza6GEZv2+M36PmNvmmNIYAqhQPwW+DWHjqWkz5LkzCFRGkT6Gf\n' +
    '/h279giI3ns+tvppzLtq8/TP8rPS9ZX6IejktZu7/Pk8BMwta8Mwi3CAncLBzaj4\n' +
    'UkF0Bvzzs6joaAsrB33Y48TkHYCddKa0k8abykiWsWjCIZ1wr/Y7vqmenH5YbVq3\n' +
    '3QIDAQAB\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEpAIBAAKCAQEA3gxZF06Sz9EDEA8cEDBkjqDAjI7LUL49/e0plHIdpFp5NSIi\n' +
    'HYqFl+fb0Ah0XsliJ9VpW4MEHdqRkD4jvUnrhQLWjUvVvxMQ7h7mdu+GuN7jYwPf\n' +
    '37qtJ/CzDBKUs+tult/ZbehKSKSnKA2eKrR3eahElcjKP3rSgzza6GEZv2+M36Pm\n' +
    'NvmmNIYAqhQPwW+DWHjqWkz5LkzCFRGkT6Gf/h279giI3ns+tvppzLtq8/TP8rPS\n' +
    '9ZX6IejktZu7/Pk8BMwta8Mwi3CAncLBzaj4UkF0Bvzzs6joaAsrB33Y48TkHYCd\n' +
    'dKa0k8abykiWsWjCIZ1wr/Y7vqmenH5YbVq33QIDAQABAoIBAFgIrz21UjGAXWV9\n' +
    'iBPHC+ccRpqzdlpBwpQs9eI7yBLEJ+/v43Sw2bxbGWQGJhT6ZKcETmwQqo4nfLSi\n' +
    'XksKxoyKjoOggFLr/TdbGuYmmtQq0h4MiDLMcSA3ptTvfPNEMSkyAKM5iFH6racM\n' +
    'lxu5RvD9zItR+xVl3ZZYhzXAYZPqqbVjreF3Myo1RRzr9ZqqsaTgGZYnLGPM05i0\n' +
    'VMiAIiHFkCNJevyQm8yN3e5/q7xCGksT0KMYNyb3GBcLMkn8HSxB19VAeAmtMIVf\n' +
    'W4ZC8bg3pActkaT1jZwul7pJ9cPfNfJj2UHyV3WeeVKDZ44KeNUsDVzxHYAw3Vc0\n' +
    'Pjd1lsUCgYEA+sDS69ErLuLSWpadnY17EGb4Q6qlf2yMnKwmGC8HAbSzrliNLWRM\n' +
    'AYboYRiewK6IbFxYSKRlh2+JZbR4gyGOVxoysSx4L19b6MLAc6ZK818OMCgNsAR1\n' +
    'f37Xu5i+Xzf0Cd6vvHj6uFvlAwtSy1iVCoODE1XAP6uMx56MSp+oQYMCgYEA4rHD\n' +
    'k2/Gy2gzZ3iCm9+N+pumSJJYWBS3lxV4JiKLtwcPXuuWT7P20ch0OF3n2le7KjlH\n' +
    'bxhmfLIEEsW2uNctTdfH63PahkT8Tfmm2sELHqnnOu+ypyksi/qbw+t3FnUJH1r8\n' +
    'jIxhft+7EFEx7xP1BTDKITPM/bUJVhb8LaFcwx8CgYEAkpcxd0zz6tgNU4ojoJy6\n' +
    'ag9Yae6UC9dAqML3DkJH3VZviKgZ+IRe7rGYnlLPVCN0e6zMq8L32+J3t2522Wo/\n' +
    'lWoqYmt143Pi/kMEUVfRD0/tsndn8RPaQOu9YN1dxbqnPzHhGNS89hQ64Lm48Enb\n' +
    '76aMdTw3RMGcboKgz2tg6NMCgYEA4dcK6nUu7THQFEMAi105yvMJw77X+FgbVo7y\n' +
    '9brwydRkwcGeK6U0PWagMg+LjgBc3AHYYptCbvPCDxmdoaPs5GIWL0Fp8N4FJYGT\n' +
    'ctdixpepXxOxPctNL97pE1QffeX2wqAYfcTU1Fr7t5PMVUvii9tBY7aBgDe9J2Ea\n' +
    'tjLNgS0CgYALt3cOMbkQdsXiFWunz1kUwnZdriHu/nlrdaxms1AidB0d/8SsmbOW\n' +
    '1rJquZ6R6kC2PquV7Qxf6koZ7eZb0o0/7tdbpoocrryBtwTLrmOSzoL7zX3nl+Hd\n' +
    'Rpw2v7gskoHk0pecLISpmKZ47T5a27Lz0cw1wm6ch1E6wt6JCSIXMA==\n' +
    '-----END RSA PRIVATE KEY-----\n'
})];

// organization
userName = 'organizationAlpha';
keyId = '09bbb501-361a-489e-bcb2-e55a1d988fb1';
mock.identities[userName] = {};
mock.identities[userName].identity = helpers.createIdentity({
  userName: userName,
  credentialSigningKey: keyId
});
mock.identities[userName].keys = helpers.createKeyPair({
  keyId: keyId,
  userName: userName,
  isSigningKey: true,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEA18AUZXtCB1uBClMEkJ7r\n' +
    'ZW67pwvChpsS9H7gomPpi+ESJSXk3ndN1xlATXLZi+HtWUX5VQ85BLujKD+LQmbM\n' +
    'tXGZaZ7NeJuAjGuFVd0F/WXgqcFnkWGYUqHU7yv7jLX6gDKE5oJ2nxnwIFQRyQnz\n' +
    'iJGsOSSwBYqmL5Ypm0GZ+wcyPkyZaDOajyjyzJt+g79U155tlLCtowQrFRgpn18X\n' +
    'i/5WvEcwc86ilE8K5G1edHyMOdyMQdnCKo9axBTMZWpLQ/sEzq/kqINswYReJkIK\n' +
    'OlKohICJ+lSzMhCAkRbP0l55Sxh4kLk8PCMdYUuPhvMBF6J1/uBZeOgSkEqdNpRm\n' +
    'rGNK7ydwYHL9DjFzTiA4fiKY2gnE2VLz1rI4GDy2zT+72UAOJsB02hfF6IYvHJck\n' +
    'wPZIN3qbHYTR0Xgt0/cGdNC86rNSiuDuAONEt3tWubUFJpIm+MhiprYyuOIlUOl8\n' +
    '8niOWo2SkzLhiqiRGgb7Rvinmo2EjJ3/p9S8lZdW+c6UDidnGoV88rZwIKSY17Fi\n' +
    'TUHofqu4QU9qMU/eCqHqp8G30VATG99N1DbDXQKWE4veZsi0qILe6DmZgootn6Ga\n' +
    'MgqIAyuIXAtqjrZ/D4lq5AnysOkYwJKiSD/MDChZi7zml6JGTiXUPDkM0nhwzuYr\n' +
    'dH5C9illQbskXzRr/kXLZ4MCAwEAAQ==\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    '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\n' +
    '-----END RSA PRIVATE KEY-----\n'
});

// organization member
userName = 'organizationAlphaMember';
mock.identities[userName] = {};
mock.identities[userName].identity =
  helpers.createIdentity({userName: userName});
mock.identities[userName].identity.sysResourceRole.push({
  sysRole: 'bedrock.credential.issuer',
  resource: mock.identities.organizationAlpha.identity.id
});
mock.identities[userName].keys = helpers.createKeyPair({
  userName: userName,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAywAOU0Btp1IbPMKIUDL0\n' +
    'DbFTuwd/7DLeEEnQo7HSdYEkpOPKOZLMqG7P4d9hAU2FrXe/Z00JAcSYRq/n3Xg1\n' +
    'tK3SXg5Thtban6lG/CjZ1ZfthbDGAuKSl5x+U+/TfZnG4DRRbVnXdqnpPQZHjYHo\n' +
    'Gy0HIhShHVehUxgi6W+kpsftjlJL55rE7/HSXkoS/TlyyK5c1Ji0Qm0SnJARG/b3\n' +
    'cSVMFOifETKz/4LkYG+lpj7Rd9E8exCqct9nWqXO0bii+ShVg8KgQtI2GboPLfUp\n' +
    'Y+nsyLyPCbn7OVKryilLLLUEGQl+z9OURcY+KmV8ugauNkzj6LmPUWbO1usdA04+\n' +
    'XLDKlglpdKhq/qz8W5I7sChGrYQqBZk/PLh2UDR8qJUkL13BdE7AKkETH2crOW6q\n' +
    'MEBsjNcPfOcWT56MBVbSEsD8aQARCSmTgIsItNCdl2jc4IbIfsjR//fRuTD3JDzj\n' +
    'yvRqnl6gtoC86OXutmbS8ANIo23h9dc52AsO1Ee1Bu8N6EQ+HrnbJFYLslY6U8sp\n' +
    'ZO4lS/Tpnk/rRLGOtkwmXEsfA5/N5LgbTc9BOhh+VzlLrqVv8ifK/n0cSX/qDW3r\n' +
    'JeGcfKi3G0GmBQUMDJEu5OB9MI74A5XZ83oP5tiwczsMBZX4m/dqinIpM9AGTcp6\n' +
    'RZI0/FTvhaKeMX7EIucE0OUCAwEAAQ==\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    '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\n' +
    '-----END RSA PRIVATE KEY-----\n'
});

// organization non-member
userName = 'organizationAlphaNonMember';
mock.identities[userName] = {};
mock.identities[userName].identity =
  helpers.createIdentity({userName: userName});
mock.identities[userName].keys = helpers.createKeyPair({
  userName: userName,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAuJSQC+H3k2bXthj2dKJG\n' +
    'xLNtDv8E69gvKTMBdBz7XBiSUvHYKYnjTmlms0D/9PjgaKz5IZZqXjr6MVxbN7O9\n' +
    'sPGiqs5IWl/ZPkVa4zFW16oezBFdDuVp1hcurOWQKt7Exp/ct9C48+3rc5iHMZxe\n' +
    'eSmJfTa2qotzFUmxe/4MK7F25CXhbTDoirfk3fYWfi27sL4dv5PmJ8GwX5SWDwQU\n' +
    'iLqVw9QtZF7mVWsA4U2Iu8VVyNpDhoQlUMD2YaRPXKrPp4KNI0KtJ+wHF0taXMSv\n' +
    'ZkJk+yetC6VHOD9DG6z6L5yRGIMnLc9Ock3huh346DmvZx7cucUIixzwDR0/MiWZ\n' +
    '/JwSL3UapuUe9Qzaysa3bx3vDd9XZeGWdwSZ/gSKy7tsgF1lqfBX501aMUkixFH5\n' +
    'iYncZJ5g7u9blmxBdDpfxY2Y0DOhBU4NfIxpJ3zEp/6qbPnjznvTbPTwbxqr5xE0\n' +
    'gkB2d2nTcTlylTy+dV1PMnU0acobCQHikPfr3afg4sa4v4kEDt/k0wDU9tHMSmht\n' +
    '82ZZhy5HduHAxAk3sm7Dv/KMg9PsZya5DM5OnJZtXgmtmAo/TDWf93fRihNKdxx5\n' +
    'y8LfYuLdJHtYJWF5edHElzr4orAQsTAzXLInejaYB25mvQfRUGdjf3Zl9lZuP9uw\n' +
    '2aWOgEZfERZGs+iaZ+zNEmMCAwEAAQ==\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    '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\n' +
    '-----END RSA PRIVATE KEY-----\n'
});

// NOTE: this method only works if this suite is run independently
// Object.keys(mock.identities).forEach(function(key) {
//   var i = mock.identities[key];
//   config['identity-http'].identities.push(i.identity);
//   if(i.keys) {
//     Array.prototype.push.apply(config.key.keys, [].concat(i.keys));
//   }
// });
