var request = require('request');
var idolController = require('../idol/idolController');
var aggregatorController = require('../aggregator/aggregatorController');

var hackerController = {};
var counter = 0;
var total = 0;

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
    if (count >= total) {
      console.log('ended');
      // next();
    }
  });
}

function goThroughTitles(keyword, callback) {
  count = 0;
  request
    .get('https://hacker-news.firebaseio.com/v0/topstories.json', function(err, response, body) {
      var topIDs = JSON.parse(body);
      var title = JSON.parse(body);

      topIDs.forEach(function(ID) {
        if (checkTitleForKeyword(keyword, title)) {
          total++;
          getCommentsFromStoryID(ID, keyword, callback);
        }
      });
    });
}

function getCommentsFromStoryID(id, keyword, callback) {
  request
    .get('https://hacker-news.firebaseio.com/v0/item/' +id +'.json', function(err, response, body) {
      var commentsArray = JSON.parse(body).kids;
      commentsArray.forEach(function(commentId) {
        getComment(commentId, callback);
      });
    });
}

//returns comment from
function getComment(id, callback) {
  request
    .get('https://hacker-news.firebaseio.com/v0/item/' +id +'.json', function(err, response, body) {
      var comment = JSON.parse(body).text;
      // idolController.addSentiment(comment, callback);
      callback(null, 'no error');
    });
}

function checkTitleForKeyword(keyword, title) {
  return Boolean(title.match(/keyword/ig));
}

module.exports = hackerController;



