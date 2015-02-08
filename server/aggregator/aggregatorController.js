  var storage = {};
  var total = [];
  var avgRating = 0;

  var add = function(sent) {
    total = total.concat(sent);
  };

  var aggregate = function(req,res) {
    total.forEach(function(obj) {
      var sentiment = obj.sentiment;
      avgRating += obj[Object.keys(obj)[2]];
      console.log(storage, sentiment);
      if (!storage[sentiment]) {
        storage[sentiment] = 1;
      } else {
        storage[sentiment]++;
      }
    });
    console.log(storage);
    var returnResult = {};
    returnResult.avg = avgRating/total.length;
    returnResult.topValues = sortObject(storage);
    console.log('RES',returnResult);
    // res.send(returnResult);
  };

  this.clear = function() {
    storage = [];
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