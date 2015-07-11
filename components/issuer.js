define([
  'angular',
  'forge/js/forge',
  'did-io',
  'node-uuid',
  './issuer-controller',
  './issuer-service'
], function(angular, forge, didiojs, uuid, issuerController, issuerService) {

'use strict';

var module = angular.module('br.issuer', ['bedrock.alert']);
var didio = didiojs({inject: {
  forge: forge,
  uuid: uuid
}});

module.controller(issuerController);
module.service(issuerService);

return module.name;

});
