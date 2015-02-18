var elasticsearch = require('elasticsearch');
var Promise = require('bluebird');

var client = new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

var elasticsearchController = {};
elasticsearchController.search = search;

client.ping({
  requestTimeout: 1000,
  // undocumented params are appended to the query string
  hello: "elasticsearch!"
}, function (error) {
  if (error) {
    console.error('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

function search(query) {
  client.search({
    index: 'twitter',
    type: 'tweets',
    body: {
      query: {
        match: {
          body: 'elasticsearch'
        }
      }
    }
  }).then(function (resp) {
      var hits = resp.hits.hits;
  }, function (err) {
      console.trace(err.message);
  });
}

module.exports = elasticsearchController