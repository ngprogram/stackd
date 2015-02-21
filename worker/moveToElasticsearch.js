var Promise = require('bluebird');
var sentimentController = require('../server/sentiment/sentimentController');
var itemController = require('../server/item/itemController');
var elasticsearchController = require('../server/elasticsearch/elasticsearchController');
var mongoose = require('mongoose');
var config = require('config');

mongoose.connect(config.get('mongo'));

function migrateSentiments() {
  sentimentController.getAllSentiments()
    .then(function(response) {
      console.log('success', response);
    })
    .then(null, function(err) {
      console.log('error migrating', err);
    });
}

function migrateItems() {
  itemController.getAllStories()
    .then(function(stories) {
      return elasticsearchController.migrate(stories, 'stories')
    })
    .then(null, function(err) {
      console.log('error migrating', err);
    });
}

migrateItems();

