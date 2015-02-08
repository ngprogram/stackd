(function() {

  var app = angular.module('stackdApp', ['nvd3']);

  app.controller('SearchController', ['$http', '$scope', 'ChartFactory', function($http, $scope, ChartFactory) {
    var vm = this;
    this.searchTerm = '';
    this.incomingData = {};
    this.search = function(val) {
      $http.get('/search/' + val)
      .success(function(data, status) {
        vm.incomingData = data;
        console.log('success');
        console.log(vm.incomingData.avg);
        ChartFactory.data[0].values[0].value = vm.incomingData.avg * 100;
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

    var options = {
      chart: {
        type: 'discreteBarChart',
        height: 450,
        margin : {
          top: 20,
          right: 20,
          bottom: 60,
          left: 55
        },
        x: function(d){return d.label;},
        y: function(d){return d.value;},
        showValues: true,
        valueFormat: function(d){
          return d3.format(',.4f')(d);
        },
        transitionDuration: 500,
        xAxis: {
          axisLabel: 'X Axis'
        },
        yAxis: {
          axisLabel: 'Y Axis',
          axisLabelDistance: 30
        },
        showXAxis: false,
        showYAxis: false,
        tooltips: false,
        yAxisRange: [0,100],
        forceY: [0,100]
      }
    };

    var data = [
      {
        key: "Cumulative Return",
        values: [
          {
            "label" : "Label" ,
            "value" : 10
          }
        ]
      }
    ];

    return {
      options: options,
      data: data
    }; 
  }

})();
