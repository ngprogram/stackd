var expect = require('chai').expect ;
var Promise = require('bluebird');
var storyController = Promise.promisifyAll(require('../server/story/storyController'));
var mongoose = require('mongoose');
var config = require('config');

mongoose.connect(config.get('mongo'));

describe('Story Controller Spec', function() {

  it('should add to database correctly', function(done) {
    var story = {
      storyId: 12,
      title: "Title",
      kids: []
    };

    storyController.addStory(story)
      .then(function(createdStory) {
        done();
      })
  })


});