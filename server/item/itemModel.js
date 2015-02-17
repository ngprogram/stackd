var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var itemSchema = new Schema({
  id: { type: Number, unique: true, required: true },
  parent: Number,
  title: String,
  text: String,
  source: String,
  type: String,
  by: String,
  time: Number,
  score: Number,
  kids: [Number]
});

// compile message schema into a message model
module.exports = mongoose.model('Item', itemSchema);