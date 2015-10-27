/*!
 * Issuer components module.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author David I. Lehn
 */
define([
  'angular'
], function(angular) {

'use strict';

var module = angular.module(
  'bedrock-issuer.main', Array.prototype.slice.call(arguments, 1));

/* @ngInject */
module.config(function($routeProvider) {
});

return module.name;

});
