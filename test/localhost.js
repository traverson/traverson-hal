'use strict';

var traverson = require('traverson')
  , waitFor = require('poll-forever')
  , chai = require('chai')
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , assert = chai.assert
  , expect = chai.expect;

chai.use(sinonChai);

var JsonHalAdapter = require('..');
traverson.registerMediaType(JsonHalAdapter.mediaType, JsonHalAdapter);

describe('Traverson (when tested against a local server)', function() {

  var jsonHalApi;
  var testServer;
  var callback;
  var rootUri = 'http://127.0.0.1:2808/';

  before(function() {
    if (isNodeJs()) {
      testServer = require('traverson-test-server')
      testServer.start();
    }
  });

  after(function() {
    if (isNodeJs() && testServer) {
      testServer.stop();
    }
  });

  beforeEach(function() {
    jsonHalApi = traverson
      .jsonHal
      .from(rootUri)
      .newRequest()
      .withRequestOptions({
      headers: {
        'Accept': 'application/hal+json',
        'Content-Type': 'application/json'
      }
    });
    callback = sinon.spy();
  });

  it('should follow a multi-element path in hal+json', function(done) {
    jsonHalApi.follow('first', 'second').get(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.second).to.exist;
        expect(resultDoc.second).to.equal('document');
        done();
      }
    );
  });

  it('should follow a multi-element path in hal+json using an embedded ' +
      'resource along the way', function(done) {
    jsonHalApi.follow('first',
        'contained_resource',
        'embedded_link_to_second')
      .get(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.second).to.exist;
        expect(resultDoc.second).to.equal('document');
        done();
      }
    );
  });

  it('should follow a multi-element path in hal+json yielding an embedded ' +
      'resource to the callback',
      function(done) {
    jsonHalApi.follow('first',
        'second',
        'inside_second')
      .get(callback);
    waitFor(
      function() { return callback.called; },
      function() {
        var resultDoc = checkResponseWithBody();
        expect(resultDoc.more).to.exist;
        expect(resultDoc.more).to.equal('data');
        done();
      }
    );
  });

  function isNodeJs() {
    // can't use strict here
    if (typeof window !== 'undefined') {
      return false;
    } else if (typeof process !== 'undefined') {
      return true;
    } else {
      throw new Error('Can\'t figure out environment. ' +
          'Seems it\'s neither Node.js nor a browser.');
    }
  }

  function checkResponseWithBody(httpStatus) {
    var response = checkResponse(httpStatus);
    var body = response.body;
    expect(body).to.exist;
    var resultDoc = JSON.parse(body);
    return resultDoc;
  }

  function checkResponse(httpStatus) {
    httpStatus = httpStatus || 200;
    expect(callback.callCount).to.equal(1);
    var error = callback.firstCall.args[0];
    expect(error).to.not.exist;
    var response = callback.firstCall.args[1];
    expect(response).to.exist;
    expect(response.statusCode).to.exist;
    expect(response.statusCode).to.equal(httpStatus);
    return response;
  }
});
