var expect = require('chai').expect;
var aggregatorController = require('../server/aggregator/aggregatorController');

describe("Aggregator Controller Spec", function() {
  it('should get some results', function(done) {
    var req = {
      body: 'network'
    }

    aggregatorController.aggregate(req, res)


  });
});