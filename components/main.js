define([
  'angular',
  'underscore',
  'did-io',
  './issuer',
  './login'
], function(
  angular, _, didio
) {

'use strict';

var module = angular.module('br.manualPickup', ['br.issuer', 'br.issuerLogin']);

/* @ngInject */
module.config(function($routeProvider) {
  $routeProvider
    .when('/issuer', {
      title: 'Issuer Login',
      templateUrl: requirejs.toUrl('bedrock-issuer-components/login.html')
    })
    .when('/issuer/dashboard', {
      title: 'Issuer Dashboard',
      templateUrl: requirejs.toUrl('bedrock-issuer-components/dashboard.html')
    })
    .when('/credentiallogin', {
      title: 'Issuer Dashboard',
      templateUrl: requirejs.toUrl('bedrock-issuer-components/dashboard.html')
    })
    .when('/acknowledgements', {
      title: 'Storage Acknowledgement',
      templateUrl: requirejs.toUrl('bedrock-issuer-components/dashboard.html')
    });
});

return module.name;
});
