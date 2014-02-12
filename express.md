## Express

Express is the most prolific Node based http framework. Express builds on connect, a middleware library for the Node native `http` module. Express adds handle middleware in by default and provides the user with an `http` router. Express has dozens of community built middleware that accomplish many common web development tasks. Express is made to be lightweight, having only the functionality required to route requests into your Node app. Express does not have a notion of 'models' or really even 'controllers'. Express is just a routing layer for your application. Do whatever you want beyond that! 

## What we'll cover

* How to install express
* Cover the express API
* Learn about middleware
* Use express convenience methods
* Route traffic
* Write middleware

## Installing

Express is in the npm registry as `express`. You install it just like any other npm module. You can install express globally with npm to use it as a command line tool. Express has handy functionality to initialize a project for you. The express command line tool will scaffold your application and get you running immediately. You can actually run the `app.js` file that the initialization tool gives you. You can of course setup express on your own. By default, the command line tool gives you the following to begin with.

```
$ express init
```
Yeilds:

```
-rw-r--r--  1 tjkrusinski  881 Jan 27 14:06 app.js
-rw-r--r--  1 tjkrusinski  185 Jan 27 14:06 package.json
drwxr-xr-x  5 tjkrusinski  170 Jan 27 14:06 public
drwxr-xr-x  4 tjkrusinski  136 Jan 27 14:06 routes
drwxr-xr-x  4 tjkrusinski  136 Jan 27 14:06 views
```
If we look at `app.js` we'll see:

```
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
```

We can tell by looking at the directory tree and how express wrote `app.js` for us that it is a bit opinionated. Most folks do the following at least, create a `public` directory, and a views `directory`. We'll take a look at what else is going on in a bit.

## Express API

### `get()` and `set()`

Express has a simple way to store state of key/value pairs with `express.get()` and `express.set()`. These methods are useful for things like the port that express listens on, the environment variable for and anything else you would like to store in a key/value format. The nice thing about `set()` is that whatever you set with it is reflected in your view engine of choice. If the view engine supports express, the variables with be in the global name space. This is great if you deploy static assets, images, javascript files, css files, to a CDN for production but server them locally during development. Setting the location of these files in your express config is easy with `set()`.

## Middleware

Middleware are a [connect](http://www.senchalabs.org/connect/) construct that allow us to encapsulate server side functionality in a concise manner. If you come from Rails or other MVC frameworks, you are likely familiar with controllers and models. With express, middleware functions are typically referred to as controllers. These functions have a 3 argument signature, the first is the http request object, the second, the http response object and the last, which is optional, a function. The last function argument is typically named `next` in express applications. You can call `next` when you are done inside of the current middleware to pass execution context to the next middleware. Essentially `next` is a callback. Let's take a look at some acceptable middleware.

```
/**
 *	Get a user from our user model
 *	@method getUser
 *
 *	@param {Object} req
 *	@param {Object} res
 *	@param {Function} next
 */
function getUser (req, res, next) {
	var user = req.params.userId;
	
	users.get(user, function(err, data){
		if (err) return next(err);
		res.locals.user = data;
		next();
	});
};

/**
 *	Render the user view
 *	@method render
 *
 *	@param {Object} req
 *	@param {Object} res
 */
function render (req, res) {
	res.render('user');
};

```

Using middleware for separation of concern is great. You can create middleware that do one thing and chain many of them for one route. There is not limit to how many express will let you pass in but there is a practical balance of functionality and expressiveness. What is important when creating your middleware is that they should be as independent as possible. In other words, a middleware should not be completely dependent on another middleware in order for it to run properly. This quickly leads into debate about application state, however, keeping as much dependent state from middleware to middleware is good practice.

It's important to understand middleware since after you set up your express app, building middleware will consume most of your development time.

## Routing

Routing is an essential part of any http framework and is rather pleasent in express. Defining routes is done by calling one a few methods on the app instance. As you would likely exprect, these methods are `get()`, `post()`, `patch()`, `put()`, `delete()` and if you want all http verbs, `all()`. To handle `HEAD` requests, express will run the route as if it were at `GET` request, but will not send a body in the response.

```
app.get('/?', controller1, controller2, function(req, res){
	res.render('index');
});

app.post('/contactus?', contactController, function(req, res){
	res.redirect('/aboutus');
});

app.put('/user?', createUser, function(req, res){
	res.redirect('/welcome');
});

```

Each routing function takes at least 2 arguments. The first is either a string or a regular expression. Express will make sense of a string passed to the function and make a regular expression out of it, we'll take a look at this later. The second and remaining n arguments are middleware functions. It is important to know that the order in which you create routes is the order in which express will begin to try and match the incoming http request url against the routes you have specified.

### Route matching

Understanding that each route definition is really calling a function and storing the route and middlware inside the express application, express routes traffic based off the pattern urls you supply. When an http request comes into your application, express loops over the routes you have specified *in order* and stops the loop after it finds the first matching route. This means if you define two routes with the same pattern twice, only the first definition will ever be called, even if the middleware are different. Imagine express holding an internal list of all the routes you have provided. Let's look at how express translates strings into middleware.

With route parameters you can specify variable parts of a uri. These parameters can be unique ids, user names, emails, etc. Parameters are identified by uri segments (`/` character). You can have any number of uri parameters in your routes. You can then access these parameters in your middleware at `request.params`. There is also `request.query` for accessing querystring parameters however, these parameters do not influence routing requests. uri parameters are denoted by a colon and end at the next `/` character, a `?` or the end of the specified uri. Express will automatically decode url encoded entities in request uris. For instance `%20` will be replaced with the ` ` character. Let's take a look at how to work with uri parameters.

```
// this route will require the `email` parameter
app.get('/account/:email', printEmail);

// middleware responds with the specified email
function printEmail (req, res) {
	var email = req.params.email;
	res.end(email);
};

// handle two parameters
app.post('/account/:id/:name', updateAccount);

// middleware to update account
function updateAccount (req, res) {
	var id = req.params.id,
		name = req.params.name;
	
	db.updateAccount(id, name, req.body, function(err, data){
		// do some error handling
		res.json(200, data);
	});
};

// get a user or all users
// the question mark makes the parameter optional
app.get('/users/:id?', getUsers);

// middleware to get user or users
function getUsers (req, res, next) {
	var user = req.params.id || '*';

	db.getUsers(user, function(err, data){
		// do some logic
		res.json(200, data);
	});
};
```

## Request object

Express adds some helpful functions and parameters to the request object.

### `req.params`

`req.params` contains the parameters you've specified in the routes. Note that `req.params` is actually an array.

```
app.get('/user/:name', handler);

// GET /user/tj
req.params.name;
// => "tj"
```

### `req.query`

This is an object, containing the parsed querystring. 

```
// GET /users?name=tj
req.query.name;
// => tj
```

### `req.param()`

Calling `req.param()` with a key name is a useful tool, but may not be recommended. `req.param()` will take the single string argument and look for that key on `req.params`, `req.body` and `req.query` in that order. Since you do not know what object the value was returned from it is harder to debug issues with `req.param()` and you incurr the added debt of having the application look for the value on those three objects. 

```
var name = req.param('name');
console.log(name);
// => "TJ Krusinski"

req.params.name || req.body.name || req.query.name;
```

### `req.body`

`req.body` contains the parsed request body. You do not need to listen for `data` events with express like you would with the bare http server. This is if you are using the `express.bodyParser()` middleware. `req.body` defaults to an empty object `{}` if no body is received. If the body non `utf-8` data, you cannot access properties on it.

```
var data = req.body;
console.log(typeof data);
// => "object"

```

### `req.files`

When handling multipart uploads from the browser, you can access each file by file file name. If you uploaded a file called `edge.png` it would be on the `files` object at `files['edge.png']`. Express writes files to a `tmp` directory in the home directory of the system user that owns the node process. Regardless of the user, the file object returned by express contains the `path` property that instructs you to the locatin of the file. 

```
{
	size: 74643,
	path: '/tmp/8ef9c52abe857867fd0a4e9a819d1876',
	name: 'edge.png',
	type: 'image/png',
	hash: false,
	lastModifiedDate: Thu Aug 09 2012 20:07:51 GMT-0700 (PDT),
	_writeStream: {
		path: '/tmp/8ef9c52abe857867fd0a4e9a819d1876',
		fd: 13,
		writable: false,
		flags: 'w',
		encoding: 'binary',
		mode: 438,
		bytesWritten: 74643,
		busy: false,
		_queue: [],
		_open: [Function],
		drainable: true
	},
	length: [Getter],
	filename: [Getter],
	mime: [Getter]
}
```

The internal `bodyParser()` middleware uses the [node-formidable]() module to handle incoming requests. You can specifiy options to the module in your app definition. 

```
app.use(express.bodyParser({
    keepExtensions: true,
    uploadDir: '/my/files'
}));
```

This instructs node-formidable to keep the file extensions and place the files in `/my/files`.

### `req.cookies`

If you are using the `express.cookieParser()` middleware, cookies are available at `req.cookies.cookieName`.

```
req.cookies['cookieName'];
// => "cookieValue"

```

### `req.get()`

`req.get()` gets HTTP headers from the incoming request by key name.

```
req.get('content-type');
// => "text/plain"

req.get('content-length');
// => 78352
```

### `req.is()`

Check the request 'content-type'.

```
// With Content-Type: text/html; charset=utf-8
req.is('html');
req.is('text/html');
req.is('text/*');
// => true
```

### `req.ips`

`req.ips` is an array of the chain of ip addresses from proxies and the remote client. `x-forwarded-for` is typically a list of ip address created by proxies inline of your application and the client. Load balancers and other http proxies will append to this list as they handle requests from downstream. The ip addresses in the array are in order from client to most recent proxy. This functionality is only enabled when you have `"trust proxy"` enabled on your application.

### `req.host`

The hostname from the request. Useful for security! Note the port number is removed from the http header.

```
// Host: "example.com:3000"
req.host
// => "example.com"
```

### `req.subdomains`

An array of the subdomains from the host in order.

```
// Host: "tobi.ferrets.example.com"
req.subdomains
// => ["ferrets", "tobi"]
```

### `req.xhr`

A boolean value if the http request came from `XMLHttpRequest` in the browser.

```
req.xhr;
// => Boolean
```

### `req.acceptedLanguages`

An array of the acceptable languages.

```
Accept-Language: en;q=.5, en-us
// => ['en-us', 'en']
```

### `req.acceptsLanguage(lang)`

Check if the given lang are acceptable.

```
Accept-Language: en;q=.5, en-us
req.acceptsLanguage('en');
// => true
```

## Response Object

Like the request object the response object has many properties and methods that make working with outgoing http responses a bit easier. You can access the standard http methods and properties just as you would if you were not working with express. 

### `res.status()`

Set the http response code and return the http response object.

```
res.status(200).end('hello world');
```

### `res.set(field, value)`

Set a response header. The field value is case-insensitive.

```
res.set('content-type', 'text/html');
```

### `res.cookie(name, value [, options])`

Set cookie `name` to `value` and then specify some cookie parameters.

```
res.cookie('foo', 'bar', {
	path: '/',
	domain: '.foo.com',
	secure: true,
});
```
Internally express will set the options to the correct cookie appropriate `;` sepereated segments.  

### `res.clearCookie(name)`

You can clear a cookie from a client with the `clearCookie` method. Internally express is setting an expires date in the past, which tells clients the cookie should no longer be used.

```
res.clearCookie('foo');
```

### `res.redirect([status], url)`

Send a redirect header to the client, optionally with an http status. The default is `302 Found`.

```
res.redirect(304, 'http://www.foo.com/bar');
res.redirect('http://www.foo.com/bar');
res.redirect('/foo/bar');
```

If you do not specifiy a different domain, express will redirect to the current domain.


### `res.send()`

`res.send` is a convience method for ending a response. You can specify a status code as the first argument or not. You can also pass in any type of object and `send()` will try an understand it and set the appropriate `content-type` and `content-length` headers.

```
res.send(200, 'T
```

### `res.json()`

A handy method to send `JSON` encoded data to the client is with the `json()` method. Like `send()` you can specify an HTTP status code as the first optional argument, and a JavaScript object as the latter argument. Internally express will set the `content-type` and `content-length` headers for you.

```
res.json(200, {
	foo: 'bar'
})
```

### `res.jsonp()`

You can send a `jsonp` response to the client with the `jsonp()` method. `jsonp()` works just like `json()` except it wraps the `JSON` data in a callback. The default method name for the `jsonp` data is determined by the `callback` parameter on the request query string. If it is not set, express will look for `jsonp callback name` in your express settings. This tells express what to look for in the query string of the request to use as the callback function name.

```
// ?callback=foo
res.jsonp({ user: 'tobi' })
// => foo({ "user": "tobi" })

app.set('jsonp callback name', 'cb');

// ?cb=foo
res.jsonp(500, { error: 'message' })
// => foo({ "error": "message" })
```

### `res.type()`

If you care to set your own `content-type` header, you can use `type()` to look up a mime type of a file extension or match a type specified.

```
res.type('.html');
res.type('html');
res.type('json');
res.type('application/json');
res.type('png');
```

### `res.attachment([filename])`

If you want to send a response to a browser instructing it to save a file, you can use the `attachment()` method. This is handy since no one ever remembers the correct header names to do it.

```
res.attachment();
// Content-Disposition: attachment

res.attachment('path/to/logo.png');
// Content-Disposition: attachment; filename="logo.png"
// Content-Type: image/png
```

### `res.sendfile(path, [options], [fn]])`

`sendfile()` is often very useful when you need to call out a specific route to serve a file. While you can instruct express to server whole directories as static content in your application settings, there are instances when you would want to send a single file. It's important to understand that the `maxAge` header defaults to `0` when using this method. So if you want items to cache in browsers, be sure to pass the optional `options` object and set the `maxAge` key. You can pass a callback function as the last argument in this method to get information about the success of the function. The callback is called when the operation is complete or when there was an error and it was unable to complete. The first argument is a `Boolean` error.

```
res.sendfile('/path/to/file.html', {
	maxAge: 60 * 60 * 24 * 14
});

res.sendfile('/path/to/file.html', {
	maxAge: 60 * 60 * 24 * 14
}, function(err){
	if (err) throw err;
});

```

### `res.locals`

The `locals` object is typically used to store state during the life of a `request` `response` cycle. Attach data to `locals` and it will later show up in your view scope. This is joined with the `app.locals` object (which you alter with `app.set()` method) to give context to the views when you render them.

### `res.render(view, [locals, ][callback])`

`render()` does many things. Primarily it renders the view specified with the view engine you have specified in your application settings. It also, when passed a callback, return a `Boolean` error and the full html that was rendered from the view. If not passed a callback it will render `app.locals`, `res.locals` and the `locals` object optionally passed into the view, then set the appropriate headers and end the request. Keep in mind that the `view` parameter is the filename of the view, not the view string itself.

```
res.render('file', locals);

res.render('file', locals, function(err, html){
	// handle error and work with html
});

```

## CLI

Express has a useful cli to stub out your application. The command is `express` and it takes a few arguments. You can use the `-h` flag to see options when creating an express application.

```
$ express -h

  Usage: express [options] [dir]

  Options:

    -h, --help          output usage information
    -V, --version       output the version number
    -s, --sessions      add session support
    -e, --ejs           add ejs engine support (defaults to jade)
    -J, --jshtml        add jshtml engine support (defaults to jade)
    -H, --hogan         add hogan.js engine support
    -c, --css <engine>  add stylesheet <engine> support (less|stylus) (defaults to plain css)
    -f, --force         force on non-empty directory

```

The basic use of `express` is `$ express project` where `project` indicates the name of the directory that express will create and place the project inside of. The `express` command is very useful to stub out a project and get moving with it immediately. The options shown above can add functionality to your application. The options are pretty basic but are useful nonetheless.



