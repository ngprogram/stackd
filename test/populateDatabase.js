// var hackerController = require('../server/hacker/hackerController');
var request = require('request');
var commentController = require('../server/comment/commentController');
var storyController = require('../server/story/storyController');
var mongoose = require('mongoose');
var mongooseURI = require('../config/database').URI;
var idolController = require('../server/idol/idolController');

mongoose.connect(mongooseURI);

function fillDatabase() {
  request
    .get('https://hacker-news.firebaseio.com/v0/topstories.json', function(err, response, body) {
      var topID = JSON.parse(body)[99];
      populateDBWithStories(topID-10000, topID);
    });
}

function populateDBWithStories(lower, higher) {
  var commentsArray = [];
  commentController.getAllIds(function(err, commentIds) {
    storyController.getAllIds(function(err, storyIds) {
      for (var i = lower; i < higher; i++) {
        if (commentIds.indexOf(i) < 0 && storyIds.indexOf(i) < 0) {
          console.log('called');
          (function(id) {
            request
            .get('https://hacker-news.firebaseio.com/v0/item/' +id +'.json', function(err, response, body) {
                var item = JSON.parse(body);
                console.log('called inside');
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

function populateDBWithComments() {
  storyController.populate(function() {


  });
}

function createStoryForDB(storyFromAPI) {
  var story = {};
  story.storyId = storyFromAPI.id;
  story.title = storyFromAPI.title;
  story.kids = storyFromAPI.kids || [];

  return story;
}

function createCommentForDB(commentFromAPI) {
  var comment = {};
  comment.commentId = commentFromAPI.id;
  comment.text = commentFromAPI.text;
  comment.date = commentFromAPI.date;
  comment.parentId = commentFromAPI.parent;
  return comment;
}

function updateCommentsWithTitle() {
  // commentController.updateComment();
  storyController.populateWithComments();
}

function generateSentiments() {
  commentController.getComments(function(err, foundComments) {
    console.log(foundComments);
    for (var i = 0; i < foundComments.length; i++) {
      console.log('hello');
      if (foundComments[i] && foundComments[i].text) {
        console.log(foundComments[i]);
        idolController.getSentimentsSync(foundComments[i]);
      }
    }
  });
}

// fillDatabase();
// updateCommentsWithTitle();
generateSentiments();