var Promise = require('bluebird');
var Sentiment = require('./sentimentModel');

var sentimentController = {};
sentimentController.addSentiment = addSentiment;
sentimentController.getSentimentsFromKeyword = getSentimentsFromKeyword;
sentimentController.getSentimentById = getSentimentById;
sentimentController.getCommentIdsFromSavedSentiments = getCommentIdsFromSavedSentiments;

function addSentiment(sentiment, callback) {
  Sentiment.create(sentiment, callback);
}

function getSentimentsFromKeyword(keyword, callback) {
  var days = 30;
  var time = Date.now()/1000 - days * 24 * 60 * 60;
  console.log('keyword', keyword);
  console.log('time', time);
  Sentiment.find({title: { $regex: new RegExp(keyword, 'i')}, date: { $gte: time }}, callback);
}

function getSentimentById(id, callback) {
  Sentiment.findById(JSON.parse(id), callback);
}

function getAllSentiments(callback) {
  Sentiment.find({}, callback);
}

function getCommentIdsFromSavedSentiments(callback) {
  Sentiment.find({}, function(err, foundSentiments) {
    var commentIds = [];
    for (var i = 0; i < foundSentiments.length; i++) {
      commentIds.push(foundSentiments[i].commentId);
    }
    callback(err, commentIds);
  });
}

module.exports = sentimentController;