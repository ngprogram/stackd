var Sentiment = require('./sentimentModel');

// mongoose.connect('mongodb://localhost/stackd');


var sentimentController = {};
sentimentController.addSentiment = addSentiment;
sentimentController.getSentimentsFromKeyword = getSentimentsFromKeyword;
sentimentController.getCommentFromSentimentID = getCommentFromSentimentID;

function addSentiment(sentiment, callback) {
  Sentiment.create(sentiment, callback);
}

function getSentimentsFromKeyword(keyword, callback) {
  var days = 30;
  var time = Date.now() - 30 * 24 * 60 * 60 * 1000;
  Sentiment.find({title: { $regex: new RegExp(keyword, 'i')}, date: { $gte: time }}, callback);
}

//passing back single object, and need id
function getCommentFromSentimentID(id, callback) {
  Sentiment.findById(JSON.parse(id), callback);
}

module.exports = sentimentController;