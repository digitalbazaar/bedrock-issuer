Command Line Credential Issuer
==============================

This test program shows how to use HTTP Signatures authorization to issue
demo credentials.

Requirements
------------

- Running server that uses [bedrock-idp][]
- Running server that uses [bedrock-issuer][] and the following modules:
  - [bedrock-key][]
  - [bedrock-key-http][]
  - [bedrock-angular-key][]

Setup
-----

- Create an account with your IDP.
- Login to the issuer.
- Use [genkey](./genkey) or a similar tool to create a test keypair.
  - `./genkey test`
- On the issuer, use the dashboard "Add Key" menu option:
  - Add the public key contents from `test.pub`.
  - Note the generated key ID.

Usage
-----

Run the credential creator with appropriate options:
`./issuer.js -k --key-id KEYID --key-pem PRIVATEKEYPEM --endpoint ENDPOINT --issuer ISSUERID -n NAME --date DATE`

  - `--help`: Show help for options.
  - `-k`: Optional to disable security for use with test servers with self-signed HTTPS certificates.
  - `--key-id`: The ID of the key you added.
  - `--key-pem`: The private key PEM file.
  - `--endpoint`: The issuer endpoint to use.
  - `--recipient`: Optional recipient of the credential, defaults to issuer.
  - `--issuer`: The issuer ID for the credential (your id).
  - `-n`: Optional name extension to add to the demo credential.
  - `--date`: Optional issue date, defaults to now.

For example,
  - `./issuer.js -k --key-id https://issuer.example.com/keys/1.2.3.4 --key-pem test.pem --endpoint https://issuer.example.com/credentials --issuer did:01234567-89ab-cdef-0123-456789abcdef -n test-123 --date 2001-02-03`

This should create a test credential you can then accept and store on your IDP.


[bedrock-idp]: https://github.com/digitalbazaar/bedrock-idp
[bedrock-key]: https://github.com/digitalbazaar/bedrock-key
[bedrock-key-http]: https://github.com/digitalbazaar/bedrock-key-http
[bedrock-angular-key]: https://github.com/digitalbazaar/bedrock-angular-key
[bedrock-issuer]: https://github.com/digitalbazaar/bedrock-issuer
