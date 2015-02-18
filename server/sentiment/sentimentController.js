var Sentiment = require('./sentimentModel');
var sentimentController = {};
sentimentController.addSentiment = addSentiment;
sentimentController.getSentimentsFromKeyword = getSentimentsFromKeyword;
sentimentController.getRedditSentimentsSortedByUpvotes = getRedditSentimentsSortedByUpvotes;
sentimentController.getSentimentById = getSentimentById;
sentimentController.getCommentIdsFromSavedSentiments = getCommentIdsFromSavedSentiments;
sentimentController.deleteSentiments = deleteSentiments;
sentimentController.getAllSentiments = getAllSentiments;

function addSentiment(sentiment) {

  return Sentiment.create(sentiment)
    .then(null, function(err) {
      console.log('error with adding sentiment', err);
    });
}

function getSentimentsFromKeyword(keyword, callback) {
  var days = 30;
  var time = Date.now()/1000 - days * 24 * 60 * 60;
  console.log('getting sentiments');
  Sentiment.find({title: { $regex: new RegExp(keyword, 'i')} , time: { $gte: time }}, callback);
}

function getRedditSentimentsSortedByUpvotes(keyword, callback) {
  var days = 30;
  var time = Date.now()/1000 - days * 24 * 60 * 60;
  console.log('getting reddit comments');
  Sentiment.find({title: { $regex: new RegExp(keyword, 'i')} , time: { $gte: time }, source: 'reddit'}).sort('-upvotes').exec(callback);
}

function getSentimentById(id, callback) {
  Sentiment.findById(JSON.parse(id), callback);
}

function getAllSentiments(callback) {
  Sentiment.find({}, callback);
}

function getCommentIdsFromSavedSentiments() {
  return Sentiment.find({}).exec()
    .then(function(foundSentiments) {
      var commentIds = [];
      for (var i = 0; i < foundSentiments.length; i++) {
        commentIds.push(foundSentiments[i].id);
      }

      return commentIds;
    })
    .then(null, function(err) {
      console.log('error getting commentIds from saved sentiments', err);
    });
}

function getAllSentiments() {

  return Sentiment.find({}).exec();
}

function deleteSentiments() {
  return Sentiment.remove({})
    .exec();
}

module.exports = sentimentController;