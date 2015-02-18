var Promise = require('bluebird');
var sentimentController = Promise.promisifyAll(require('../server/sentiment/sentimentController'));
var elasticsearchController = require('../server/elasticsearch/elasticsearchController');

function migrate() {
  sentimentController.getAllSentiments()
    .then(function(foundSentiments) {
      for (var i = 0; i < )


    })



}


