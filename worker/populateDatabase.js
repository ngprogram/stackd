var request = require('request');
var commentController = require('../server/comment/commentController');
var storyController = require('../server/story/storyController');
var idolController = require('../server/idol/idolController');
var sentimentController = require('../server/sentiment/sentimentController');
var Promise = require('bluebird');
var config = require('config');

var mongoose = require('mongoose');

mongoose.connect(config.get('mongo').uri);

function populateDBWithStories() {
  request
    .get('https://hacker-news.firebaseio.com/v0/topstories.json', function(err, response, body) {
      var topID = JSON.parse(body)[99];
      getNewStories(topID-30000, topID);
    });
}

// use promises
function getNewStories(lower, higher) {
  var commentsArray = [];
  commentController.getAllCommentIds(function(err, commentIds) {
    storyController.getAllStoryIds(function(err, storyIds) {
      for (var i = lower; i < higher; i++) {
        if (commentIds.indexOf(i) < 0 && storyIds.indexOf(i) < 0) {
          (function(id) {
            request
            .get('https://hacker-news.firebaseio.com/v0/item/' +id +'.json', function(err, response, body) {
                var item = JSON.parse(body);
                if (!err && item) {
                  if (item.type === 'story') {
                    var story = createStoryForDB(item);
                    storyController.addStory(story);
                  }

                  if (id === higher - 1) {
                    console.log('finished');
                  }
                }
              });
          })(i);
        }
      }
    })
  });
}

function createStoryForDB(storyFromAPI) {
  var story = {};
  story.storyId = storyFromAPI.id;
  story.title = storyFromAPI.title;
  story.kids = storyFromAPI.kids || [];

  return story;
}

function createComment(commentId, title) {
  request
    .get('https://hacker-news.firebaseio.com/v0/item/' +commentId +'.json', function(err, response, body) {
        if (!err && JSON.parse(body)) {
          var comment = createCommentForDB(JSON.parse(body), title);
          commentController.addComment(comment);
          if (comment.kids.length > 0) {
            for (var i = 0; i < comment.kids.length; i++) {
              createComment(comment.kids[i], title);
            }
          }
        }
      });
}

function createCommentForDB(commentFromAPI, title) {
  var comment = {};
  comment.commentId = commentFromAPI.id;
  comment.kids = commentFromAPI.kids || [];
  comment.text = commentFromAPI.text;
  comment.date = commentFromAPI.time;
  comment.title = title;

  return comment;
}

function updateCommentsWithTitle() {
  storyController.getAllStories(function(err, foundStories) {
    for (var i = 0; i < foundStories.length; i++) {
      if (foundStories[i].kids.length) {
        for (var j = 0; j < foundStories[i].kids.length; j++) {
          createComment(foundStories[i].kids[j], foundStories[i].title);
        }
      }
    }
  });
}

function generateSentiments() {
  commentController.getComments(function(err, foundComments) {
    // console.log(foundComments);
    sentimentController.getCommentIdsFromSavedSentiments(function(err, commentIds) {
      console.log(commentIds);
      for (var i = Math.floor(foundComments.length/2); i < foundComments.length; i++) {
        if (foundComments[i] && foundComments[i].text && commentIds.indexOf(foundComments[i].commentId) < 0) {
          console.log('calling get sent', i);
          idolController.getSentimentsSync(foundComments[i]);
        } else {
          console.log('skipped sentiment', i);
          // console.log(foundComments[i]);
        }
      }
    })
  });
}

populateDBWithStories();
// updateCommentsWithTitle();
// generateSentiments();