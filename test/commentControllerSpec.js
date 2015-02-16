var expect = require('chai').expect;
var Promise = require('bluebird');
var commentController = Promise.promisifyAll(require('../server/comment/commentController'));

var mongoose = require('mongoose');
var config = require('config');
mongoose.connect(config.get('mongo'));

describe('commentController', function() {
  // it('should work', function(done) {


  //   commentController.getAllCommentIds().then(function(commentIds) {
  //     expect(commentIds).to.exist;
  //     done();
  //   });
  // });

  it('should work', function(done) {
    var sampleComment = {
      commentId: 1,
      text: "test",
      parentId: 345,
      title: "some title"
    }

    commentController.addComment(sampleComment).then(function(comment) {
      console.log(comment);
      expect(comment).to.exist;
      done();
    })
    .then(null, function(err) {
      console.log('error with adding comment', err);
    });
  });
});