var expect = require('chai').expect;
var sentimentController = require('../server/sentiment/sentimentController');

describe('Sentiment Controller', function() {
  it('should save a user', function(done) {
    var sample = {
      sentiment: "good",
      rating: "80",
      score: 0.8,
      title: "React is the best",
      comment: "this is the best thing everr"
    };

    sentimentController.addSentiment(sample, function(err, createdSentiment) {
      console.log(createdSentiment);
      expect(createdSentiment.comment).to.eql("this is the best thing everr");
      done();
    });
  });

  it('should retrive', function(done) {
    sentimentController.getSentimentsFromKeyword('React', function(err, foundSentiments) {
      console.log(foundSentiments);
      done();
    });
  });
});

