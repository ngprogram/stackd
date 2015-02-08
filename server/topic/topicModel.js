var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var topicSchema = new Schema({
  topic: String,
  sentimentCount: Number,
  aggregateSentiment: String,
  aggregateSentimentScore: Number
});

// compile message schema into a message model
module.exports = mongoose.model('Topic', topicSchema);