var expect = require('chai').expect;
var sentimentController = require('../server/sentiment/sentimentController');

describe('Sentiment Controller', function() {
  it('should save a user', function(done) {
    var sample = {
      percentage: 80,
      sentiments: ['awesome']
    }
    sentimentController.addSentiment(sample, function(err, createdSentiment) {
      expect(createdSentiment.percentage).to.eql(80);
      expect(createdSentiment.sentiments[0]).to.eql('awesome');
      done();
    });
  });
});

