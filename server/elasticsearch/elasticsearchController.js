var elasticsearch = require('elasticsearch');
var Promise = require('bluebird');
var config = require('config');

var client = new elasticsearch.Client({
  host: config.get('es'),
  log: 'trace'
});

Promise.promisifyAll(client);

var elasticsearchController = {};
elasticsearchController.searchInTitle = searchInTitle;
elasticsearchController.create = create;
elasticsearchController.deleteIndex = deleteIndex;
elasticsearchController.migrate = migrate;

// client.ping({
//   requestTimeout: 1000,
//   // undocumented params are appended to the query string
//   hello: "elasticsearch!"
// }, function (error) {
//   if (error) {
//     console.error('elasticsearch cluster is down!');
//   } else {
//     console.log('All is well');
//   }
// });

function create(body) {
    return client.create({
        index: 'stat',
        type: 'sentiment',
        id: body.id,
        body: body
    })
    .then(null, function(err) {
      console.log('error creating', err);
    });
}

function migrate(array) {

  var bulkArray = [];
  for (var i = 0; i < array.length; i++) {
    var id = array[i].id;
    var query = { index:  { _index: 'stat', _type: 'sentiment', _id: id } };
    bulkArray.push(query);
    bulkArray.push(array[i]);
  }

  return client.bulk({
    body: bulkArray
  });

}

function searchInTitle(query) {

  return client.search({
    index: 'stat',
    body: {
      query: {
        match: {
          title: query
        }
      }
    }
  })
  .then(null, function(err) {
    console.log('error searching', err);
  });

}

function deleteIndex(name) {
  return client.indices.delete({
    index: name
  })
  .then(null, function(err) {
    console.log('error deleting index', err);
  })
}

module.exports = elasticsearchController