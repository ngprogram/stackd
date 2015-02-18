var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var sentimentSchema = new Schema({
  commentId: Number
  score: Number, //rating from -1 to 1
  upvotes: Number // for reddit
  title: String,
  time: Number,
  source: String,
  sentiment: String,
  comment: String
});

module.exports = mongoose.model('Sentiments', sentimentSchema);
