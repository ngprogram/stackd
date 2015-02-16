var Promise = require('bluebird');
var spellCheckerController = Promise.promisifyAll(require('../server/util/spellCheckerController'));
var expect = require('chai').expect;

describe("Spell Checker Controller Spec", function() {
  xit('should work', function(done) {
    var sampleSentence = "this sentance has som problem";

    spellCheckerController.correctSentence(sampleSentence)
      .then(function(result) {
        console.log(result);
        done();
      })
  });

  xit('should work with ', function(done) {
    var sampleSentence = "&gt; its impetus is clearly not really to make the world a better place or to solve serious problems affecting many millions (billions?) of people but to<p>Are you suggesting millions (billions?) of people don&#x27;t have a problem with death&#x2F;cancer&#x2F;dementia? Because that&#x27;s obviously incorrect!<p>What do you think would happen if top research scientists lived longer and maintained their intellectual capabilities?<p>What would happen if people stopped thinking so much in the short term, because they expected to face the consequences of the more distant future?<p>What would happen to the resources that are currently being spent on diseases of ageing? Heart disease, cancer, dementia.<p>How much wealth would be created by an increased number of experienced people working?<p>Resource allocation to lifespan&#x2F;healthspan doesn&#x27;t seem zero-sum. Despite the temptation to create a dichotomy, there is none!";

    spellCheckerController.correctSentence(sampleSentence)
      .then(function(result) {
        console.log(result);
      });

  });

  xit('should work with ', function(done) {
    var sampleSentence = "It&#x27;ll be interesting to see whether this has an effect on the nature of upvoting. If saved comments were slightly more structured, rather than just one big list, I could imagine them comprising some sort of &#x27;personal knowledgebase&#x27;. In turn, that might decrease the amount of &#x27;I agree with that&#x27; opinion upvoting, in favour of &#x27;that&#x27;s useful information&#x27;. Whether that&#x27;s to be encouraged is, of course, a personal opinion.";

    spellCheckerController.correctSentence(sampleSentence)
      .then(function(result) {
        console.log(result);
      });
  });

  it('should work with ', function(done) {
    var sampleSentence = "SortedList lets you get(i) to get the ith item in sorted order, and that&#x27;s as fast as a TreeSet contains. It also splays so near each other faster the second+ time called. I use this for UIs that do scrolling&#x2F;paging, and for models&#x2F;view s that need to query ordered data. For example I have messages coming in real time, put them in a sorted list by importance, and display with a simple list view. Each time a new message comes in, it&#x27;s lg time to update the view regardless of how long it is.";

    spellCheckerController.correctSentence(sampleSentence)
      .then(function(result) {
        console.log(result);
      });
  });

  it('should work with ', function(done) {
    var sampleSentence = "&gt; Client-side code is about displaying things<p>Actually, JS developers are learning that this is frequently better done on the server; there are more and more articles every week about the benefits of pre-rendering the application page on the server side, then letting the client JS take over and make the server generated code responsive.<p>I believe the term being used is &quot;isomorphic&quot; javascript.<p>However, since the Node.js server is inherently single threaded, the cost of generating these templates server side impacts every connection being handled by that particular instance.";

    spellCheckerController.correctSentence(sampleSentence)
      .then(function(result) {
        console.log(result);
      });
  });



});

