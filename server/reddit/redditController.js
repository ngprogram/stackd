var request = require('request');
var _ = require('lodash');

var redditController = {};

redditController.getNewLinksFromSubreddit = getNewLinksFromSubreddit;
redditController.getCommentTreeForArticle = getCommentTreeForArticle;

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


    });
}

module.exports = redditController;



