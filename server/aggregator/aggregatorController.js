
var aggregatorController = {};
aggregatorController.add = add;
aggregatorController.aggregate = aggregate;

var storage = {};
var total = [];
var avgRating = 0;

function add(sent) {
  total = total.concat(sent);
};

function aggregate(req,res) {
  total.forEach(function(obj) {
    var sentiment = obj.sentiment;
    avgRating += obj[Object.keys(obj)[2]];
    if (!storage[sentiment]) {
      storage[sentiment] = 1;
    } else {
      storage[sentiment]++;
    }
  });
  var returnResult = {};
  returnResult.avg = avgRating/total.length;
  returnResult.topValues = sortObject(storage);
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