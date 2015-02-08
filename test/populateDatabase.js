var hackerController = require('../server/hacker/hackerController');
var request = require('request');

function fillDatabase() {
  request
    .get('https://hacker-news.firebaseio.com/v0/topstories.json', function(err, response, body) {
      console.log('id');
      var topID = JSON.parse(body)[99];
      hackerController.populate(topID-1000, topID);
    });
}

fillDatabase();