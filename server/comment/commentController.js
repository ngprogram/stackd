var Comment = require('./commentModel');
var storyController = require('../story/storyController');

var commentController = {};
commentController.addComment = addComment;
commentController.getAllCommentIds = getAllCommentIds;
commentController.getComments = getComments;
commentController.deleteComments = deleteComments;

function addComment(comment) {
  return Comment.create(comment);
}

function getAllCommentIds(callback) {
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