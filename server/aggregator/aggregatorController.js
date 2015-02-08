var sentimentController = require('../sentiment/sentimentController');
var aggregatorController = {};
aggregatorController.aggregate = aggregate;

var storage = {};
var avgRating = 0;

function aggregate(req,res) {
  var term = req.params.term;

  sentimentController.getSentimentsFromKeyword(term, function(err, total) {
    // console.log('length', total.length);
    if (total.length === 0) {
      res.send([]);
    }

    total.forEach(function(obj) {
      var sentiment = obj.sentiment;
      avgRating += obj['score'];
      if (!storage[sentiment]) {
        storage[sentiment] = 1;
      } else {
        storage[sentiment]++;
      }
    });
    // console.log('storage', storage);
    var topVals = sortObject(storage);
    console.log('topval', topVals);
    var comments = [];

    // TO DO, if not sentiments, then do not use topVals[0].key
    sentimentController.getCommentFromSentiment(topVals[0].key, term, function(err, foundSentiment) {
      comments = comments.concat(foundSentiment);
      var returnResult = {};
      returnResult.avg = avgRating/total.length;
      returnResult.topValues = topVals;
      returnResult.twoComments = comments;
      console.log(returnResult);
      clearCache();
      res.send(returnResult);
    })
  });
};

function clearCache() {
  storage = {};
  avgRating = 0;
};

function sortObject(obj) {
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
    return b.value - a.value;
  });
  return arr;
}

module.exports = aggregatorController;