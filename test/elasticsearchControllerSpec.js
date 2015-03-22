var request = require('supertest');
var expect = require('chai').expect;
var Promise = require('bluebird');
var elasticsearchController = require('../server/elasticsearch/elasticsearchController');

describe("Elasticsearch Spec", function() {

  xit('should create a sentiment', function(done) {
    var sampleSentiment = { "id" : "45434g", "rating" : -0.5274215517597863, "score" : 0, "commentId" : "9070882", "title" : "Ask HN: TrueCrypt audit status?", "time" : 1424293091, "source" : "Hacker News", "sentiment" : "lose", "comment" : "Pedantic, but hopefully in a fun way:<p>Authentication is the biggest problem with sector-level crypto, but the other technical problem with encrypting sectors is that you don&#x27;t get a place to store the metadata you&#x27;d need to randomize the encryption, and so you lose semantic security as well. If you squint at it the right way, XTS is the ECB mode of sector-level (wide-block) crypto schemes.", "__v" : 0 };

    elasticsearchController.create(sampleSentiment)
      .then(function(response) {
        done();
      })
      .then(null, function(err) {
        console.log('error', err);
      });

  });

  xit('should add sentiment in bulk', function(done) {
    var sampleSentiment = { "id" : "45434g", "rating" : -0.5274215517597863, "score" : 0, "commentId" : "9070882", "title" : "Ask HN: TrueCrypt audit status?", "time" : 1424293091, "source" : "Hacker News", "sentiment" : "lose", "comment" : "Pedantic, but hopefully in a fun way:<p>Authentication is the biggest problem with sector-level crypto, but the other technical problem with encrypting sectors is that you don&#x27;t get a place to store the metadata you&#x27;d need to randomize the encryption, and so you lose semantic security as well. If you squint at it the right way, XTS is the ECB mode of sector-level (wide-block) crypto schemes.", "__v" : 0 };

    elasticsearchController.migrate([sampleSentiment])
      .then(function(response) {

        return elasticsearchController.searchInTitle('audit')
      })
      .then(function(response) {
        done();
      })
      .then(null, function(err) {
        console.log('error', err);
      });


  });

xit('should return sentiments', function(done) {
  elasticsearchController.searchInTitle('javascript')
    .then(function(response) {
      expect(response.hits.hits).to.exist;
      done()
    });

});

it('should return link', function(done) {
  elasticsearchController.getTopLinks('javascript')
    .then(function(response) {
      expect(response.hits.hits).to.have.length.gte(5);
      done()
    });

});

});