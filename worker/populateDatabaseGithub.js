var request = require('request');
// var GitHubApi = require('github');
var githubRepoController = require('../server/github/githubRepoController');
var githubAuth = require('../config/auth').githubAuth;
// var storyController = require('../server/story/storyController');
// var idolController = require('../server/idol/idolController');
// var sentimentController = require('../server/sentiment/sentimentController');
// var Promise = require('bluebird');

var mongoose = require('mongoose');
var mongooseURI = require('../config/database').URI;

mongoose.connect(mongooseURI);

// var github = new GitHubApi({
//   version: "3.0.0"
// });

var startUrl = 'https://api.github.com/repositories';

function populateDBWithRepos(startId, endId) {  
  //figure out the first Url to start at
  //this may repeat some of the ones in the beginning... need to fix that
  var startUrl;  
  if (startId === 0) {
    // console.log('in startId1');
    startUrl = 'https://api.github.com/repositories';
  } else {
    // console.log('in startId2');
    startUrl = generateSinceUrl(startId);
  }

  //else recurse to do something...
  function recurse(url) {
    console.log(url);
    var sinceNumberOfNext = getSinceNumber(url) || 0;
    console.log('sinceNumberOfNext', sinceNumberOfNext);
    if (sinceNumberOfNext >= endId) {
      return;
    } else {
      // console.log('in else');
      var options = {
        url: addAuthQueryParameters(url),
        headers: {
          'User-Agent': 'stat'
        }
      };

      console.log('options', options)
       
      function requestCallback(error, response, body) {
        // console.log('in request callback');
        console.log('err', error);
        if (!error && response.statusCode == 200) {
          var repos = JSON.parse(body);
          var nextUrl = extractSinceUrl(response.headers.link);
          for (var i = 0; i < repos.length; i++) {
            parseAndSaveToDB(repos[i]);
          }

          console.log('nextUrl', nextUrl);
          // console.log('repooos', repos);
          recurse(nextUrl);
          // console.log('responselink', response.headers);
          // console.log('repos', repos);
          // console.log(info.stargazers_count + " Stars");
          // console.log(info.forks_count + " Forks");
        }
      }

      request(options, requestCallback);
    }
  }

  recurse(startUrl);

}

function parseAndSaveToDB(repo) {
  var languagesArray = [];
  var repoId = repo.id;
  var repoName = repo.name;
  var languageUrl = repo.languages_url;

  var options = {
    url: addAuthQueryParameters(languageUrl),
    headers: {
      'User-Agent': 'stat'
    }
  };

  function requestCallback(error, response, body) {
      // console.log('body', body);
      console.log('body', JSON.parse(body));
      var languageObj = JSON.parse(body);
      for (var language in languageObj) {
        languagesArray.push(language);
      }
      githubRepoController.addRepo({
        repoId: repoId,
        repoName: repoName,
        languages: languagesArray
      });
  }

  request(options, requestCallback);

}

function extractSinceUrl(responseHeaderLink) {
  var pattern = /<(.*?)(?=>; rel="next")/;
  var match = responseHeaderLink.match(pattern)[1];
  return match;
}

function generateSinceUrl(number) {
  var sinceUrl = 'https://api.github.com/repositories?since=' + number;
  return sinceUrl;
}

function getSinceNumber(url) {
  var pattern = /since=(.*)/;
  var resultArray = url.match(pattern);
  var number = 0;
  if (resultArray !== null) {
    number = parseInt(resultArray[1]);
  }
  return number;
}

function addAuthQueryParameters(url) {
  var questionMarkOrAmpersand = '';
  if (url.indexOf('?') === -1) {
    questionMarkOrAmpersand = '?';
  } else {
    questionMarkOrAmpersand = '&';
  }
  var newUrl = url + questionMarkOrAmpersand + 'client_id=' + githubAuth.clientID + '&client_secret=' + githubAuth.clientSecret;
  return newUrl;
}

// function getSinceNumber(linkHeader) {
//   var numberPattern = /\d+(?=>; rel="next")/;
//   console.log(linkHeader);
//   console.log(linkHeader.match(numberPattern));
//   var numberArray = linkHeader.match(numberPattern);
//   var number = 0;
//   if (numberArray !== null) {
//     number = parseInt(numberArray[0]);
//   }
//   return number;
// }

populateDBWithRepos(0, 1300);



  // request
  //   .get('https://api.github.com/repositories', function(err, response, body) {
  //     // var topID = JSON.parse(body)[99];
  //     // getNewStories(topID-30000, topID);
  //     console.log('res', response);
  //     console.log('bod', body);
  //     console.log('err', err);
  //   });

  // github.repos.getAll({type: "all"}, function(err, res) {
  //   console.log("res123", res);
  //   console.log("err", err);
  // });