var request = require('request');
// var idolController = require('../idol/idolController');
var aggregatorController = require('../aggregator/aggregatorController');

var hackerController = {};
var counter = 0;
var total = 0;
var count = 0;

hackerController.getCommentsFromStoryID = getCommentsFromStoryID;
hackerController.getComment = getComment;
hackerController.gatherComments = gatherComments;

function gatherComments(req, res, next) {
  var keyword = req.body.keyword;
  goThroughTitles(keyword, function(err, sentiment) {
    if (!err) {
      // aggregatorController.add(sentiment);
    }
    if (count < total) {
      count++;
    }
    console.log('counter', count);
    console.log('total', total);
    if (count >= total) {
      next();
    }
  });
}

function goThroughTitles(keyword, callback) {
  count = 0;
  request
    .get('https://hacker-news.firebaseio.com/v0/topstories.json', function(err, response, body) {
      var topIDs = JSON.parse(body);
      topIDs.slice(0,50).forEach(function(ID) {
        getCommentsFromStoryID(ID, keyword, callback);
      });
    });
}


function getCommentsFromStoryID(id, keyword, callback) {
  request
    .get('https://hacker-news.firebaseio.com/v0/item/' +id +'.json', function(err, response, body) {
      var commentsArray = JSON.parse(body).kids;
      var title = JSON.parse(body).title;
      if (checkTitleForKeyword(keyword, title)) {
        commentsArray.forEach(function(commentId) {
          total++;
          getComment(commentId, callback);
        });
      }
    });
}

//returns comment from
function getComment(id, callback) {
  request
    .get('https://hacker-news.firebaseio.com/v0/item/' +id +'.json', function(err, response, body) {
      var comment = JSON.parse(body).text;
      idolController.addSentiment(comment, callback);
    });
}

function checkTitleForKeyword(keyword, title) {
  return Boolean(title.match(keyword));
}

module.exports = hackerController;



