/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');
var config = bedrock.config;

require('bedrock-express');
require('bedrock-identity-http');
require('../lib/issuer');

// FIXME: this event is used to make sure that server.host is set properly
// during tests.  If these values are set outside this function, server.host
// is bedrock.dev during testing.
bedrock.events.on('bedrock.configure', function() {
  // server info
  config.server.port = 35443;
  config.server.httpPort = 35080;
  config.server.bindAddr = ['bedrock-issuer.dev'];
  config.server.domain = 'bedrock-issuer.dev';
  config.server.host = 'bedrock-issuer.dev:35443';
  config.server.baseUri = 'https://' + config.server.host;
  config.views.vars.baseUri = config.server.baseUri;
  config.views.vars['authorization-io'] = {};
  config.views.vars['authorization-io'].baseUri =
    'https://authorization.dev:33443';
});

bedrock.start();
