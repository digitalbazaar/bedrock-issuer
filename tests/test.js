/*
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */

'use strict';

var bedrock = require('bedrock');
var superagent = require('superagent');

describe('bedrock-issuer', function() {
  
  describe('TODO: REST API', function() {
    it('should exist', function(done) {
      var old = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
      superagent.get(bedrock.config.server.baseUri + '/')
        .end(function(err, res) {
          process.env.NODE_TLS_REJECT_UNAUTHORIZED = old;
          if(err) {
            return done(err);
          }
          res.status.should.equal(200);
          done();
        });
    });
  });

});
