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
        type: 'sentiments',
        id: body.id,
        body: body
    })
    .then(null, function(err) {
      console.log('error creating', err);
    });
}

function migrate(array, type) {

  var bulkArray = [];
  for (var i = 0; i < array.length; i++) {
    var id = array[i].id;
    var query = { index:  { _index: 'stat', _type: type, _id: id } };
    bulkArray.push(query);
    bulkArray.push(createStoryForES(array[i]));
  }

  console.log(bulkArray);


  return client.bulk({
    indx: 'stat',
    type: type,
    body: bulkArray
  })
  .then(null, function(err) {
    console.log('error migrating', err);
  });

}


function searchInTitle(query) {
  return client.search({
    index: 'stat',
    type: 'sentiments',
    // TODO: change to scan
    size: 20,
    body: {
      query: {
        title: query
      }
    }
  })
  .then(null, function(err) {
    console.log('error searching', err);
  });

}

function getTopLinks(query) {
  return client.search({
    index: 'stat',
    type: 'stories',
    // TODO: change to scan
    size: 5,
    fields: ['links'],
    body: {
      query: {
        title: query
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

function createStoryForES(story) {
  var storyObj = {};
  storyObj.id = String(story._id);
  storyObj.title = story.title;
  storyObj.source = story.source;
  storyObj.link = story.link;
  storyObj.time = story.time;
  storyObj.by = story.by;

  return storyObj;
}

module.exports = elasticsearchController