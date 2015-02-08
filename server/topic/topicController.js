var mongoose = require('mongoose');
var Topic = require('./topicModel');
var mongooseURI = require('../../config/database');

mongoose.connect(mongooseURI.URI);

var topicController = {};
topicController.addTopic = addTopic;

function addTopic(topic, callback) {
  Topic.create(topic, callback);
}

module.exports = topicController;
