var sentimentController = require('../sentiment/sentimentController');
var aggregatorController = {};
var _ = require('lodash');

var elasticsearchController = require('../elasticsearch/elasticsearchController');
aggregatorController.aggregate = aggregate;
var stdev_days = 30;
var stdev = stdev_days * 24 * 60 * 60; // in days

function aggregate(req,res) {

  var term = req.params.term;
  console.log('aggregate called', term);
  elasticsearchController.searchInTitle(term)
    .then(function(response) {

      total = returnHits(response);

      if (total.length === 0) {
        res.send([]);
        return;
      }

      var storage = {};
      var totalRating = 0;
      var avgRating = 0;
      var totalWeight = 0;

      total.forEach(function(obj) {
        var x = obj.time;
        var weight = Math.exp(-x*x/(2*stdev*stdev));
        totalWeight += weight;
        totalRating += obj.rating * weight;
      });

      avgRating = totalRating/totalWeight;

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
  return arr;
}

function returnHits(array) {
  return _.map(array.hits.hits, function(index) {
        return index._source;
      });
}

module.exports = aggregatorController;