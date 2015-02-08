var request = require('request');
var idolController = require('../idol/idolController');
var aggregatorController = require('../aggregator/aggregatorController');

var hackerController = {};
var total = 0;
var count = 0;

hackerController.populate = populate;
hackerController.gatherSentiments = gatherSentiments;

function gatherSentiments() {
  count = 0;
  total = 0;
  request
    .get('https://hacker-news.firebaseio.com/v0/topstories.json', function(err, response, body) {
      var topIDs = JSON.parse(body);
      topIDs.slice(0,50).forEach(function(ID) {
        getCommentsFromStoryID(ID);
        getCommentsFromStoryID(ID, keyword, callback);
      });
    });
}

function getCommentsFromStoryID(id) {
  request
    .get('https://hacker-news.firebaseio.com/v0/item/' +id +'.json', function(err, response, body) {
      if (!err && JSON.parse(body).kids) {
        var commentsArray = JSON.parse(body).kids;
        var title = JSON.parse(body).title;
        commentsArray.forEach(function(commentId) {
          total++;
          getComment(commentId, title);
        });
      }
    });
}

//returns comment from
function getComment(id, title, callback) {
  request
    .get('https://hacker-news.firebaseio.com/v0/item/' +id +'.json', function(err, response, body) {
      if (!err) {
        var comment = JSON.parse(body);
        if (comment) {
          idolController.getSentimentsSync(comment, title);
        }
      }
    });
}

function populate(lower, higher) {
  var storyArray = [];
  console.log('lower %d, higher %d', lower, higher);
  for (var i = lower; i < higher; i++) {
    request
    .get('https://hacker-news.firebaseio.com/v0/item/' +i +'.json', function(err, response, body) {
        var item = JSON.parse(body);
        if (item.type === 'story') {
          console.log('enter');
          storyArray.push(item.id);

          if (i === higher - 1) {
            console.log(storyArray);
            iterateThroughStories(storyArray);
          }
        }
      });
  }
}

function iterateThroughStories(storyArray) {
  for (var i = 0; i < storyArray.length; i++) {
    getCommentsFromStoryID(storyArray[i]);
  }
}

module.exports = hackerController;



