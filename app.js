/*jshint node:true*/
var express = require('express');
var hackerController = require('./server/hacker/hackerController');
var bodyParser = require('body-parser');
var aggregatorController = require('./server/aggregator/aggregatorController');

// setup middleware
var app = express();
app.use(app.router);
app.use(express.errorHandler());
var routes = {
  dir: __dirname + '/public'
};
app.use(express.static(__dirname)); //setup static public directory

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public')); //setup static public directory
app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views

// render index page
app.get('/', function(req, res){
  res.sendfile(routes.dir + '/index.html');
});

app.get('/search/:term', aggregatorController.aggregate);
app.get('/update', hackerController.gatherSentiments);


// There are many useful environment variables available in process.env.
// VCAP_APPLICATION contains useful information about a deployed application.
var appInfo = JSON.parse(process.env.VCAP_APPLICATION || "{}");
// TODO: Get application information and use it in your app.


// VCAP_SERVICES contains all the credentials of services bound to
// this application. For details of its content, please refer to
// the document or sample of each service.
var services = JSON.parse(process.env.VCAP_SERVICES || "{}");
// TODO: Get service credentials and communicate with bluemix services.

// The IP address of the Cloud Foundry DEA (Droplet Execution Agent) that hosts this application:
var host = (process.env.VCAP_APP_HOST || 'localhost');
// The port on the DEA for communication with the application:
var port = (process.env.VCAP_APP_PORT || 3000);
// Start server
app.listen(port, host);
console.log('App started on port ' + port);

