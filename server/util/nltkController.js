var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var sentimentController = Promise.promisifyAll(require('../sentiment/sentimentController'));
var config = require('config');
var _apiKey = config.get('nltk');
var spellCheckerController = Promise.promisifyAll(require('./spellCheckerController'));

var nltkController = {};
nltkController.getSentimentsSync = getSentimentsSync;

function getSentimentsSync(comment) {
  var text = comment.text;

  return spellCheckerController.correctSentence(text)
    .then(function(correctSentence) {
      var options = {
        uri: "https://japerk-text-processing.p.mashape.com/sentiment/",
        method: "POST",
        headers: {
          "X-Mashape-Key" : _apiKey,
          "Content-Type" : "application/x-www-form-urlencoded",
          "Accept": "application/json",
        },
        form: {"language": "english", "text" : correctSentence}
      };

      return request(options)
        .spread(function (response, body) {
          console.log('hello');
          console.log(body);
          return processSentiment(JSON.parse(body), comment);
        })
    })
    .then(null, function(err) {
      console.log('error with nltk request', err);
    });

}

function processSentiment(sentiment, comment) {
  sentiment = sentiment.probability;
  console.log(sentiment);
  var sentimentObj = {};

  sentimentObj.positive = sentiment.pos;
  sentimentObj.neutral = sentiment.neutral;
  sentimentObj.title = comment.title;
  sentimentObj.comment = comment.text;
  sentimentObj.commentId = comment.commentId;
  sentimentObj.time = comment.time;
  sentimentObj.by = comment.by;

  return sentimentObj;
}

module.exports = nltkController;