var express = require('express');
var http = require('http');
var request = require('request');
var app = express();
var path = require('path');
var format = require('util').format;

app.set('port', 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(app.router);

// pass our getStatus method
app.get('/*', getStatus, function(req, res){
	res.render('status');
});

function getStatus(req, res, next) {
	request('https://status.github.com/api/status.json', function(err, resp, data){
		if (err) return res.end(503, 'There was trouble with the api call');
		data = JSON.parse(data);
		res.locals.status = data.status;
		next();
	});
};

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
