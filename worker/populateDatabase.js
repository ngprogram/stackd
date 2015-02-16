var Promise = require('bluebird');
var _ = require('lodash');

var commentController = Promise.promisifyAll(require('../server/comment/commentController'));
var storyController = Promise.promisifyAll(require('../server/story/storyController'));

var nltkController = Promise.promisifyAll(require('../server/util/nltkController'));
var sentimentController = require('../server/sentiment/sentimentController');
var config = require('config');
var request = Promise.promisify(require('request'));

var itemController = Promise.promisifyAll(require('../server/item/itemController'));

var mongoose = require('mongoose');
mongoose.connect(config.get('mongo'));

var numberToScrape = 500;
var topStoriesUrl = 'https://hacker-news.firebaseio.com/v0/topstories.json';
var maxItemUrl = 'https://hacker-news.firebaseio.com/v0/maxitem.json';

function populateDBWithStories() {
  var temp = request(maxItemUrl)
    .spread(function(response, body) {
      console.log(body);
      var topID = JSON.parse(body);
      return topID;
    });

  var promiseArray = [];
  promiseArray.push(temp);
  promiseArray.push(itemController.getAllItemIds());
  // promiseArray.push(storyController.getAllStoryIds());

  Promise.all(promiseArray)
    .then(function(results) {
      console.log('step 1');
      var topID = results[0];
      var itemIds = results[1];
      // var storyIds = results[2];

      var requestsForItems = [];
      for (var i = topID - numberToScrape; i < topID; i++) {
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
    // finds stories from hacker news items
    .then(function(hackerNewsItems) {
      console.log('step 2');
      var items = [];
      for (var i = 0; i < hackerNewsItems.length; i++) {
        var item = hackerNewsItems[i];
        if (item && !item.deleted) {
          items.push(itemContorller.addItem(createItemForDB(item)));
        }
      }

      return Promise.all(items);
    })
    // get comments from stories
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
      console.log('getting sentiments from comments');
      comments = _.flattenDeep(comments);

      var sentimentsFromComments = [];
      for (var i = 0; i < comments.length; i++) {
        if (comments[i] && comments[i].text) {
          sentimentsFromComments.push(nltkController.getSentimentsSync(comments[i]));
        }
      }

      return Promise.all(sentimentsFromComments);
    })
    .then(function(sentiments) {
       console.log('running thorugh sentiments');

      for (var i = 0; i < sentiments.length; i++) {
        sentimentController.addSentiment(sentiments[i]);
      }

      console.log('done');
    })
    .catch(function(err) {
      console.log('timeout', err);
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
  if (item.type !== story) {
    item.parent = itemFromAPI.parent;
  }

  return item;
}

function createStoryForDB(storyFromAPI) {
  var story = {};
  story.storyId = storyFromAPI.id;
  story.title = storyFromAPI.title;
  story.kids = storyFromAPI.kids || [];
  story.time = storyFromAPI.time;
  story.by = storyFromAPI.by;
  story.score = storyFromAPI.score;

  return story;
}

function createCommentForDB(commentFromAPI, title) {
  var comment = {};
  comment.commentId = commentFromAPI.id;
  comment.kids = commentFromAPI.kids || [];
  comment.text = commentFromAPI.text;
  comment.by = commentFromAPI.by;
  comment.time = commentFromAPI.time;
  comment.title = title;

  return comment;
}

populateDBWithStories();
