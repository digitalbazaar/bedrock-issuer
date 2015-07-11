define([], function() {

'use strict';

/* @ngInject */
function factory(issuerService, config) {
  var self = this;
  self.credential = null;
  self.credentialId = null;
  self.display = {};
  self.display.instructions = true;
  self.display.credential = false;
  self.display.actionResult = false;
  self.display.acknowledgement = false;
  self.actionResultMessage = null;
  self.baseUri = config.data.baseUri;
  self.aioBaseUri = config.data.aioBaseUri;
  self.identity = config.data.issuer.identity || null;
  self.storedCredential = config.data.issuer.storedCredential || null;

  if(self.storedCredential) {
    _display('acknowledgement');
  }

  function _display(showProperty) {
    for(var propertyName in self.display) {
      self.display[propertyName] = false;
    }
    self.display[showProperty] = true;
  };

  self.storeCredential = function() {
    // console.log(config.data);
    var options = {
      requestUrl: self.aioBaseUri + '/requests?action=store',
      storageCallback: self.baseUri + '/acknowledgements'
    };
    console.log('CREDENTIALSENTTOPOLYFILL', self.credential);
    return navigator.credentials.store(self.credential, options);
  };

  self.showCredential = function(clientId) {

    var mockCredential = {
      '@context': 'https://w3id.org/identity/v1',
      id: self.identity.id,
      credential: [{
        '@graph': {
          '@context': 'https://w3id.org/identity/v1',
          id: self.baseUri + '/credentials/' + Date.now(),
          type: ['Credential', 'PassportCredential'],
          claim: {
            id: self.identity.id,
            name: 'Pat Doe',
            country: 'USA',
            governmentId: '123-45-6789',
            documentId: '27384-5322-53332'
          }
        }
      }, {
        '@graph': {
          '@context': 'https://w3id.org/identity/v1',
          id: self.baseUri + '/credentials/' + (Date.now() + 1),
          type: ['Credential', 'ProofOfAgeCredential'],
          claim: {
            id: self.identity.id,
            ageOver: 21
          }
        }
      }]
    };

    // FIXME: this would normally lookup a credential in the database but
    // we're using a newly created mock credential now.
    self.credential = mockCredential;
    self.credentialId = mockCredential.id;
    // self.getCredentialByClientId(clientId);
    _display('credential');
  };

  // FIXME: multiple credentials could be returned here
  self.getCredentialByClientId = function(clientId) {
    issuerService.getCredentialByClientId(clientId)
      .success(function(result) {
        self.credential = result[0].credential;
        self.credentialId = result[0].id;
      })
      .error(function(err) {
        alert(err);
      });
  };

  self.acceptCredential = function() {
    issuerService.updateCredential(self.credentialId)
      .success(function(result) {
        self.actionResultMessage = 'The credential has been accepted.';
        _display('actionResult');
      })
      .error(function(err) {
        self.actionResultMessage = err;
        _display('actionResult');
      });
  };

}

return {issuerController: factory};

});
