var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var sentimentSchema = new Schema({
  percentage: Number,
  sentiments: [String]
});

// compile message schema into a message model
module.exports = mongoose.model('Sentiment', sentimentSchema);
