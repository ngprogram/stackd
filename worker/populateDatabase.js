var Promise = require('bluebird');
var _ = require('lodash');

var nltkController = Promise.promisifyAll(require('../server/util/nltkController'));
var sentimentController = require('../server/sentiment/sentimentController');
var config = require('config');
var request = Promise.promisify(require('request'));

var itemController = Promise.promisifyAll(require('../server/item/itemController'));

var mongoose = require('mongoose');
mongoose.connect(config.get('mongo'));

var chunkSize = 20;
var count = 0;
var limit = 1000;
var topStoriesUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json';
var maxItemUrl = 'https://hacker-news.firebaseio.com/v0/maxitem.json';

function populateDBWithStories(n) {

  request(maxItemUrl)
    .spread(function(response, body) {
      var topID = JSON.parse(body);

      getChunk(topID);
    });
}

function getChunk(n) {
  count++;
  itemController.getAllItemIds()
    .then(function(itemIds) {
      console.log('step 1');
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
      console.log('step 2');
      var items = [];
      for (var i = 0; i < hackerNewsItems.length; i++) {
        var item = hackerNewsItems[i];
        if (item && !item.deleted) {
          items.push(itemController.addItem(createItemForDB(item)));
        }
      }

      return Promise.all(items);
    })
    // get update all comments with text
    .then(function(items) {
      var commentRequests = [];
      console.log('step 3');

      for (var i = 0; i < items.length; i++) {
        // some stories have no comments
        if (items[i] && items[i].type === 'comment' && items[i].parent) {
          commentRequests.push(itemController.updateTitle(items[i].id));
        }
      }

      return Promise.all(commentRequests);
    })
    .then(function(comments) {
      comments = _.flattenDeep(comments);
      var sentimentsFromComments = [];
      for (var i = 0; i < comments.length; i++) {

        if (comments[i] && comments[i].text) {
          sentimentsFromComments.push(nltkController.getSentimentsSync(comments[i]));
        }
        else {
          console.log('skipped');
        }
      }

      return Promise.all(sentimentsFromComments);
    })
    .then(function() {
      console.log('done', count);
      if (count < limit) {
        getChunk(n-chunkSize);
      }
    })
    .then(null, function(err) {
      console.log('error getting new comments', err);
    });
}

function updateSentiments() {

  Promise.join(itemController.getComments(), sentimentController.getCommentIdsFromSavedSentiments(),
    function(comments, commentIds) {

      comments = _.flattenDeep(comments);
      var sentimentsFromComments = [];
      for (var i = 0; i < comments.length; i++) {
        // console.log(comments[i]);
        if (comments[i] && comments[i].text && commentIds.indexOf(comments[i].id) < 0) {
          sentimentsFromComments.push(nltkController.getSentimentsSync(comments[i]));
        }
        else {
          console.log('skipped');
        }
      }

      return Promise.all(sentimentsFromComments);
    })
    .then(function() {
      console.log('done');
    })
    .then(null, function(err) {
      console.log('error getting new comments', err);
    });

}

function createItemForDB(itemFromAPI) {
  var item = {};
  item.id = itemFromAPI.id;
  item.type = itemFromAPI.type;
  item.title = itemFromAPI.title || null;
  item.kids = itemFromAPI.kids || [];
  item.time = itemFromAPI.time;
  item.by = itemFromAPI.by;
  item.score = itemFromAPI.score;
  item.source = "Hacker News";
  if (item.type !== 'story') {
    item.parent = itemFromAPI.parent;
  }
  if (item.type === 'comment') {
    item.text = itemFromAPI.text;
  }

  return item;
}

populateDBWithStories();
