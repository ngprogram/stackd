var Sentiment = require('./sentimentModel');

var sentimentController = {};
sentimentController.addSentiment = addSentiment;
sentimentController.getSentimentsFromKeyword = getSentimentsFromKeyword;
sentimentController.getCommentFromSentimentID = getCommentFromSentimentID;

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

//passing back single object, and need id
function getCommentFromSentimentID(id, callback) {
  Sentiment.findById(JSON.parse(id), callback);
}

module.exports = sentimentController;