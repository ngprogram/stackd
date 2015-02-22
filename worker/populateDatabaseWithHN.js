var Promise = require('bluebird');
var _ = require('lodash');
var idolController = require('../server/util/idolController');
var sentimentController = require('../server/sentiment/sentimentController');
var config = require('config');
var request = Promise.promisify(require('request'));

var itemController = require('../server/item/itemController');

var mongoose = require('mongoose');
mongoose.connect(config.get('mongo'));

var chunkSize = 20;
var source = "Hacker News";
var count = 0;
var limit = 5000;
var topStoriesUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json';
var maxItemUrl = 'https://hacker-news.firebaseio.com/v0/maxitem.json';

function populateDBWithStories(n) {

  request(maxItemUrl)
    .spread(function(response, body) {
      var topID = JSON.parse(body);

      throttledGetChunk(topID);
    });
}

var throttledGetChunk = _.throttle(getChunk, 5000);

function getChunk(n) {
  count++;
  itemController.getAllHNItemIds()
    .then(function(itemIds) {
      console.log('fetching saved item');
      var requestsForItems = [];
      for (var i = n - chunkSize; i < n; i++) {
        if (itemIds.indexOf(i) < 0) {
          var temp = request('https://hacker-news.firebaseio.com/v0/item/' +i +'.json')
            .spread(function(response, body) {
              return JSON.parse(body);
            });
          requestsForItems.push(temp);
        }
      }
      return Promise.all(requestsForItems);
    })
    // saves all items from hacker news
    .then(function(hackerNewsItems) {
      console.log('saving new items');
      var items = [];
      for (var i = 0; i < hackerNewsItems.length; i++) {
        var item = hackerNewsItems[i];
        if (item && !item.deleted) {
          items.push(itemController.addItem(item, source));
        }
      }

      return Promise.all(items);
    })
    // get update all comments with text
    .then(function(items) {
      var commentRequests = [];
      console.log('updating comments with titles');

      for (var i = 0; i < items.length; i++) {
        // some stories have no comments
        if (items[i] && items[i].type === 'comment' && items[i].parent) {
          commentRequests.push(itemController.updateTitle(items[i].id, source));
        }
      }

      return Promise.all(commentRequests);
    })
    .then(function() {
      console.log('done', count);
      if (count < limit) {
        throttledGetChunk(n-chunkSize);
      }
    })
    .then(null, function(err) {
      console.log('error getting new comments', err);
    });
}

populateDBWithStories();