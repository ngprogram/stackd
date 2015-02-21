var elasticsearch = require('elasticsearch');
var Promise = require('bluebird');
var config = require('config');

var client = new elasticsearch.Client({
  host: config.get('es'),
  log: 'trace'
});

// Promise.promisifyAll(client);

var elasticsearchController = {};
elasticsearchController.searchInTitle = searchInTitle;
elasticsearchController.create = create;
elasticsearchController.deleteIndex = deleteIndex;
elasticsearchController.migrate = migrate;

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

  console.log('bulkArray', bulkArray);

  return client.bulk({
    body: bulkArray
  })
  .then(null, function(err) {
    console.log('error migrating', err);
  });

}

function searchInTitle(query) {
  console.log('query', query);
  return client.search({
    index: 'stat',

    // TODO: change to scan
    size: 20,
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