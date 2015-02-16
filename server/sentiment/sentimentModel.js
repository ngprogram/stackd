var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var sentimentSchema = new Schema({
  sentiment: { type: String },
  commentId: Number,
  rating: String,
  score: Number,
  title: String,
  by: String,
  time: Number,
  comment: String
});

sentimentSchema.index({ "sentiment": 1, "comment": 1 }, { unique: true });

module.exports = mongoose.model('Sentiments', sentimentSchema);
// module.exports = mongoose.model('Sentiment_test', sentimentSchema);
