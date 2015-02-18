var request = require('supertest');
var elasticsearchController = require('../server/elasticsearch/elasticsearchController');

var express = require('express');
var app = express();

app.post('/search', elasticsearchController.search);

describe("Elasticsearch Spec", function() {
  it('should return a result', function(done) {
    request(app)
      .post('/search')
      .send('test')
      .expect(200)
      .end(done);

  });

});