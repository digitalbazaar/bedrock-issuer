# bedrock-issuer

A [bedrock][] module that provides basic credential issuance and claiming
capability.

## Quick Examples

```
npm install bedrock-issuer
```

```js
var bedrock = require('bedrock');
var issuer = require('bedrock-issuer');

// digitally-sign and issue a credential for later claiming
issuer.issue(actor, credential, {
  privateKey: key,
  publicKeyId: publicKeyId
}, callback);

// mark a credential as claimed
issuer.claim(actor, credentialId, callback);
