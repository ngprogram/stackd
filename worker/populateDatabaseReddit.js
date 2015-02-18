var Promise = require('bluebird');
var _ = require('lodash');

var idolController = Promise.promisifyAll(require('../server/util/idolController'));
var sentimentController = require('../server/sentiment/sentimentController');
var config = require('config');
var request = Promise.promisify(require('request'));

var itemController = Promise.promisifyAll(require('../server/item/itemController'));

var mongoose = require('mongoose');
mongoose.connect(config.get('mongo'));

// var chunkSize = 20;
var count = 0;
var limit = 5;
var after = '';


//choose subreddit
  // go through each page
    // on each page, go through each link
      //on each link, go through the comment tree


function startPopulateDBFromSubreddit(subreddit) {
  var startUrl = 'http://www.reddit.com/r/' + subreddit + '/new.json?limit=29';
  
  throttledPopulateDBFromPageUrl(startUrl, subreddit);
}

var throttledPopulateDBFromPageUrl = _.throttle(populateDBFromPageUrl, 60000);

// NEED TO WORRY ABOUT DOUBLING RESULTS...
//RECURSIVE TO GO THROUGH ALL PAGES
//starts the process for a page... base case: check if there are remaining pages, if not call itself on next page
function populateDBFromPageUrl(pageUrl, subreddit) {
  count++;
  //request all links from a single page for a subreddit (100 links)
  request(pageUrl)
    .spread(function(response, body) {
      console.log('step 1');
      var incomingData = JSON.parse(body);
      // console.log('parsed incoming data', incomingData);
      var numberOfLinksOnPage = incomingData.data.children.length;
      // console.log('numberOfLinksOnPage', numberOfLinksOnPage);
      // console.log('incomingDataChildren', incomingData.data.children);
      var linkIdArray = _.map(incomingData.data.children, function(link) { return link.data.id; });
      // console.log('linkIdArray', linkIdArray);
      var linksArray = incomingData.data.children;
      // console.log('linksArray', linksArray);
      
      //after will always exist but will be null on the last page
      after = incomingData.data.after;

      return Promise.all(linksArray);
    })
    //pass those links along and save the links in the items table
    .then(function(linksArray) {
      console.log('step 2');
      // console.log(123, linksArray);
      var items = [];
      for (var i = 0; i < linksArray.length; i++) {
        var item = linksArray[i];
        // console.log(item);
        items.push(itemController.addRedditItem(createItemForDB(item)));
      }
      console.log('items', items);

      return Promise.all(items);
    })
    //get comments for each link
    .then(function(links) {
      console.log('links', links);
      console.log('step 3');
      var commentTrees = [];
      for (var i = 0; i < links.length; i++) {
        var linkTitle = '';
        var endpoint = 'http://www.reddit.com/comments/' + links[i].id + '.json';
        var commentTree = request(endpoint)
          .spread(function(response, body) {
            //returns an array of all of the comment objects
            linkTitle = JSON.parse(body)[0].data.children[0].data.title;
            // console.log('linkTitle', linkTitle);
            var incomingCommentTree = JSON.parse(body)[1].data.children;
            // console.log('incomingCommentTree', incomingCommentTree);
            for (var i = 0; i < incomingCommentTree.length; i ++) {
              incomingCommentTree[i].data.title = linkTitle;
            }
            // console.log('AFterincomingCommentTree', incomingCommentTree);
            return incomingCommentTree;
          })
        commentTrees.push(commentTree);
          // console.log('commentTree', commentTree);
          //saves all comments in the tree and returns an array with all comments from that tree
      }
      return Promise.all(commentTrees);
    })
    .then(function(commentTrees) {
      console.log('step 4');
      var comments = [];
      for (var i = 0; i < commentTrees.length; i ++) {
        comments.push( processCommentTree(commentTrees[i]) );
      }

      console.log('COMMENTS1', comments);
      return Promise.all(comments);
    })
    //do sentiment analysis stuff on each of the comments in the comments array and save to db
    .then(function(comments) {
      console.log('UNFLATTENED comments', comments);
      comments = _.flattenDeep(comments);
      console.log('FLATTENED comments', comments);

      var sentimentsFromComments = [];
      for (var i = 0; i < comments.length; i++) {
        if (comments[i] && comments[i].text) {
          sentimentsFromComments.push(idolController.getSentimentsSync(comments[i]));
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
        throttledPopulateDBFromPageUrl(generateNextUrl(subreddit, after), subreddit);
      }
    })
    .then(null, function(err) {
      console.log('error getting new comments', err);
    });
}

//saves all comments in the tree and returns an array with all comments from that tree
function processCommentTree(commentTree) {
  console.log('IM WORKING');
  console.log('starting to process comment tree', commentTree);
  var comments = [];

  function recurse (commentTree) {
    for (var i = 0; i < commentTree.length; i++) {
      var currentComment = commentTree[i];
      console.log('currentComment', currentComment);
      comments.push(itemController.addRedditItem(createItemForDB(currentComment)));
      console.log('commentsArray', comments);
      if (currentComment.data.replies) {
        recurse(currentComment.data.replies.data.children);
      }
    }
  }

  recurse(commentTree);

  console.log('finalCommentsBeingReturned', comments);
  return Promise.all(comments);
}

//populate all the itemDB with the link entries
//have an array with all of the link entries
//fetch all of the comments and populate itemDB with the comments
//do sentiment analysis on each comment and populate sentimentDB with the sentiments




//RECURSIVE TO GO THROUGH ALL CHUNKS
//go through a single page and process the links in chunks
//recurse until all links have been processed, then somehow go to next page



// function updateSentiments() {

//   Promise.join(itemController.getComments(), sentimentController.getCommentIdsFromSavedSentiments(),
//     function(comments, commentIds) {

//       comments = _.flattenDeep(comments);
//       var sentimentsFromComments = [];
//       for (var i = 0; i < comments.length; i++) {
//         // console.log(comments[i]);
//         if (comments[i] && comments[i].text && commentIds.indexOf(comments[i].id) < 0) {
//           sentimentsFromComments.push(nltkController.getSentimentsSync(comments[i]));
//         }
//         else {
//           console.log('skipped');
//         }
//       }

//       return Promise.all(sentimentsFromComments);
//     })
//     .then(function() {
//       console.log('done');
//     })
//     .then(null, function(err) {
//       console.log('error getting new comments', err);
//     });

// }

function createItemForDB(itemFromAPI) {
  var item = {};
  var type = '';
  if (itemFromAPI.kind === 't1') {
    type = 'comment';
  } else if (itemFromAPI.kind === 't3') {
    type = 'link';
  }

  var itemData = itemFromAPI.data;
  item.id = itemData.id,
  item.title = itemData.title || null,
  item.source = 'reddit',
  item.type = type,
  item.by = itemData.author,
  item.time = itemData.created,
  item.upvotes = itemData.score;
  // no item.kids

  if (item.type === 'link') {
    item.text = itemData.selftext;
    //no item.parent
  } else if (type === 'comment') {
    item.text = itemData.body;
    item.parent = itemData.parent_id;
  }

  console.log('created item', item);

  return item;
}

function generateNextUrl (subreddit, after) {
  var nextUrl = 'http://www.reddit.com/r/' + subreddit + '/new.json?limit=29' + '&after=' + after;
  return nextUrl;
}

startPopulateDBFromSubreddit('javascript');