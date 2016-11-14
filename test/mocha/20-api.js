/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* globals should */
'use strict';

var async = require('async');
var bedrock = require('bedrock');
var brIssuer = require('bedrock-issuer');
var eventLog = require('bedrock-event-log').log;
var helpers = require('./helpers');
var mockData = require('./mock.data');
var uuid = require('uuid').v4;

describe('node API', () => {
  before('Prepare the database', function(done) {
    helpers.prepareDatabase(mockData, done);
  });
  after('Remove test data', function(done) {
    helpers.removeCollections(done);
  });
  describe('issue API', () => {
    it('should issue a credential with a null actor', done => {
      bedrock.events.on(
        `bedrock-issuer.credential.CredentialIssue`, (e, callback) => {
          eventLog.add(e, callback);
        });
      var credential = bedrock.util.clone(mockData.unsignedCredential);
      credential.issuer = mockData.identities.organizationAlpha.identity.id;
      credential.id = uuid();
      async.auto({
        issue: callback => {
          brIssuer.issue(null, credential, callback);
        },
        findEvent: ['issue', callback => {
          eventLog.find({}, callback);
        }],
        test: ['findEvent', (callback, results) => {
          var r = results.findEvent;
          r.should.be.an('array');
          r.should.have.length(1);
          r[0].event.should.be.an('object');
          var event = r[0].event;
          event.type.should.equal('CredentialIssue');
          event.issuer.should.equal(credential.issuer);
          should.not.exist(event.actor);
          callback();
        }]
      }, done);
    });
  });
});
