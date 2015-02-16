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

  it('should work with ', function(done) {
    var sampleSentence = "&gt; its impetus is clearly not really to make the world a better place or to solve serious problems affecting many millions (billions?) of people but to<p>Are you suggesting millions (billions?) of people don&#x27;t have a problem with death&#x2F;cancer&#x2F;dementia? Because that&#x27;s obviously incorrect!<p>What do you think would happen if top research scientists lived longer and maintained their intellectual capabilities?<p>What would happen if people stopped thinking so much in the short term, because they expected to face the consequences of the more distant future?<p>What would happen to the resources that are currently being spent on diseases of ageing? Heart disease, cancer, dementia.<p>How much wealth would be created by an increased number of experienced people working?<p>Resource allocation to lifespan&#x2F;healthspan doesn&#x27;t seem zero-sum. Despite the temptation to create a dichotomy, there is none!";

    spellCheckerController.correctSentence(sampleSentence)
      .then(function(result) {

        console.log();

      });

  })
});

