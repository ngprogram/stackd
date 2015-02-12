var request = require('request');
// var configAuth = require('../../config/auth');
var sentimentController = require('../sentiment/sentimentController');

// var _apiKey = configAuth.idolAuth.apiKey;

var config = require('config');
var _apiKey = config.get('idol');
var _syncUrl = 'https://api.idolondemand.com/1/api/sync/analyzesentiment/v1';
var _asyncUrl = 'https://api.idolondemand.com/1/api/async/analyzesentiment/v1';

var idolController = {};
idolController.getSentimentsSync = getSentimentsSync;

function getSentimentsSync(comment) {
  var text = comment.text;
  var title = comment.title;
  var time = comment.date;
  var commentId = comment.commentId;
  var parameters = {text: text, language: 'eng', apikey: _apiKey};
  var queryString = generateQuery(text);
  console.log('request being made');
  request({
    method: 'GET',
    uri: _syncUrl + queryString,
  },
  function (error, response) {
    if (error) {
      console.log('error with idol request', error);
    } else if (!Boolean(response.body.match('502 Bad Gateway'))) {
      console.log('running');
      var sentiments = JSON.parse(response.body);
      parseSentiments(sentiments, comment, title, time, commentId);
    } else {
      console.log('did not run');
    }
  });
}

function generateQuery(text) {
  var queryString = '?text=';
  var textArray = text.split(' ');

  for (var i = 0; i < textArray.length; i++) {
    queryString += ('+' + textArray[i]);
  }

  queryString += ('&apikey=' + _apiKey);
  return queryString;
}

function parseSentiments(sentiments, comment, title, time, commentId) {
  var sentimentsArr = [];
  var positiveSentiments = sentiments.positive;
  var negativeSentiments = sentiments.negative;

  if (positiveSentiments && positiveSentiments.length > 0) {
    for (var i = 0; i < positiveSentiments.length; i++) {
      sentimentController.addSentiment(processSentiment(positiveSentiments[i], 'positive', comment, title, time, commentId));
    }
  }
  if (negativeSentiments && negativeSentiments.length > 0) {
    for (var i = 0; i < negativeSentiments.length; i++) {
      sentimentController.addSentiment(processSentiment(negativeSentiments[i], 'negative', comment, title, time, commentId));
    }
  }

  return sentimentsArr;
}

function processSentiment(sentiment, rating, comment, title, time, commentId) {
  var sentimentObj = {};

  sentimentObj.sentiment = sentiment.sentiment;
  sentimentObj.rating = rating;
  sentimentObj.score = sentiment.score;
  sentimentObj.title = title;
  sentimentObj.comment = comment.text;
  sentimentObj.commentId = commentId;
  sentimentObj.date = time;
  sentimentObj.author = comment.by;

  return sentimentObj;
}

module.exports = idolController;