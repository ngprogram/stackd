var Comment = require('./commentModel');
var storyController = require('../story/storyController');

var commentController = {};
commentController.addComment = addComment;
commentController.getAllCommentIds = getAllCommentIds;
commentController.getComments = getComments;

function addComment(comment, callback) {
  Comment.create(comment, function(err, createdComment) {
    if (err) {
      console.log('error adding comment to db', err);
    }
  });
}

function getAllCommentIds(callback) {
  var commentIds = [];
  // console.log(Comment.find().exec());
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

function getComments(callback) {
  Comment.find({}, callback);
}

module.exports = commentController;