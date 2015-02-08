var request = require('request');
var configAuth = require('../../config/auth');
var sentimentController = require('../sentiment/sentimentController');

var _apiKey = configAuth.idolAuth.apiKey;
var _syncUrl = 'https://api.idolondemand.com/1/api/sync/analyzesentiment/v1';
var _asyncUrl = 'https://api.idolondemand.com/1/api/async/analyzesentiment/v1';

var idolController = {};
idolController.getSentimentsSync = getSentimentsSync;
// idolController.getSentimentsAsync = getSentimentsAsync;

function getSentimentsSync(text, title) {
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
      parseSentiments(sentiments, text, title);
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

function parseSentiments(sentiments, comment, title) {
  var sentimentsArr = [];
  var positiveSentiments = sentiments.positive;
  var negativeSentiments = sentiments.negative;

  if (positiveSentiments) {
    console.log(positiveSentiments);
    for (var i = 0; i < positiveSentiments.length; i++) {
      sentimentController.addSentiment(processSentiment(positiveSentiments[i], 'positive', comment, title));
    }
  }
  if (negativeSentiments) {
    for (var i = 0; i < negativeSentiments.length; i++) {
      sentimentController.addSentiment(processSentiment(negativeSentiments[i], 'negative', comment, title));
    }
  }

  return sentimentsArr;
}

function processSentiment(sentiment, rating, comment, title) {
  var sentimentObj = {};

  sentimentObj.sentiment = sentiment.sentiment;
  sentimentObj.rating = rating;
  sentimentObj.score = sentiment.score;
  sentimentObj.title = title;
  sentimentObj.comment = comment;

  return sentimentObj;
}

// function saveSentiments(sentimentsArr, topic, rating) {
//   for (var i = 0; i < sentimentsArr.length; i++) {
//     var sentimentToSave = {};
//     var sentiment = sentimentsArr[i];

//     sentimentToSave.sentiment = sentiment.sentiment;
//     sentimentToSave.rating = rating;
//     sentimentToSave.score = sentiment.score;
//     sentimentToSave.topic = sentiment.topic;
//     sentimentToSave.count = 1;

//     sentimentController.save(sentimentToSave);
//   }
// }

// function saveTopic(sentimentsObj, topic) {
//   var topicToSave = {};
//   var aggregate = sentimentsObj.aggregate;

//   topicToSave.topic = aggregate.topic;
//   topicToSave.sentimentCount = countSentiments(sentimentsObj);
//   topicToSave.aggregateSentiment = aggregate.sentiment;
//   topicToSave.aggregateSentimentScore = aggregate.score;
// }

// function countSentiments(sentimentsObj) {
//   var count = 0;

//   if (sentiments.positive) {
//     for (var i = 0; i < sentiments.positive.length; i++) {
//       count++;
//     }
//   }
//   if (sentiments.negative) {
//     for (var i = 0; i < sentiments.negative.length; i++) {
//       count++;
//     }
//   }

//   return count;
// }

module.exports = idolController;