var Promise = require('bluebird');
var sentimentController = Promise.promisifyAll(require('../server/sentiment/sentimentController'));
var itemController = Promise.promisifyAll(require('../server/item/itemController'));

var config = require('config');
var mongoose = require('mongoose');
mongoose.connect(config.get('mongo'));

sentimentController.deleteSentiments()
  .then(function() {

    return itemController.deleteItems();
  })
  .then(function() {

    return sentimentController.deleteSentiments();
  })
  .then(function() {
    console.log('databases deleted');
  });
