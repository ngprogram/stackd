var Comment = require('./commentModel');
var storyController = require('../story/storyController');

var commentController = {};
commentController.addComment = addComment;
commentController.getAllCommentIds = getAllCommentIds;
commentController.getComments = getComments;
commentController.deleteComments = deleteComments;

function addComment(comment) {
  return Comment.create(comment)
    .then(null, function(err) {
      console.log('error creating comment', err);
    });
}

function findStoryId(commentId) {
  return Comment.find({commentId: commentId})
    .exec()
    .then(function(foundComment) {

    })
}

function getAllCommentIds() {
  var commentIds = [];
  return Comment.find()
    .exec()
    .then(function(foundComments) {

      for (var i = 0; i < foundComments.length; i++) {
        commentIds.push(foundComments[i].commentId);
      }
      return commentIds;
    })
    .then(null, function(err) {
      console.log('error getting all commentIds', err);
    });
}

function getComments() {
  return Comment.find({}).exec()
    .then(null, function(err) {
      console.log('error getting comments', err);
    });
}

function deleteComments() {
  return Comment.remove({})
    .exec();
}

module.exports = commentController;