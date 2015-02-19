var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var itemSchema = new Schema({
  id: { type: String, required: true },
  type: { type: String, required: true },
  title: String,
  source: { type: String, required: true },
  parent: String,
  text: String,
  by: String,
  replies: Number,
  time: Number,
  score: Number,
  kids: [Number]
});

itemSchema.index({ "id": 1, "source": 1 }, { unique: true });

module.exports = mongoose.model('Item', itemSchema);