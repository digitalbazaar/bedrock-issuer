Command Line Credential Issuer
==============================

This test program shows how to use HTTP Signatures authorization to issue
demo credentials.

Follow these steps:

- Create an account via your IDP.
- Login to the issuer.
- Run `./genkey test` to create the `test.pem` and `test.pub` keypair.
- Use the dashboard "Add Key" menu option.
  - Add the contents of `test.pub`.
- Run the credential creator:
  `./issuer.js -k --key-id https://issuer.example.com/keys/1.2.3.4 --key-pem test.pem --endpoint https://issuer.example.com/credentials --issuer did:01234567-89ab-cdef-0123-456789abcdef -n test-4 --date 2000-01-04
  - `-k`: Optional for use with test servers with self-signed HTTPS certificates.
  - `--key-id`: The ID of the key you just added.
  - `--key-pem`: The private key PEM file.
  - `--endpoint`: The issuer endpoint to use.
  - `--recipient`: Optional recipient of the credential, defaults to issuer.
  - `--issuer`: The issuer of the credential (your id).
  - `-n`: Optional extension to add to demo credential name.
  - `--date`: Optional issue date, defaults to now.

This should create a test you can then accept and store on your IDP.
