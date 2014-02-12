var express = require('express');
var http = require('http');
var app = express();
var format = require('util').format;

app.set('port', 3000);
app.use(app.router);

// use a ? to denote an optional param
app.get('/:first/:last?', function(req, res){
	var str = format('Hello %s %s', req.params.first, req.params.last || '');
	res.end(str);
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
