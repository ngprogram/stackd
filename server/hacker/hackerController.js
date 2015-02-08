var request = require('request');
var idolController = require('../idol/idolController');
var aggregatorController = require('../aggregator/aggregatorController');

var hackerController = {};
var total = 0;
var count = 0;

hackerController.gatherSentiments = gatherSentiments;
hackerController.gatherComments = gatherComments;

function gatherSentiments() {
  count = 0;
  total = 0;
  request
    .get('https://hacker-news.firebaseio.com/v0/topstories.json', function(err, response, body) {
      var topIDs = JSON.parse(body);
      topIDs.forEach(function(ID) {
        getCommentsFromStoryID(ID, keyword);
      });
    });
}

function getCommentsFromStoryID(id, keyword) {
  request
    .get('https://hacker-news.firebaseio.com/v0/item/' +id +'.json', function(err, response, body) {

      if (!err) {
        var commentsArray = JSON.parse(body).kids;
        var title = JSON.parse(body).title;
        if (checkTitleForKeyword(keyword, title)) {
          commentsArray.forEach(function(commentId) {
            total++;
            getComment(commentId);
          });
        }
      }
    });
}

//returns comment from
function getComment(id, callback) {
  request
    .get('https://hacker-news.firebaseio.com/v0/item/' +id +'.json', function(err, response, body) {
      if (!err) {
        var comment = JSON.parse(body).text;
        commentsArray.push(comment);
        idolController.getSentimentsSync(comment);
      }
    });
}

function checkTitleForKeyword(keyword, title) {
  return Boolean(title.toLowerCase().match(keyword.toLowerCase()));
}

module.exports = hackerController;



