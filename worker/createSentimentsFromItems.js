var Promise = require('bluebird');
var itemController = require('../server/item/itemController');
var sentimentController = require('../server/sentiment/sentimentController');
var _ = require('lodash');
var idolController = require('../server/util/idolController');
var mongoose = require('mongoose');
var config = require('config');

mongoose.connect(config.get('mongo'));
var chunkSize = 20;
var count = 0;
var globalCommentIds;
var globalComments;

var throttledGetChunk = _.throttle(getChunk, 2000);

function updateSentiments() {

  Promise.join(itemController.getComments(), sentimentController.getCommentIdsFromSavedSentiments(),
    function(comments, commentIds) {

      globalCommentIds = commentIds;
      globalComments = comments;
      getChunk(0);

    })
    .catch(function(err) {
      console.log('error getting new comments', err);
    });

}

function getChunk(start) {
  console.log('starting', count);
  var sentimentsFromComments = [];

  for (var i = start; i < start + chunkSize && i < globalComments.length; i++) {
    if (globalComments[i] && globalComments[i].text && globalCommentIds.indexOf(globalComments[i].id) < 0) {
      sentimentsFromComments.push(idolController.getSentimentsSync(globalComments[i]));
    } else if (!globalComments[i].text) {
      console.log('comment' +globalComments[i].id +' missing comment');
    }
    else {
      console.log('skipped');
    }
  }

  return Promise.all(sentimentsFromComments)
    .then(function(response) {
      console.log('response', response);
      count = count + chunkSize;
      if (count + chunkSize < globalComments.length) {
        throttledGetChunk(count);
      }
    });
}


updateSentiments();
