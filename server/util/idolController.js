var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var sentimentController = Promise.promisifyAll(require('../sentiment/sentimentController'));
var config = require('config');
var spellCheckerController = Promise.promisifyAll(require('./spellCheckerController'));

var _apiKey = config.get('idol');
console.log('apiKey', _apiKey);
var _syncUrl = 'https://api.idolondemand.com/1/api/sync/analyzesentiment/v1';
var _asyncUrl = 'https://api.idolondemand.com/1/api/async/analyzesentiment/v1';

var idolController = {};
idolController.getSentimentsSync = getSentimentsSync;

function getSentimentsSync(comment) {
  var text = comment.text;
  return spellCheckerController.correctSentence(text)
    .then(function(correctSentence) {
      var parameters = {text: text, language: 'eng', apikey: _apiKey};
      var queryString = generateQuery(correctSentence);
      console.log('queryString', _syncUrl + queryString);
      return request(_syncUrl + queryString)
        .spread(function (response, body) {
          console.log('BODY', body);
          return parseSentiments(JSON.parse(body), comment);
        })

    })
    .catch(function(err) {
      console.log('catching');
      console.log(err);
    })
    .then(null, function(err) {
      console.log('error with idol request', err);
    });

}



function generateQuery(text) {
  var queryString = '?text=';
  queryString += text.replace(/ /g, '+');
  queryString += ('&apikey=' + _apiKey);
  return queryString;
}

function parseSentiments(sentiments, comment) {
  var sentimentsArr = [];
  var positiveSentiments = sentiments.positive;
  var negativeSentiments = sentiments.negative;

  for (var i = 0; i < positiveSentiments.length; i++) {
    sentimentsArr.push(sentimentController.addSentiment(createSentimentForDB(positiveSentiments[i], 'positive', comment)));
  }
  for (var i = 0; i < negativeSentiments.length; i++) {
    sentimentsArr(sentimentController.addSentiment(createSentimentForDB(negativeSentiments[i], 'negative', comment)));
  }

  return Promise.all(sentimentsArr)
    .then(null, function(err) {
      console.log('error with parsing sentiments', err);
    });
}

function createSentimentForDB(sentiment, positiveOrNegative, comment) {
  var sentimentObj = {};

  sentimentObj.score = sentiment.score;
  if (positiveOrNegative === 'negative') {
    sentimentObj.score = -sentiment.score;
  }
  sentimentObj.commentId = comment.id;
  sentimentObj.upvotes = comment.upvotes || 0;
  sentimentObj.title = comment.title;
  sentimentObj.time = comment.time;
  sentimentObj.source = comment.source;
  sentimentObj.sentiment = sentiment.sentiment;
  sentimentObj.comment = comment.text;

  return sentimentObj;
}

module.exports = idolController;