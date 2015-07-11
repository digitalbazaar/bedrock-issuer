define([], function() {

'use strict';

/* @ngInject */
function factory(config) {
  var self = this;
  self.baseUri = config.data.baseUri;
  self.aioBaseUri = config.data.aioBaseUri;

  self.login = function() {
    var query = {
      '@context': 'https://w3id.org/identity/v1',
      id: ''
    };
    // FIXME: the credentialCallback specified here is provisional, this
    // endpoint corresponds to one that works with the credential authentication
    // strategy
    var options = {
      requestUrl: self.aioBaseUri + '/requests?action=request',
      credentialCallback: self.baseUri + '/credentiallogin'
    };
    return navigator.credentials.request(query, options);
  };

};

return {loginController: factory};

});
