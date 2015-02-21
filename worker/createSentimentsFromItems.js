var Promise = require('bluebird');
var itemController = require('../server/item/itemController');
var sentimentController = require('../server/sentiment/sentimentController');
var _ = require('lodash');

var throttledGetSentiments = idolController.getSentimentsSync;

function updateSentiments() {

  Promise.join(itemController.getComments(), sentimentController.getCommentIdsFromSavedSentiments(),
    function(comments, commentIds) {


      var sentimentsFromComments = [];
      for (var i = 0; i < comments.length; i++) {
        if (comments[i] && comments[i].text && commentIds.indexOf(comments[i].id) < 0) {

          sentimentsFromComments.push(throttledGetSentiments(comments[i]));
        } else if (!comments[i].text) {
          console.log('comment' +comment[i].id +' missing comment');
        }
        else {
          console.log('skipped');
        }
      }

      return Promise.all(sentimentsFromComments);
    })
    .then(function() {
      console.log('done');
    })
    .then(null, function(err) {
      console.log('error getting new comments', err);
    });

}
