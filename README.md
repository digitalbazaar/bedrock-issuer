# bedrock-issuer

This is a [bedrock][]-based library that provides a simple JavaScript and HTTP
API for issuing and claiming JSON-LD credentials and storing them in a
database. It is not a comprehensive credential issuer application, rather it
could be integrated into such an application to provide some portion of its
required features.

## Requirements

- npm v3+

## Quick Examples

```
npm install bedrock-issuer
```

### Issuing a credential

The *issue(* **actor**, **credential**, **[options]**, **callback** *)* call
will issue a credential by digitally signing it and storing it in an
`unclaimed` state in the database.

The call takes the following arguments:

* **actor** (**required** *object*) - The identity that is performing the
  action. This identity must have the `CREDENTIAL_ISSUE` permission for the
  resource specified as the `issuer` property in the `credential`. See
  [bedrock-permission][] and [bedrock-identity][] for more information.
* **credential** (**required** *object*) - The credential to issue. The
  credential is assumed to use the JSON-LD [identity-context][] and
  [credentials-context][] and must include an `issuer` identifier, an
  `issued` date, and a `claim` section with at least one claim.
* **options** (*object*)
 * **meta** (*string*) - Custom meta data to store in the database along with
   the credential in the database. This data will not be signed.
* **callback** (**required** *function*) - The node-continuation-style
  callback function to call once the operation completes. On success, the
  signed credential will be passed as the second parameter.

Note: At present, the key used to sign the credential must have been previously
registered with the `issuer` of the `credential` as their preferred credential
signing key (`identity.sysPreferences.credentialSigningKey`). A future option
will be added to allow an identifier for the signing key to be specified via
`options`.

```js
var issuer = require('bedrock-issuer');

// digitally-sign and issue a credential for later claiming
issuer.issue(actor, credential, {
  privateKey: key,
  publicKeyId: publicKeyId
}, function(err, signed) {
  if(err) {
    console.log('uh oh', err);
    return;
  }
  // `signed` is the signed credential
});
```

Credentials may also be issued via the HTTP API. By posting an unsigned
JSON-LD credential to the endpoint configured via
`bedrock.config.issuer.endpoints.unsignedCredential`, along with the
appropriate authentication, the above `issue` call can be called internally
using the authenticated identity and the parsed credential.

### Claiming a credential (marking it as claimed)

The *claim(* **actor**, **id**, **callback** *)* call will mark a previously
issued credential as `claimed` in the database.

The call takes the following arguments:

* **actor** (**required** *object*) - The identity that is performing the
  action. This identity must have the `CREDENTIAL_CLAIM` permission for the
  resource specified in `credential.claim.id`. See [bedrock-permission][] and
  [bedrock-identity][] for more information.
* **id** (**required** *string*) - The ID of the credential to claim. The
  credential must be `unclaimed`.
* **callback** (**required** *function*) - The node-continuation-style
  callback function to call once the operation completes.

```js
var issuer = require('bedrock-issuer');

// mark a credential as claimed
issuer.claim(actor, credentialId, function(err) {
  if(err) {
    console.log('uh oh', err);
    return;
  }
  // successfully claimed credential
});
```

[bedrock]: https://github.com/digitalbazaar/bedrock
[bedrock-identity]: https://github.com/digitalbazaar/bedrock-identity
[bedrock-permission]: https://github.com/digitalbazaar/bedrock-permission
[identity-context]: https://w3id.org/identity/v1
[credentials-context]: https://w3id.org/credentials/v1
