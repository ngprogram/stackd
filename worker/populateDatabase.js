var Promise = require('bluebird');

var commentController = Promise.promisifyAll(require('../server/comment/commentController'));
var storyController = Promise.promisifyAll(require('../server/story/storyController'));

var idolController = Promise.promisifyAll(require('../server/idol/idolController'));
var sentimentController = require('../server/sentiment/sentimentController');
var config = require('config');
var request = Promise.promisify(require('request'));

var mongoose = require('mongoose');
mongoose.connect(config.get('mongo'));

function populateDBWithStories() {
  request('https://hacker-news.firebaseio.com/v0/topstories.json')
    .spread(function(response, body) {
      var topID = JSON.parse(body)[99];
      getNewStories(topID-100, topID);
    }).catch(function(err) {
      console.log('error with request', err);
    });
}

function getNewStories(lower, higher) {
  Promise.join(commentController.getAllCommentIds(), storyController.getAllStoryIds(),
   function(commentIds, storyIds) {
      var requestsForStories = [];
      for (var i = lower; i < higher; i++) {
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
        console.log(i, hackerNewsItems[i][0].body);
        var item = JSON.parse(hackerNewsItems[i][0].body);
        if (item.type === 'story') {
          // console.log('hello');
          console.log(item);
          stories.push(storyController.addStory(createStoryForDB(item)));
        }
        console.log('i', i);
      }
      console.log('done');
      return Promise.all(stories);
    })
    // get comments from stories
    .then(function(stories) {
      console.log('stories', stories);
      var array = [];
      for (var i =0 ; i < stories.length; i++) {
        for (var j = 0; j < stories[i].kids.length; j++) {
          createComment(stories[i].kids[j], stories[i].title);
        }
      }

      // return Promise.all(array);
    })
    .then(null, function(err) {
      console.log('error getting new comments', err);
    });
    // .then(function(comments) {

    //   for (var i = 0; i < comments.length; i++) {

    //   }

    // })
    // .then(function(sentiments) {
    //   var allSentiments = [];
    //   var promisedSentiments = [];
    //   for (var i = 0; i < sentiments.length; i++) {
    //     for (var j = 0; j < sentiments[i].length; j++) {
    //       allSentiments.push(sentiments[i][j]);
    //     }
    //   }

    //   for (var i = 0; i < allSentiments.length; i++) {
    //     promisedSentiments.push(sentimentController.addSentiment(allSentiments[i]));
    //   }

    //   return Promise.all(promisedSentiments);
    // })
    // .then(null, function(err) {
    //   console.log('error getting new story', err);
    // });
}

function updateCommentsWithTitle() {
  storyController.getAllStories(function(err, foundStories) {
    for (var i = 0; i < foundStories.length; i++) {
      if (foundStories[i].kids.length) {
        for (var j = 0; j < foundStories[i].kids.length; j++) {
          createComment(foundStories[i].kids[j], foundStories[i].title);
        }
      }
    }
  });
}



function createStoryForDB(storyFromAPI) {
  console.log('creating');
  var story = {};
  story.storyId = storyFromAPI.id;
  story.title = storyFromAPI.title;
  story.kids = storyFromAPI.kids || [];
  console.log('done creating');
  return story;
}

// function getComments(commentIds) {
//   var array = [];
//   for (var i = 0; i < commentIds.length; i++) {
//     array.push(request('https://hacker-news.firebaseio.com/v0/item/' +commentId +'.json'));
//   }


// }

function createComment(commentId, title) {
  request('https://hacker-news.firebaseio.com/v0/item/' +commentId +'.json')
    .spread(function(response, body) {
      if (JSON.parse(body)) {
        var comment = createCommentForDB(JSON.parse(body), title);
        commentController.addComment(comment);
        if (comment.kids.length > 0) {
          for (var i = 0; i < comment.kids.length; i++) {
            createComment(comment.kids[i], title);
          }
        }
      }
    })
    .catch(function(err) {
      console.log('error creating comment');
    });
}

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
  commentController.getComments(function(err, foundComments) {
    sentimentController.getCommentIdsFromSavedSentiments(function(err, commentIds) {
      console.log(commentIds);
      for (var i = Math.floor(foundComments.length/2); i < foundComments.length; i++) {
        if (foundComments[i] && foundComments[i].text && commentIds.indexOf(foundComments[i].commentId) < 0) {
          console.log('calling get sent', i);
          idolController.getSentimentsSync(foundComments[i]);
        } else {
          console.log('skipped sentiment', i);
          // console.log(foundComments[i]);
        }
      }
    })
  });
}

populateDBWithStories();
// getNewStories();
// updateCommentsWithTitle();
// generateSentiments();