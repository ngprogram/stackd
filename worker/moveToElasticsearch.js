var Promise = require('bluebird');
var sentimentController = require('../server/sentiment/sentimentController');
var elasticsearchController = require('../server/elasticsearch/elasticsearchController');
var mongoose = require('mongoose');
var config = require('config');

mongoose.connect(config.get('mongo'));

function migrate() {
  sentimentController.getAllSentiments()
    .then(function(response) {
      console.log('success', response);
    })
    .then(null, function(err) {
      console.log('error migrating', err);
    });
}

migrate();

