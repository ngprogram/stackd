var Sentiment = require('./sentimentModel');
var sentimentController = {};
sentimentController.addSentiment = addSentiment;
sentimentController.getSentimentsFromKeyword = getSentimentsFromKeyword;
sentimentController.getSentimentById = getSentimentById;
sentimentController.getCommentIdsFromSavedSentiments = getCommentIdsFromSavedSentiments;

function addSentiment(sentiment) {

  return Sentiment.create(sentiment)
    .then(function(createdSentiment) {
      return createdSentiment;
    })
    .then(null, function(err) {
      console.log('error with adding sentiment', err);
    });
}

function getSentimentsFromKeyword(keyword, callback) {
  var days = 30;
  var time = Date.now()/1000 - days * 24 * 60 * 60;
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