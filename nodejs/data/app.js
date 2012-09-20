/* data-only server */

var http = require('http');
var fs = require('fs');
var querystring = require('querystring');

var port = (process.env.PORT||1337);

function handler(req, res) {
    res.writeHead(200);
    res.end('handler');
}

http.createServer(handler).listen(port);

