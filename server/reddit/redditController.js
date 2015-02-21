var request = require('request');
var _ = require('lodash');

var redditController = {};

redditController.getNewLinksFromSubreddit = getNewLinksFromSubreddit;
redditController.getCommentTreeForArticle = getCommentTreeForArticle;

//takes in subreddit (string) and gets all new links
function getNewLinksFromSubreddit(subreddit) {
  var endpoint = 'http://www.reddit.com/r/' + subreddit + '/new.json?limit=100';

  request
    .get(endpoint, function(err, response, body) {
    });
}

function getCommentTreeForArticle(article) {
  var endpoint = 'http://www.reddit.com/comments/' + article + '.json';

  request
    .get(endpoint, function(err, response, body) {

      // JSON.parse(body)[1].data.children is the array of all of the children
      console.log('all', JSON.parse(body)[0]);
      console.log('all', JSON.parse(body)[0].data.children[0].data.title);
      // console.log('all', JSON.parse(body)[1].data.children[0].data.replies.data.children);
      console.log(err);
      // var topIDs = JSON.parse(body);
      // topIDs.slice(0,50).forEach(function(ID) {
      //   getCommentsFromStoryID(ID);
      //   getCommentsFromStoryID(ID, keyword, callback);
      // });
    });
}


// getNewLinksFromSubreddit('javascript');
// getCommentTreeForArticle('2w68gq');


module.exports = redditController;



