var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var sentimentSchema = new Schema({
  sentiment: { type: String },
  positive: Number, // 0-1. Less than 0.5 means negative
  neutral: Number, // 0 - 0.5. Lower number -> less neutral
  commentId: Number,
  title: String,
  by: String,
  time: Number,
  comment: String
});

sentimentSchema.index({ "sentiment": 1, "comment": 1 }, { unique: true });

module.exports = mongoose.model('Sentiments', sentimentSchema);
