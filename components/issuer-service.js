define([], function() {

'use strict';

/* @ngInject */
function factory($http) {
  var self = this;
  var baseUrl = '/creds/';

  self.getCredentialByClientId = function(clientId) {
    // FIXME: adjust endpoint as necessary
    return $http.get(baseUrl + 'claimid/' + clientId);
  };

  self.updateCredential = function(id) {
    var update = {accepted: true};
    return $http.put(baseUrl + id, update);
  };

}

return {issuerService: factory};

});
