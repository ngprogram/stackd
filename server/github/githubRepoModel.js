var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

// define github repo schema
var githubRepoSchema = new Schema({
  repoId: { type: Number, unique: true, required: true },
  repoName: String,
  languages: []
});

// compile github repo schema into a github repo model
module.exports = mongoose.model('GithubRepo', githubRepoSchema);