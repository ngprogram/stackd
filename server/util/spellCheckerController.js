var Promise = require('bluebird');
var ent = require('ent');

var config = require('config');
var request = Promise.promisify(require('request'));
var spellCheckerController = {};

spellCheckerController.correctSentence = correctSentence;

function correctSentence(sentence) {
  if (!sentence) {
    return;
  }
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
  return (function(query) {
    return request(query)
      .spread(function(response, body) {
        if (!JSON.parse(body).suggestion) {
          console.log(JSON.parse(body));
        }

        return JSON.parse(body).suggestion;
      })
      .catch(function(err) {
        console.log('error with spellchecker', err);
      });

  })(options);

}

function generateQuery(sentence) {
  var query = "https://montanaflynn-spellcheck.p.mashape.com/check/?text=";
  var words = sentence.replace(/ /g, "+");

  return query + words;
}

function removeHTML(sentence) {
  return ent.decode(sentence);
}

function removeSpecial(sentence) {
  return sentence.replace(/\<[^>]+\>/g, "").replace(/[^A-Z0-9.,' ]/gi,'')
}

module.exports = spellCheckerController;