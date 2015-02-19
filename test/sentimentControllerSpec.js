var Promise = require('bluebird');
var expect = require('chai').expect;
var sentimentController = Promise.promisifyAll(require('../server/sentiment/sentimentController'));
var config = require('config');

var mongoose = require('mongoose');
mongoose.connect(config.get('mongo'));

describe('Sentiment Controller', function() {
  it('should save a user', function(done) {
    var sample = {
      sentiment: "good",
      commentId: 34534,
      rating: 0.80,
      score: 80,
      title: "React is the best",
      author: "Me",
      date: 56,
      comment: "this is the best thing everr"
    };

    sentimentController.addSentiment(sample)
      .then(function(createdSentiment) {
        console.log(createdSentiment);
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

