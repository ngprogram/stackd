var express = require('express');
var bodyParser = require('body-parser');
var aggregatorController = require('./aggregator/aggregatorController');
var config = require('config');

var mongoose = require('mongoose');

mongoose.connect(config.get('mongo'));

var app = express();
app.use(express.errorHandler());
app.use(bodyParser.json());

app.use(express.static(__dirname + '/../public')); //setup static public directory

app.get('/search/:term', aggregatorController.aggregate);

var port = (process.env.PORT || config.get('port'));

app.listen(port);

