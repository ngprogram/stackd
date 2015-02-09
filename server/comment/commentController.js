var Comment = require('./commentModel');
// var storyController = require('../story/storyController');

var commentController = {};
commentController.addComment = addComment;
commentController.getAllIds = getAllIds;
// commentController.updateComment = updateComment;
commentController.getComments = getComments;

module.exports = commentController;

function addComment(comment, callback) {
  Comment.create(comment, function(err, createdComment) {
    if (err) {
      console.log('error adding comment to db', err);
    }
  });
}

function getAllIds(callback) {
  var commentIds = [];
  Comment.find({}, function(err,foundComments) {
    if (!err) {
      for (var i = 0; i < foundComments.length; i++) {
        commentIds.push(foundComments[i].commentId);
      }
      callback(err, commentIds);
    }
  });
}

function getComments(callback) {
  Comment.find({}, callback);
}