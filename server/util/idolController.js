var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var sentimentController = require('../sentiment/sentimentController');
var config = require('config');
var spellCheckerController = require('./spellCheckerController');
var elasticsearchController = require('../elasticsearch/elasticsearchController');

var _apiKey = config.get('idol');
var _syncUrl = 'https://api.idolondemand.com/1/api/sync/analyzesentiment/v1';
var _asyncUrl = 'https://api.idolondemand.com/1/api/async/analyzesentiment/v1';

var idolController = {};
idolController.getSentimentsSync = getSentimentsSync;

function getSentimentsSync(comment) {
  var text = comment.text;
  return spellCheckerController.correctSentence(text)
    .then(function(correctSentence) {
      var queryString = generateQuery(correctSentence);

      return request(_syncUrl + queryString)
      .spread(function (response, body) {

        return parseSentiments(JSON.parse(body), comment);
      })
      .then(null, function(err) {
        console.log('error with idol request', err);
      })

    })
    .then(null, function(err) {
      console.log('error with spellChecker request', err);
    });

}

function generateQuery(text) {
  var queryString = '?text=';
  queryString += text.replace(/ /g, '+');
  queryString += ('&apikey=' + _apiKey);
  return queryString;
}

function parseSentiments(sentiments, comment) {
  var sentimentArray = [];
  console.log(sentiments);
  var positiveSentiments = sentiments.positive;
  var negativeSentiments = sentiments.negative;
  var totalRating = 0;
  var averageRating = 0;
  var totalSentiments = positiveSentiments.length + negativeSentiments.length;
  if (totalSentiments === 0) {
    return;
  }

  for (var i = 0; i < positiveSentiments.length; i++) {
    totalRating += positiveSentiments[i].score;
    sentimentArray.push(positiveSentiments[i].sentiment);
  }
  for (var i = 0; i < negativeSentiments.length; i++) {
    totalRating -= negativeSentiments[i].score;
    sentimentArray.push(negativeSentiments[i].sentiment);
  }

  return sentimentController.addSentiment(createSentimentForDB(averageRating, sentimentArray, comment))
    .then(function(createdSentiment) {
      return elasticsearchController.create(createdSentiment);
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