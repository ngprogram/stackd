var mongoose = require('mongoose');
var Sentiment = require('./sentimentModel');
var mongooseURI = require('../../config/database');

mongoose.connect(mongooseURI.URI);
// mongoose.connect('mongodb://localhost/stackd');


var sentimentController = {};
sentimentController.addSentiment = addSentiment;
sentimentController.getSentimentsFromKeyword = getSentimentsFromKeyword;
sentimentController.getCommentFromSentimentID = getCommentFromSentimentID;

function addSentiment(sentiment, callback) {
  Sentiment.create(sentiment, callback);
}

function getSentimentsFromKeyword(keyword, callback) {
  Sentiment.find({title: { $regex: new RegExp(keyword, 'i')}}, callback);
}

//passing back single object, and need id
function getCommentFromSentimentID(id, callback) {
  Sentiment.findById(id, callback);


module.exports = sentimentController;