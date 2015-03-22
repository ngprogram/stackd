(function() {

  var app = angular.module('stackdApp', ['nvd3']);

  app.controller('SearchController', ['$http', '$scope', 'ChartFactory', function($http, $scope, ChartFactory) {
    var vm = this;
    $scope.searchTerm = '';
    this.incomingData = {};
    this.showData = ChartFactory.showData;
    this.newData = ChartFactory.newData;
    $scope.lnks = [];
    $scope.topic = '';
    $scope.showSlider = false;
    this.search = function(val) {
      $scope.showSlider = false;
      $scope.hnLinks = [];
      $scope.redditLinks = [];
      $http.get('/search/' + val)
      .success(function(data, status) {
        console.log('data',data);
        if (data.topLinks.length === 0) {
          vm.showData = false;
          $scope.searchTerm = '';
          $scope.showSlider = true;
          console.log('nothing here', $scope.showSlider);
          return;
        }
        data.topLinks.forEach(function(datum) {
          if (datum.source === 'Hacker News') {
            $scope.hnLinks.push(datum);
          }
          else {
            $scope.redditLinks.push(datum);
          }
        });
        vm.showData = true;
        $scope.topic = $scope.searchTerm;
        $scope.searchTerm = '';

        console.log('qwer',data,status);
        vm.incomingData = data;
        ChartFactory.newData = data;
        vm.newData = data;
        // console.log('hihi',ChartFactory.newData);
        // console.log('hoho', vm.newData);

        // console.log(1234,vm.incomingData.avg);
        ChartFactory.data[0].values[0].value = Math.round((vm.incomingData.avg * 100) * 100) / 100;
        if (vm.incomingData.avg < 0) {
          ChartFactory.data[0].color = '#B64949';
        } else {
          ChartFactory.data[0].color = '#4374A8';
        }
        console.log(3333,ChartFactory.data);
      })
      .error(function(error) {
        console.log(error);
      });
    };

    this.options = ChartFactory.options;

    this.data = ChartFactory.data;

    // this.test = function() {
    //   console.log(this.data);
    //   console.log(vm.data)
    // }

  }]);

  app.factory('ChartFactory', ChartFactory);

  function ChartFactory() {
    var newData = {};
    var showData = false;

    var options = {
      chart: {
        type: 'multiBarHorizontalChart',
        height: 235,
        width: 580,
        x: function(d){return d.label;},
        y: function(d){return d.value;},
        showControls: true,
        showValues: true,
        transitionDuration: 500,
        xAxis: {
          showMaxMin: false
        },
        yAxis: {
          axisLabel: 'Values',
          tickFormat: function(d){
            return d3.format(',.2f')(d);
          }
        },
        showXAxis: false,
        showYAxis: false,
        tooltips: false,
        yAxisRange: [-100,100],
        forceY: [-100,100],
        showControls: false,
        showLegend: false
      }
    };

    var data = [
      {
        "key": "POSITIVE",
        "color": "#4374A8",
        "values": [
          {
            "label" : "Group A" ,
            "value" : -1.8746444827653
          }
        ]
      }
    ];

    return {
      options: options,
      data: data,
      showData: showData,
      newData: newData
    };
  }

})();