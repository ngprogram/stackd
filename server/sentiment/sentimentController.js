var mongoose = require('mongoose');
var Sentiment = require('./sentimentModel');
var mongooseURI = require('../../config/database');

mongoose.connect(mongooseURI.URI);

var sentimentController = {};
sentimentController.addSentiment = addSentiment;

function addSentiment(sentiment, callback) {
  Sentiment.create(sentiment, callback);
}

module.exports = sentimentController;