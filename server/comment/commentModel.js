var Promise = require('bluebird');
var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define message schema
var commentSchema = new Schema({
  commentId: { type: Number, unique: true, required: true },
  text: String,
  parentId: Number,
  date: Number,
  title: { type: String, default: null }
});

// compile message schema into a message model

module.exports = mongoose.model('Comment', commentSchema);;