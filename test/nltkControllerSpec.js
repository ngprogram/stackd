var Promise = require('bluebird');
var nltkController = Promise.promisifyAll(require('../server/nltk/nltkController'));
var expect = require('chai').expect;

describe("NLTK Controller Spec", function() {
  it('should work', function(done) {
    nltkController.getSentimentsSync()
      .then(function(result) {
        console.log(result);
        done();
      })
  });

});

