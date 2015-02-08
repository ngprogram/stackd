var mongoose = require('mongoose');
var Sentiment = require('./sentimentModel');
var mongooseURI = require('../../config/database');

mongoose.connect(mongooseURI.URI);

var sentimentController = {};
sentimentController.addSentiment = addSentiment;
sentimentController.getSentimentsFromKeyword = getSentimentsFromKeyword;
sentimentController.getCommentFromSentiment = getCommentFromSentiment;

function addSentiment(sentiment, callback) {
  Sentiment.create(sentiment, callback);
}

function getSentimentsFromKeyword(keyword, callback) {
  Sentiment.find({title: { $regex: new RegExp(keyword)}}, callback);
}

function getCommentFromSentiment(sentiment, keyword, callback) {
  Sentiment.find({sentiment: sentiment, topic: keyword}, callback);
}

module.exports = sentimentController;