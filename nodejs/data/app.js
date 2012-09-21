/* data-only server */

var http = require('http');
var todo = require('./todo.js');
var port = (process.env.PORT||1337);

function handler(req, res) {
    var list, item;
    
    item = {};
    item.title = 'this is a test';
    item.done = false;

    list = todo('search','be');
    sendResponse(req, res, list);
}

function sendResponse(req, res, list) {
    res.writeHead(200,'ok',{'content-type':'application/json'});
    res.end(JSON.stringify(list));
}

http.createServer(handler).listen(port);

