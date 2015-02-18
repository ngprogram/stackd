var request = require('request');
var config = require('config');
var sentimentController = require('../sentiment/sentimentController');

var _apiKey = config.get('idol');
var _syncUrl = 'https://api.idolondemand.com/1/api/sync/analyzesentiment/v1';
var _asyncUrl = 'https://api.idolondemand.com/1/api/async/analyzesentiment/v1';

var idolController = {};
idolController.getSentimentsSync = getSentimentsSync;

function getSentimentsSync(comment) {
  var text = comment.text;
  return spellCheckerController.correctSentence(text)
    .then(function(correctSentence) {
      var parameters = {text: text, language: 'eng', apikey: _apiKey};
      var queryString = generateQuery(text);

      return request(_syncUrl + queryString)
        .spread(function (response, body) {

          console.log('body', body);
          var sentiments = JSON.parse(response.body);
          return parseSentiments(sentiments, comment);
        })

    })
    .then(null, function(err) {
      console.log('error with nltk request', err);
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
  sentimentObj.score = sentiment.score;

  if (rating === 'negative') {
    sentimentObj.score = -sentiment.score;
  }

  sentimentObj.title = title;
  sentimentObj.comment = comment.text;
  sentimentObj.commentId = commentId;
  sentimentObj.date = time;
  sentimentObj.author = comment.by;

  return sentimentObj;
}

function createSentimentForDB(sentiment, comment) {
  var sentimentObj = {};
  sentimentObj.commentId = comment.id;

  sentimentObj.score = sentiment.score;

  if (rating === 'negative') {
    sentimentObj.score = -sentiment.score;
  }

  sentimentObj.upvotes = comment.upvotes || 0;


  sentimentObj.title = comment.title;
  sentimentObj.time = comment.time;
  console.log('sentiment', sentimentObj);

  return sentimentObj;
}

module.exports = idolController;