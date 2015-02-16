var Story = require('./storyModel');
var request = require('request');
var commentController = require('../comment/commentController');

var storyController = {};
storyController.addStory = addStory;
storyController.getAllStoryIds = getAllStoryIds;
storyController.getAllStories = getAllStories;
storyController.deleteStories = deleteStories;

function addStory(story) {
  return Story.create(story)
    .then(null, function(err) {

      //if not dup key error
      if (err.code !== 11000) {
        console.log('error creating story', err);
      }
    });
}

function getAllStoryIds(callback) {
  var storyIds = [];
  return Story.find({}).exec()
    .then(function(foundStory) {
        for (var i = 0; i < foundStory.length; i++) {
          storyIds.push(foundStory[i].storyId);
        }
        return storyIds;
    })
    .then(null, function(err) {

      return;
      console.log('error getting all storyIds', err);
    });
}

function getAllStories(callback) {
  Story.find({}, callback);
}

function deleteStories() {
  return Story.remove({})
    .exec();
}

module.exports = storyController;