var mongoose = require('mongoose');
var $ = require('jquery');
var sentimentController = require('../sentiment/sentimentController');
var topicController = require('../topic/topicController');

var _apiKey = '';
var _syncUrl = 'https://api.idolondemand.com/1/api/sync/analyzesentiment/v1';
var _asyncUrl = 'https://api.idolondemand.com/1/api/async/analyzesentiment/v1';

var idolController = {};
idolController.getSentimentsSync = getSentimentsSync;
// idolController.getSentimentsAsync = getSentimentsAsync;


function getSentimentsSync(text, callback) {
  var parameters = {text: text, language: 'eng', apikey: _apiKey};

  $.ajax({
    url: _syncUrl,
    type: 'GET',
    data: parameters,
    success: function(sentiments) {
      callback(parseSentiments(sentiments));
    },
    error: function(err) {
      console.log('Failed to get Sentiments', err);
    }
  });
}

function parseSentiments(sentiments) {
  var sentimentsArr = [];
  var positiveSentiments = sentiments.positive;
  var negativeSentiments = sentiments.negative;

  if (positiveSentiments) {
    for (var i = 0; i < positiveSentiments.length; ) {
      sentimentsArr.push(processSentiment(sentiments.positive, 'positive'));
    }
  }
  if (negativeSentiments) {
    for (var i = 0; i < positiveSentiments.length; ) {
      sentimentsArr.push(processSentiment(sentiments.negative, 'negative'));
    }
  }

  return sentimentsArr;
}

function processSentiment(sentiment, rating) {
  var sentimentObj = {};

  sentimentObj.sentiment = sentiment.sentiment;
  sentimentObj.rating = rating;
  sentimentObj.score = sentiment.score;
  sentimentObj.topic = sentiment.topic;

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