var sentimentController = require('../sentiment/sentimentController');
var aggregatorController = {};
aggregatorController.aggregate = aggregate;

var storage = {};
var total = [];
var avgRating = 0;

function aggregate(req,res) {
  var term = req.params.term;
  total = sentimentController.getSentimentsFromKeyword();
  console.log(total);
  if (!total) {
    res.send([]);
  }
  total.forEach(function(obj) {
    var sentiment = obj.sentiment;
    avgRating += obj[Object.keys(obj)[2]];
    if (!storage[sentiment]) {
      storage[sentiment] = 1;
    } else {
      storage[sentiment]++;
    }
  });

  var topVals = sortObject(storage);
    
  var comments = [];
  comments.push(sentimentController.getCommentFromSentiment(topVals[0].key), term);
  comments.push(sentimentController.getCommentFromSentiment(topVals[1].key), term);
  
  var returnResult = {};
  returnResult.avg = avgRating/total.length;
  returnResult.topValues = topVals;
  returnResult.twoComments = comments;
  hackerController.clear();

  console.log('RESULT');
  console.log(returnResult);
  clear();
  res.send(returnResult);
};

function clear() {
  storage = {};
  total = [];
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