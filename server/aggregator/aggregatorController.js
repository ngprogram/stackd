var sentimentController = require('../sentiment/sentimentController');
var aggregatorController = {};
var _ = require('lodash');

var elasticsearchController = require('../elasticsearch/elasticsearchController');
aggregatorController.aggregate = aggregate;

function aggregate(req,res) {
  var storage = {};
  var avgRating = 0;
  var term = req.params.term;
  console.log('aggregate called', term);
  elasticsearchController.searchInTitle(term)
    .then(function(response) {
      total = _.map(response.hits.hits, function(index) {
        return index._source;
      });
      console.log('total123', total);
      if (total.length === 0) {
        res.send([]);
        return;
      }
      total.forEach(function(obj) {
        avgRating += obj.rating;
      });

      var origStore = storage;
      var topVals = sortObjectByCount(storage);

      var totalSortedByReplies = sortArrayByUpvotes(total);
      var twoWithMostReplies = totalSortedByReplies.slice(0, 2);
      var twoCommentsWithMostReplies = _.map(twoWithMostReplies, function(item) {return item.comment;});
      console.log('twoCommentsWithMostReplies', twoCommentsWithMostReplies);

      res.send({avg: (avgRating/total.length - 0.50) * 2, comments: twoCommentsWithMostReplies});


      // sentimentController.getRedditSentimentsSortedByUpvotes(term, function(err, results) {
      //   console.log('RESULTS', results);
      //   var resultsComments = _.map(results, function(result) {return result.comment;});
      //   console.log('resultsComments', resultsComments);
      //   var uniqueComments = _.uniq(resultsComments);
      //   console.log('uniqueComments', uniqueComments);
      //   var upperBound = (uniqueComments.length < 3) ? uniqueComments.length : 3;
      //   for (var i = 0; i < upperBound; i++) {
      //     twoCommentsWithMostReplies.push(uniqueComments[i]);
      //   }

      //   console.log('i work!',  avgRating, twoCommentsWithMostReplies);
      //   // new aggregetor spans from 0-1. 0.5 is neutral.

      // });

    })

};

function sortArrayByUpvotes(array) {
  var sortedArray = array.sort(function(a,b) {
    return a.replies - b.replies;
  });
  return sortedArray;
}

function sortObjectByCount(obj) {
  var arr = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      console.log('prop', prop);
      arr.push({
        'key': prop,
        'value': obj[prop]
      });
    }
  }
  arr.sort(function(a, b) {
    return b.value.count - a.value.count;
  });
  // console.log('arrCount', arr);
  return arr;
}
function sortObjectByScore(obj) {
  var arr = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      console.log('prop', prop);
      arr.push({
        'key': prop,
        'value': obj[prop]
      });
    }
  }
  arr.sort(function(a, b) {
    return b.value.score - a.value.score;
  });
  // console.log('arrScore', arr);
  return arr;
}

module.exports = aggregatorController;