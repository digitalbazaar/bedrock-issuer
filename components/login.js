define(
[
  'angular',
  './login-controller'
],
function(angular, loginController) {

'use strict';

var module = angular.module('br.issuerLogin', ['bedrock.alert']);

module.controller(loginController);

return module.name;

});
