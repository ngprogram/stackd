var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var sentimentSchema = new Schema({
  id: { type: Number, unique: true }, //same as commentId
  positive: Number, // 0-1. Less than 0.5 means negative
  neutral: Number, // 0 - 0.5. Lower number -> less neutral
  title: String,
  time: Number
});

module.exports = mongoose.model('Sentiments', sentimentSchema);
