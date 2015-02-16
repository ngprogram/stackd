var Promise = require('bluebird');
var spellCheckerController = Promise.promisifyAll(require('../server/util/spellCheckerController'));
var expect = require('chai').expect;

describe("Spell Checker Controller Spec", function() {
  it('should work', function(done) {
    var sampleSentence = "this sentance has som problem";

    spellCheckerController.correctSentence(sampleSentence)
      .then(function(result) {
        console.log(result);
        done();
      })
  });

});

