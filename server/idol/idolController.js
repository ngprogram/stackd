var request = require('request');
var configAuth = require('../../config/auth');
var sentimentController = require('../sentiment/sentimentController');

var _apiKey = configAuth.idolAuth.apiKey;
var _syncUrl = 'https://api.idolondemand.com/1/api/sync/analyzesentiment/v1';
var _asyncUrl = 'https://api.idolondemand.com/1/api/async/analyzesentiment/v1';

var idolController = {};
idolController.getSentimentsSync = getSentimentsSync;
// idolController.getSentimentsAsync = getSentimentsAsync;

function getSentimentsSync(comment) {
  var text = comment.text;
  var title = comment.title;
  var time = comment.date;
  var parameters = {text: text, language: 'eng', apikey: _apiKey};
  var queryString = generateQuery(text);

  request({
    method: 'GET',
    uri: _syncUrl + queryString,
  },
  function (error, response) {
    var sentiments = JSON.parse(response.body);
    if (error) {
      console.log(err);
    } else {
      parseSentiments(sentiments, comment, title, time);
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

function parseSentiments(sentiments, comment, title, time) {
  var sentimentsArr = [];
  var positiveSentiments = sentiments.positive;
  var negativeSentiments = sentiments.negative;

  if (positiveSentiments && positiveSentiments.length > 0) {
    console.log(positiveSentiments);
    for (var i = 0; i < positiveSentiments.length; i++) {
      sentimentController.addSentiment(processSentiment(positiveSentiments[i], 'positive', comment, title));
    }
  }
  if (negativeSentiments && negativeSentiments.length > 0) {
    for (var i = 0; i < negativeSentiments.length; i++) {
      sentimentController.addSentiment(processSentiment(negativeSentiments[i], 'negative', comment, title, time));
    }
  }

  return sentimentsArr;
}

function processSentiment(sentiment, rating, comment, title, time) {
  var sentimentObj = {};

  sentimentObj.sentiment = sentiment.sentiment;
  sentimentObj.rating = rating;
  sentimentObj.score = sentiment.score;
  sentimentObj.title = title;
  sentimentObj.comment = comment.text;
  sentimentObj.date = time;
  sentimentObj.author = comment.by;

  return sentimentObj;
}

module.exports = idolController;