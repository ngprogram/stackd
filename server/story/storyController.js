var Story = require('./storyModel');
var request = require('request');
var commentController = require('../comment/commentController');

var storyController = {};
storyController.addStory = addStory;
storyController.getStoryTitleFromId = getStoryTitleFromId;
storyController.getAllIds = getAllIds;
storyController.populateWithComments = populateWithComments;

function addStory(story, callback) {
  Story.create(story, function(err, createdStory) {
    if (err) {
      console.log('error adding story to db', err);
    }
  });
}

function getStoryTitleFromId(id, callback) {
  console.log('id', id);
  request
    .get('https://hacker-news.firebaseio.com/v0/item/' +id +'.json', function(err, response, body) {
        if (!err) {
          var title = JSON.parse(body).title;
          console.log(JSON.parse(body));
          // console.log(title);
          callback(err, title);
        }
      });
}

function getAllIds(callback) {
  var storyIds = [];
  Story.find({}, function(err, foundStory) {
    if (!err) {
      for (var i = 0; i < foundStory.length; i++) {
        storyIds.push(foundStory[i].storyId);
      }
      console.log('storyIds');
      console.log(storyIds);
      callback(err, storyIds);
    }
  });
}

function populateWithComments() {
  Story.find({}, function(err, foundStories) {
    for (var i = 0; i < foundStories.length; i++) {
      if (foundStories[i].kids.length) {
        console.log('entered');
        for (var j = 0; j < foundStories[i].kids.length; j++) {
          console.log('entering into loop');
          console.log('foundStories', foundStories[i].kids[j]);
          createComment(foundStories[i].kids[j], foundStories[i].title);
        }
      }
    }
  });
}

function createComment(commentId, title) {
  console.log('commentId', commentId);
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
  comment.date = commentFromAPI.date;
  comment.title = title;
  return comment;
}

module.exports = storyController;