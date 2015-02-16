var GithubRepo = require('./githubRepoModel');

var githubRepoController = {};
githubRepoController.addRepo = addRepo;
githubRepoController.getLanguages = getLanguages;
githubRepoController.getRepos = getRepos;

function addRepo(repo, callback) {
  GithubRepo.create(repo, function(err, createdRepo) {
    if (err) {
      console.log('error adding repo to db', err);
    }
    console.log(createdRepo);
  });
}

//return an object with all languages and the # of repos that use that language
function getLanguages(callback) {
  var repoLanguages = {};
  GithubRepo.find({}, function(err, foundRepos) {
    if (!err) {
      for (var i = 0; i < foundRepos.length; i++) {
        for (var j = 0; j < foundRepos[i].languages; j++) {
          repoLanguages[foundRepos[i].languages[j]] ? repoLanguages[foundRepos[i].languages[j]]++ : (repoLanguages[foundRepos[i].languages[j]] = 1)
        }
      }
    }
    callback(repoLanguages);
  });
}

function getPercentages(repoLanguages) {
  var repoLanguagePercentages = {};
  var totalNumber = 0;
  if (err) {
    console.log('err', err);
    return;
  } else {
    for (var language in repoLanguages) {
      totalNumber += repoLanguages[language];
    }
    for (var language in repoLanguages) {
      //need to round these numbers?
      repoLanguagePercentages[language] = repoLanguages[language]/totalNumber;
    }
  }
  return repoLanguagePercentages;
}

function getRepos(callback) {
  GithubRepo.find({}, callback);
}

module.exports = githubRepoController;