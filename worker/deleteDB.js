var Promise = require('bluebird');
var sentimentController = Promise.promisifyAll(require('../server/sentiment/sentimentController'));
var storyController = Promise.promisifyAll(require('../server/story/storyController'));
var commentController = Promise.promisifyAll(require('../server/comment/commentController'));
var itemController = Promise.promisifyAll(require('../server/item/itemController'));

var config = require('config');
var mongoose = require('mongoose');
mongoose.connect(config.get('mongo'));

sentimentController.deleteSentiments()
  .then(function() {

    return storyController.deleteStories();
  })
  .then(function() {

    return commentController.deleteComments();
  })
  .then(function() {

    return itemController.deleteItems();
  })
  .then(function() {
    console.log('databases deleted');
  });
