var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var sentimentSchema = new Schema({
  sentiment: { type: String },
  rating: String,
  score: Number,
  title: String,
  author: String,
  date: Number,
  comment: { type: String }
});

sentimentSchema.index({ "sentiment": 1, "comment": 1 }, { unique: true });

// compile message schema into a message model
// module.exports = mongoose.model('Sentiments', sentimentSchema);
module.exports = mongoose.model('Sentiment_test', sentimentSchema);


// var total = [
//   {
//     sentiment: 'like',
//     rating: 'positive',
//     score: 0.3,
//     topic: 'react'
//   },
//   {
//     sentiment: 'like',
//     rating: 'positive',
//     score: 0.6,
//     topic: 'node'
//   },
//   {
//     sentiment: 'awesome',
//     rating: 'negative',
//     score: 0.9,
//     topic: 'angular'
//   },
//   {
//     sentiment: 'huhhh',
//     rating: 'pos',
//     score: .3,
//     topic: 'react'
//   }
// ];