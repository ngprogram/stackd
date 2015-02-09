var Story = require('./storyModel');
var request = require('request');
var commentController = require('../comment/commentController');

var storyController = {};
storyController.addStory = addStory;
storyController.getAllStoryIds = getAllStoryIds;
storyController.getAllStories = getAllStories;

function addStory(story, callback) {
  Story.create(story, function(err, createdStory) {
    if (err) {
      console.log('error adding story to db', err);
    }
  });
}

function getAllStoryIds(callback) {
  var storyIds = [];
  Story.find({}, function(err, foundStory) {
    if (!err) {
      for (var i = 0; i < foundStory.length; i++) {
        storyIds.push(foundStory[i].storyId);
      }
      callback(err, storyIds);
    }
  });
}

function getAllStories(callback) {
  Story.find({}, callback);
}

module.exports = storyController;