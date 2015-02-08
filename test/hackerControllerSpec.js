var hackerController = require('../server/hacker/hackerController');
var expect = require('chai').expect;

describe('hackerController', function() {
  it('should get array of comments from post', function(done) {
    var req = {};
    req.body = {};
    req.body.keyword = 'Docker';
    hackerController.gatherComments(req);
  });

  xit('should return comment', function(done) {
    var count = 0;
    hackerController.getComment(8952, function(comment) {
      expect(comment).to.eql("Aw shucks, guys ... you make me blush with your compliments.<p>Tell you what, Ill make a deal: I'll keep writing if you keep reading. K?");
      done();
    });
  });
});