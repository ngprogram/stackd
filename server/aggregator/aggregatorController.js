var sentimentController = require('../sentiment/sentimentController');
var aggregatorController = {};
aggregatorController.aggregate = aggregate;


function aggregate(req,res) {
  var storage = {};
  var avgRating = 0;
  var term = req.params.term;

  sentimentController.getSentimentsFromKeyword(term, function(err, total) {
    if (total.length === 0) {
      res.send([]);
    }

    total.forEach(function(obj) {
      console.log('ob',obj);
      var objId = JSON.stringify(obj.id);
      var sentiment = obj.sentiment;
      var valObj = {};
      avgRating += obj['score'];
      if (!storage[sentiment]) {
        valObj.count = 1;
        valObj.id = objId;
        valObj.score = obj.score;
        storage[sentiment] = valObj;
      } else {
        storage[sentiment].count++;
      }
    });
    var topVals = sortObjectByCount(storage);
    var topScores = sortObjectByScore(storage);
    // console.log('storage', topVals);
    // console.log('topval', storage[topVals[0].key].id, term);
    var comments = [];
    // TO DO, if not sentiments, then do not use topVals[0].key
    sentimentController.getCommentFromSentiment(storage[topVals[0].key].id, function(err, foundSentiment) {
      console.log('foundsent', foundSentiment);
      comments = comments.concat(foundSentiment);
      var returnResult = {};
      returnResult.avg = avgRating/total.length;
      returnResult.topValues = topVals;
      returnResult.twoComments = comments;
      console.log('return res',returnResult);
      //clearCache
      storage = {};
      avgRating = 0;
      res.send(returnResult);
    });
  });
};

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
  console.log('arrCount', arr);
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
  console.log('arrScore', arr);
  return arr;
}

module.exports = aggregatorController;