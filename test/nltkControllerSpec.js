var Promise = require('bluebird');
var nltkController = Promise.promisifyAll(require('../server/util/nltkController'));
var expect = require('chai').expect;

describe("NLTK Controller Spec", function() {
  it('should work', function(done) {
    var sampleComment = {
      commentId: 1,
      text: "great movie!",
      parentId: 345,
      time: Date.now(),
      by: "Alex",
      title: "Some title"
    }

    nltkController.getSentimentsSync(sampleComment)
      .then(function(result) {
        console.log(result);
        done();
      })
  });

});

