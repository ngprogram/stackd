var Promise = require('bluebird');
var sentimentController = require('../server/sentiment/sentimentController');
var itemController = require('../server/item/itemController');
var elasticsearchController = require('../server/elasticsearch/elasticsearchController');
var mongoose = require('mongoose');
var config = require('config');

mongoose.connect(config.get('mongo'));

function migrateSentiments() {
  sentimentController.getAllSentiments()
    .then(function(sentiments) {
      return elasticsearchController.migrate(sentiments, 'sentiments')
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

// migrateItems();
migrateSentiments();

