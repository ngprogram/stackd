var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var sentimentController = Promise.promisifyAll(require('../sentiment/sentimentController'));
var config = require('config');
var _apiKey = config.get('nltk');
var _syncUrl = 'https://api.idolondemand.com/1/api/sync/analyzesentiment/v1';
var _asyncUrl = 'https://api.idolondemand.com/1/api/async/analyzesentiment/v1';

var nltkController = {};
nltkController.getSentimentsSync = getSentimentsSync;

function getSentimentsSync(comment) {
  var text = comment.text;
  var title = comment.title;
  var time = comment.date;
  var commentId = comment.commentId;
  var parameters = {text: text, language: 'eng', apikey: _apiKey};
  var queryString = generateQuery(text);
  console.log('text', text);
  console.log('apikey', _apiKey);
  var options = {
    uri: "https://japerk-text-processing.p.mashape.com/sentiment/",
    method: "POST",
    headers: {
      "X-Mashape-Key" : _apiKey,
      "Content-Type" : "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    form: {"language": "english", "text" : text}
  };

  return request(options)
    .spread(function (response, body) {
      console.log('hello');
      console.log(body);
      return parseSentiments(JSON.parse(body), comment, title, time, commentId);
    })
    .then(null, function(err) {
      console.log('error with nltk request', err);
    });
}

function parseSentiments(sentiments, comment, title, time, commentId) {
  var sentimentsArr = [];
  var positiveSentiments = sentiments.positive;
  var negativeSentiments = sentiments.negative;

  if (positiveSentiments && positiveSentiments.length > 0) {
    for (var i = 0; i < positiveSentiments.length; i++) {
      sentimentsArr.push(processSentiment(positiveSentiments[i], 'positive', comment, title, time, commentId));
    }
  }
  if (negativeSentiments && negativeSentiments.length > 0) {
    for (var i = 0; i < negativeSentiments.length; i++) {
      sentimentsArr.push(processSentiment(negativeSentiments[i], 'negative', comment, title, time, commentId));
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

function generateQuery(text) {
  var queryString = '?text=';
  var textArray = text.split(' ');

  for (var i = 0; i < textArray.length; i++) {
    queryString += ('+' + textArray[i]);
  }
  queryString += ('&apikey=' + _apiKey);
  return queryString;
}

module.exports = nltkController;