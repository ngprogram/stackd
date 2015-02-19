var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var sentimentSchema = new Schema({
  commentId: String,
  rating: Number, //rating from -1 to 1
  score: Number, // for reddit
  title: String,
  time: Number,
  source: String,
  sentiment: [String],
  comment: String
});

module.exports = mongoose.model('Sentiments', sentimentSchema);
