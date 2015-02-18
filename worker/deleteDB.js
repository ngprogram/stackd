var Promise = require('bluebird');
var sentimentController = Promise.promisifyAll(require('../server/sentiment/sentimentController'));
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
    console.log('databases deleted');
  });
