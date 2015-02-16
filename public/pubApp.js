(function() {

  var app = angular.module('stackdApp', ['nvd3']);

  app.controller('SearchController', ['$http', '$scope', 'ChartFactory', function($http, $scope, ChartFactory) {
    var vm = this;
    $scope.searchTerm = '';
    this.incomingData = {};
    this.showData = ChartFactory.showData;
    this.newData = ChartFactory.newData;
    this.search = function(val) {
      $http.get('/search/' + val)
      .success(function(data, status) {
        console.log('qwer',data,status);
        vm.incomingData = data;
        ChartFactory.newData = data;
        vm.newData = data;
        console.log('hihi',ChartFactory.newData);
        console.log('hoho', vm.newData);
        console.log('success');
        $scope.searchTerm = '';

        // console.log(1234,vm.incomingData.avg);
        vm.showData = true;
        ChartFactory.data[0].values[0].value = Math.round((vm.incomingData.avg * 100) * 100) / 100;
        if (vm.incomingData.avg < 0) {
          ChartFactory.data[0].color = '#CF7273';
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

    // {
    //   chart: {
    //     type: 'discreteBarChart',
    //     height: 450,
    //     margin : {
    //       top: 20,
    //       right: 20,
    //       bottom: 60,
    //       left: 55
    //     },
    //     x: function(d){return d.label;},
    //     y: function(d){return d.value;},
    //     showValues: true,
    //     valueFormat: function(d){
    //       return d3.format(',.4f')(d);
    //     },
    //     transitionDuration: 500,
    //     xAxis: {
    //       axisLabel: 'X Axis'
    //     },
    //     yAxis: {
    //       axisLabel: 'Y Axis',
    //       axisLabelDistance: 30
    //     },
    //     showXAxis: false,
    //     showYAxis: false,
    //     tooltips: false,
    //     yAxisRange: [-100,100],
    //     forceY: [0,100]
    //   }
    // };

    var data = [
      {
        "key": "POSITIVE",
        "color": "#728CCF",
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

