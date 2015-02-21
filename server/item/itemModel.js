var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var itemSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  title: String, //story or comment
  source: { type: String, required: true },
  parent: String,
  text: String,
  by: String,
  link: String,
  replies: Number, //used by reddit
  time: Number,
  score: Number, // upvotes by reddit
  kids: [Number] //used by HN
});

itemSchema.index({ "id": 1, "source": 1 }, { unique: true });

module.exports = mongoose.model('Item', itemSchema);