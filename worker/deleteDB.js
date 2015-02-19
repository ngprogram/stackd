var sentimentController = require('../server/sentiment/sentimentController');
var itemController = require('../server/item/itemController');
var elasticsearchController = require('../server/elasticsearch/elasticsearchController');

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

    return elasticsearchController.deleteIndex('stat');
  })
  .then(function() {
    console.log('databases deleted');
  });
