var Promise = require('bluebird');
var itemController = require('../server/item/itemController');
var sentimentController = require('../server/sentiment/sentimentController');
var _ = require('lodash');
var idolController = require('../server/util/idolController');
var mongoose = require('mongoose');
var config = require('config');

mongoose.connect(config.get('mongo'));


var throttledGetSentiments = _.throttle(idolController.getSentimentsSync, 500);

function updateSentiments() {

  Promise.join(itemController.getComments(), sentimentController.getCommentIdsFromSavedSentiments(),
    function(comments, commentIds) {

      console.log(comments.length);
      var sentimentsFromComments = [];
      for (var i = 0; i < comments.length; i++) {
        if (comments[i] && comments[i].text && commentIds.indexOf(comments[i].id) < 0) {
          console.log('entering');
          sentimentsFromComments.push(throttledGetSentiments(comments[i]));
        } else if (!comments[i].text) {
          console.log('comment' +comments[i].id +' missing comment');
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

updateSentiments();
