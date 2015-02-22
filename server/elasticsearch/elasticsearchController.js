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
elasticsearchController.getTopLinks = getTopLinks;

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
    var id = array[i]._id;
    var query = { index:  { _index: 'stat', _type: type, _id: id } };
    bulkArray.push(query);

    if (type === 'stories') {
      bulkArray.push(createStoryForES(array[i]));
    }
    if (type === 'sentiments') {
      bulkArray.push(createSentimentForES(array[i]));
    }
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
        match: {
          title: query
        }
      }
    }
  })
  .then(null, function(err) {
    console.log('error searching for top sentiments', err);
  });

}

function getTopLinks(query) {
  console.log('getting top');
  return client.search({
    index: 'stat',
    type: 'stories',
    // TODO: change to scan
    size: 5,
    body: {
      query: {
        match: {
          title: query
        }
      }
    }
  })
  .then(null, function(err) {
    console.log('error searching for top link', err);
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
  storyObj.id = story.id;
  storyObj.title = story.title;
  storyObj.source = story.source;
  storyObj.link = story.link;
  storyObj.time = story.time;
  storyObj.by = story.by;

  return storyObj;
}

function createSentimentForES(sentiment) {
  var sentimentObj = {};
  sentimentObj.id = sentiment.id;
  sentimentObj.rating = sentiment.rating;
  sentimentObj.score = sentiment.score;
  sentimentObj.replies = sentiment.replies;
  sentimentObj.title = sentiment.title;
  sentimentObj.time = sentiment.time;
  sentimentObj.by = sentiment.by;
  sentimentObj.source = sentiment.source;
  sentimentObj.sentiment = sentiment.sentiment;
  sentimentObj.comment = sentiment.comment;

  return sentimentObj;
}

module.exports = elasticsearchController