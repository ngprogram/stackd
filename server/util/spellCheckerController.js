var Promise = require('bluebird');
var ent = require('ent');

var config = require('config');
var request = Promise.promisify(require('request'));
var spellCheckerController = {};

spellCheckerController.correctSentence = correctSentence;

function correctSentence(sentence) {
  sentence = removeHTML(sentence);
  sentence = removeSpecial(sentence);

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
      console.log('final', JSON.parse(body).suggestion);
      return JSON.parse(body).suggestion;
    });
}


function generateQuery(sentence) {
  var query = "https://montanaflynn-spellcheck.p.mashape.com/check/?text=";
  var words = sentence.split(" ").join("+");

  return query + words;
}

function removeHTML(sentence) {
  return ent.decode(sentence);
}

function removeSpecial(sentence) {
  return sentence.replace(/ *\<[^)]*\> */g, "").replace(/[^A-Z0-9.,' ]/gi,'')
}

module.exports = spellCheckerController;