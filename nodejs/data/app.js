/* data-only server */

var http = require('http');
var todo = require('./todo.js');
var port = (process.env.PORT||1337);

var m = {};
m.id = '';
m.itemUrl = '/';
m.itemId = '?id=';
m.search = '';
m.completeUrl = '/complete';
m.searchUrl = '/search';
m.appJson = {'content-type':'application/json'};
m.textPlain = {'content-type':'text/plain'};

function handler(req, res) {
    var url;

    url = '';
    m.id = '';
    m.search = '';

    // inspect incoming identifier
    if(req.url.indexOf(m.searchUrl)!==-1) {
        url = m.searchUrl;
	m.search = req.url.substring(m.searchUrl.length,255).replace('?text=','');
    }
    if(req.url.indexOf(m.itemId)!==-1) {
        url = m.itemUrl;
	m.id = req.url.substring(m.itemUrl.length,255).replace(m.itemId,'');
    }
    if(url==='') {
        url = req.url;
    }

    console.log(url);

    // route request
    switch(url) {
    	case m.itemUrl:
	    switch(req.method) {
	        case 'GET':
		    if(m.id!=='') {
		        getItem(req, res, m.id);
		    }
		    else {
	                getList(req, res);
		    }
		    break;
		case 'POST':
		    addItem(req, res);
		    break;
		default:
		    sendError(req, res, 405,'Method not allowed1');
		    break;
	    }
	    break;
	case m.completeUrl:
	    switch(req.method) {
	        case 'POST':
		    completeItem(req, res);
		    break;
		default:
		    sendError(req, res, 405,'Method not allowed2');
		    break;
	    }
	    break;
	case m.searchUrl:
	    switch(req.method) {
	        case 'GET':
		    searchItem(req, res, m.search);
		    break;
		default:
		    sendError(req, res, 405,'Method not allowed3');
		    break;

	    }
	    break;
	default:
	    sendError(req, res, 404,'Page not found');
	    break;
    }
}

// return list
function getList(req, res) {
    var list;
    list = todo('list');
    sendResponse(req, res, list);
}

// return single item
function getItem(req, res, id) {
    var list;
    list = todo('item',id);
    sendResponse(req, res, list);
}

// add new item
function addItem(req, res) {
    var body, item, list;

    body = '';
    req.on('data', function(chunk) {
        body += chunk.toString();
    });

    req.on('end', function() {
    	item = JSON.parse(body);
        list = todo('add',item);
	sendResponse(req, res, list);
    });
}
// remove completed item
function completeItem(req, res) {
    var body, id, list;

    body = '';
    req.on('data', function(chunk) {
        body += chunk.toString();
    });

    req.on('end', function() {
    	id = body;
	console.log(body);
	console.log(id);
        list = todo('delete',id);
	sendResponse(req, res, list);
    });
}

// return filtered list
function searchItem(req, res, text) {
    list = todo('search',text);
    sendResponse(req, res, list);
}

// send generic error
function sendError(req, res, code, msg) {
    res.writeHead(code, msg, m.textPlain);
    res.end(msg);
}

// send successful response
function sendResponse(req, res, list) {
    res.writeHead(200,'ok',{'content-type':'application/json'});
    res.end(JSON.stringify(list));
}

// listen for requests
http.createServer(handler).listen(port);

