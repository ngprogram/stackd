var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var sentimentController = require('../sentiment/sentimentController');
var config = require('config');
var spellCheckerController = require('./spellCheckerController');

var _apiKey = config.get('idol');
var _syncUrl = 'https://api.idolondemand.com/1/api/sync/analyzesentiment/v1';
var _asyncUrl = 'https://api.idolondemand.com/1/api/async/analyzesentiment/v1';

var idolController = {};
idolController.getSentimentsSync = getSentimentsSync;

function getSentimentsSync(comment) {
  var text = comment.text;

  return (function(incorrectText) {
    return spellCheckerController.correctSentence(incorrectText).then(function(correctSentence) {
      if (correctSentence) {
        var queryString = generateQuery(correctSentence);

        return request(_syncUrl + queryString)
        .spread(function (response, body) {
          return parseSentiments(JSON.parse(body), comment);
        })
        .then(null, function(err) {
          console.log('error with idol request', err);
        })
      } else {
        console.log('incorrect sentence', incorrectText, correctSentence);
      }

    })
    .then(null, function(err) {
      console.log('error with spellChecker request', err);
    });
  })(text);

}

function generateQuery(text) {
  var queryString = '?text=';
  queryString += text.replace(/ /g, '+');
  queryString += ('&apikey=' + _apiKey);

  return queryString;
}

function parseSentiments(sentiments, comment) {
  var sentimentArray = [];
  var positiveSentiments = sentiments.positive;
  var negativeSentiments = sentiments.negative;
  var averageRating = 0;
  var totalSentiments = positiveSentiments.length + negativeSentiments.length;

  for (var i = 0; i < positiveSentiments.length; i++) {
    sentimentArray.push(positiveSentiments[i].sentiment);
  }
  for (var i = 0; i < negativeSentiments.length; i++) {
    sentimentArray.push(negativeSentiments[i].sentiment);
  }

  averageRating = sentiments.aggregate.score;

  console.log('average rating', averageRating);
  return sentimentController.addSentiment(createSentimentForDB(averageRating, sentimentArray, comment))
    .then(function(createdSentiment) {
      console.log('added sentiment');
      return createdSentiment;
    })
    .then(null, function(err) {
      console.log('error with parsing sentiments', err);
    });
}

function createSentimentForDB(rating, sentimentArray, comment) {
  var sentimentObj = {};

  sentimentObj.rating = rating; // -1 - 1
  sentimentObj.commentId = comment.id;
  sentimentObj.score = comment.score || 0; //number of upvotes
  sentimentObj.title = comment.title;
  sentimentObj.time = comment.time;
  sentimentObj.source = comment.source;
  sentimentObj.sentiment = sentimentArray;
  sentimentObj.comment = comment.text;
  return sentimentObj;
}

module.exports = idolController;