var sentimentController = require('../sentiment/sentimentController');
var aggregatorController = {};
var _ = require('lodash');

var elasticsearchController = require('../elasticsearch/elasticsearchController');
aggregatorController.aggregate = aggregate;
var stdev_days = 30;
var stdev = stdevDays * 24 * 60 * 60; // in days

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


      var totalWeight = 0;

      total.forEach(function(obj) {
        var x = obj.time;
        var weight = Math.exp(-x*x/(2stdev*stdev));
        totalWeight += weight;
        avgRating += obj.rating * weight;
      });

      avgRating = avgRating/totalWeight;

      var origStore = storage;
      var topVals = sortObjectByCount(storage);

      var totalSortedByReplies = sortArrayByUpvotes(total);
      var twoWithMostReplies = totalSortedByReplies.slice(0, 2);
      var twoCommentsWithMostReplies = _.map(twoWithMostReplies, function(item) {return item.comment;});

      res.send({avg: avgRating, comments: twoCommentsWithMostReplies});

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