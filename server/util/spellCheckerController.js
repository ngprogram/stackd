var Promise = require('bluebird');

var config = require('config');
var request = Promise.promisify(require('request'));
var spellCheckerController = {};

spellCheckerController.correctSentence = correctSentence;

function correctSentence(sentence) {
  var options = {
    method: "GET",
    url: generateQuery(sentence),
    headers : {
      "X-Mashape-Key" : config.get('spellcheck'),
      "Accept" : "application/json"
    }
  }

  return request(options)
    .spread(function(response, body) {

      return JSON.parse(body).suggestion;
    });
}


function generateQuery(sentence) {
  var query = "https://montanaflynn-spellcheck.p.mashape.com/check/?text=";
  var words = sentence.split(" ").join("+");

  return query + words;
}

module.exports = spellCheckerController;