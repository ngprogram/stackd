(function() {

  var app = angular.module('stackdApp', []);

  app.controller('SearchController', ['$http', function($http) {
    this.searchTerm = '';
    this.search = function(val) {
      $http.get('/search/' + val)
      .success(function(data, status) {
          console.log(data);
      })
      .then(function(error) {
        console.log(error);
      });
    };

  }]);

})();
