var sentimentController = require('../sentiment/sentimentController');
var _ = require('lodash');
var Promise = require('bluebird');
var elasticsearchController = require('../elasticsearch/elasticsearchController');
aggregatorController.aggregate = aggregate;

var aggregatorController = {};
var stdev_days = 30;
var stdev = stdev_days * 24 * 60 * 60; // in days

function aggregate(req,res) {
  var term = req.params.term;
  Promise.join(elasticsearchController.searchInTitle(term), elasticsearchController.getTopLinks(term),
    function(response, topLinks) {

      total = returnHits(response);
      topLinks = returnHits(topLinks);
      if (total.length === 0) {
        res.send([]);
        return;
      }
      var totalRating = 0;
      var avgRating = 0;
      var totalWeight = 0;
      total.forEach(function(obj) {
        var x = Date.now()/1000 - obj.time;
        var weight = Math.exp(-x*x/(2*stdev*stdev));

        if (isNaN(weight)) {
          weight = 0;
        }
        totalWeight += weight;
        totalRating += obj.rating * weight;
      });

      avgRating = totalRating/totalWeight;
      res.send({avg: avgRating, topLinks: topLinks});
    });
};

function sortArrayByUpvotes(array) {
  var sortedArray = array.sort(function(a,b) {
    return a.replies - b.replies;
  });
  return sortedArray;
}

function countSentiments(sentiments) {
  var sentimentCounter = {};
  var topSentiment;
  var secondSentiment;
  var topCounter = 0;
  for (var i = 0; i < sentiments.length; i++)  {
    for (var j = 0; j < sentiments[i].sentiment.length; j++) {
      if (sentimentCounter[sentiments[i].sentiment[j]] === undefined) {
        sentimentCounter[sentiments[i].sentiment[j]] = 0;
      }
      sentimentCounter[sentiments[i].sentiment[j]]++;
    }
  }

  for (var sentiment in sentimentCounter) {
    if (sentimentCounter[sentiment] > topCounter) {
      secondSentiment = topSentiment;
      topSentiment = sentiment;
      topCounter = sentimentCounter[sentiment];
    }
  }

  return [findTopComment(sentiments, topSentiment), findTopComment(sentiments, secondSentiment)];

}

function findTopComment(sentiments, topSentiment) {
  var relevantSentiments = [];
  for (var i = 0; i < sentiments.length; i++)  {
    for (var j = 0; j < sentiments[i].sentiment.length; j++) {
      if (sentiments[i].sentiment[j] === topSentiment) {
       relevantSentiments.push(sentiments[i]);
      }
    }
  }

  relevantSentiments.sort(function(a,b) {
    return a.score - b.score;
  })

  return relevantSentiments[0];
}


function sortObjectByCount(obj) {
  var arr = [];
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
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