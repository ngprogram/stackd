var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var sentimentSchema = new Schema({
  sentiment: String,
  rating: String,
  score: Number,
  topic: String,
  count: Number
});

// compile message schema into a message model
module.exports = mongoose.model('Sentiment', sentimentSchema);