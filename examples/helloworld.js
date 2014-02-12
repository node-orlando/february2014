var express = require('express');
var http = require('http');
var app = express();

app.set('port', 3000);
app.use(app.router);

app.get('/*', function(req, res){
	res.end('hello world');
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
