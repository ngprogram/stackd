var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var sentimentSchema = new Schema({
  commentId: String,
  rating: Number, //rating from -1 to 1
  score: Number, // Number of upvotes
  replies: Number, // for reddit, number of replies, for HN number of children
  title: String,
  time: Number,
  by: String,
  source: String,
  sentiment: [String],
  comment: String
});

module.exports = mongoose.model('Sentiments', sentimentSchema);
