var Promise = require('bluebird');

var commentController = Promise.promisifyAll(require('../server/comment/commentController'));
var storyController = Promise.promisifyAll(require('../server/story/storyController'));

var idolController = Promise.promisifyAll(require('../server/idol/idolController'));
var sentimentController = require('../server/sentiment/sentimentController');
var config = require('config');
var request = Promise.promisify(require('request'));

var mongoose = require('mongoose');
mongoose.connect(config.get('mongo'));

var numberToScrape = 100;

function populateDBWithStories() {

  var temp = request('https://hacker-news.firebaseio.com/v0/topstories.json')
    .spread(function(response, body) {
      var topID = JSON.parse(body)[99];

      return topID;
    });

  var promiseArray = [];
  promiseArray.push(temp);
  promiseArray.push(commentController.getAllCommentIds());
  promiseArray.push(storyController.getAllStoryIds());

  Promise.all(promiseArray)
    .then(function(results) {
      var higher = results[0];
      var commentIds = results[1];
      var storyIds = results[2];

      var requestsForStories = [];
      for (var i = higher - numberToScrape; i < higher; i++) {
        if (commentIds.indexOf(i) < 0 && storyIds.indexOf(i) < 0) {
          requestsForStories.push(request('https://hacker-news.firebaseio.com/v0/item/' +i +'.json'));
        }
      }

      return Promise.all(requestsForStories);
    })
    // finds stories from hacker news items
    .then(function(hackerNewsItems) {
      var stories = [];
      for (var i = 0; i < hackerNewsItems.length; i++) {
        var item = JSON.parse(hackerNewsItems[i][0].body);
        if (item.type === 'story') {
          stories.push(storyController.addStory(createStoryForDB(item)));
        }
      }

      return Promise.all(stories);
    })
    // get comments from stories
    .then(function(stories) {
      var array = [];

      function createComment(commentId, title) {
        return request('https://hacker-news.firebaseio.com/v0/item/' +commentId +'.json')
          .spread(function(response, body) {
            if (JSON.parse(body)) {
              var comment = createCommentForDB(JSON.parse(body), title);
              if (comment.kids.length > 0) {
                for (var i = 0; i < comment.kids.length; i++) {
                  array.push(createComment(comment.kids[i], title));
                }
              }
              return commentController.addComment(comment);
            }
          })
          .catch(function(err) {
            console.log('error creating comment');
          });
      }

      for (var i = 0; i < stories.length; i++) {
        for (var j = 0; j < stories[i].kids.length; j++) {
          array.push(createComment(stories[i].kids[j], stories[i].title))
        }
      }

      return Promise.all(array);
    })
    .then(function(comments) {
      console.log('comments', comments);
      var sentimentsFromComments = [];
      for (var i = 0; i < comments.length; i++) {
        if (comments[i] && comments[i].text) {
          sentimentsFromComments.push(idolController.getSentimentsSync(comments[i]));
        }
      }

      return Promise.all(sentimentsFromComments);
    })
    .then(function(sentimentsFromComments) {
      var sentiments = [];
      for (var i = 0; i < sentimentsFromComments.length; i++) {
        for (var j = 0; j < sentimentsFromComments[i].length; j++) {
          sentiments.push(sentimentsFromComments[i][j]);
        }
      }

      for (var i = 0; i < sentiments.length; i++) {
        sentimentController.addSentiment(sentiments[i]);
      }

      console.log('done');
    })
    .then(null, function(err) {
      console.log('error getting new comments', err);
    });
}

function createStoryForDB(storyFromAPI) {
  var story = {};
  story.storyId = storyFromAPI.id;
  story.title = storyFromAPI.title;
  story.kids = storyFromAPI.kids || [];
  return story;
}

// function createComment(commentId, title) {
//   request('https://hacker-news.firebaseio.com/v0/item/' +commentId +'.json')
//     .spread(function(response, body) {
//       if (JSON.parse(body)) {
//         var comment = createCommentForDB(JSON.parse(body), title);
//         commentController.addComment(comment);
//         if (comment.kids.length > 0) {
//           for (var i = 0; i < comment.kids.length; i++) {
//             createComment(comment.kids[i], title);
//           }
//         }
//       }
//     })
//     .catch(function(err) {
//       console.log('error creating comment');
//     });
// }

function createCommentForDB(commentFromAPI, title) {
  var comment = {};
  comment.commentId = commentFromAPI.id;
  comment.kids = commentFromAPI.kids || [];
  comment.text = commentFromAPI.text;
  comment.date = commentFromAPI.time;
  comment.title = title;

  return comment;
}

function generateSentiments() {
  Promise.join(commentController.getComments(), sentimentController.getCommentIdsFromSavedSentiments(),
    function(comments, usedCommentIds) {
      // array with contain nested arrays
      var sentimentsFromComments = [];

      for (var i = 0; i < comments.length; i++) {
        if (comments[i] && comments[i].text && usedCommentIds.indexOf(comments[i].commentId) < 0) {
          sentimentsFromComments.push(idolController.getSentimentsSync(comments[i]));
        }
      }
      return Promise.all(sentimentsFromComments);
    })
    //flattens array
    .then(function(sentimentsFromComments) {
      var sentiments = [];
      for (var i = 0; i < sentimentsFromComments.length; i++) {
        for (var j = 0; j < sentimentsFromComments[i].length; j++) {
          sentiments.push(sentimentsFromComments[i][j]);
        }
      }

      for (var i = 0; i < sentiments.length; i++) {
        sentimentController.addSentiment(sentiments[i]);
      }

    })
    .then(null, function(err) {
      console.log('error generating sentiments', err);
    });
}

populateDBWithStories();
// updateCommentsWithTitle();
// generateSentiments();