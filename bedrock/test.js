/*
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');
var config = bedrock.config;

require('bedrock-express');
require('../lib/issuer');

// Loads a fake credential into the database
require('./load-data');

bedrock.events.on('bedrock.configure', function() {
  // server info
  config.server.port = 35443;
  config.server.httpPort = 35080;
  config.server.bindAddr = ['bedrock-issuer.dev'];
  config.server.domain = 'bedrock-issuer.dev';
  config.server.host = 'bedrock-issuer.dev:35443';
  config.server.baseUri = 'https://' + config.server.host;
  config.views.vars.baseUri = config.server.baseUri;
  config.views.vars.aioBaseUri = 'https://authorization.dev:33443';
});

bedrock.start();
