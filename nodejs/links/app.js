/*
 * message-style+links http connector
 * 2012-09 (mca) : app.js
 *
* message format:
 * {
 *   href : "...",
 *   items : 
 *   [
 *     {
 *       href : "..."
 *       data : 
 *       [
 *         {name:"...", value:"..."},
 *         ...
 *         {name:"...", value:"..."}
 *       ]
 *     },
 *     ...
 *   ]
 * }
 *
 */ 

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
m.host = 'http://localhost:1337';

// message format
var collection = {};
collection.items = [];
var data = [];

function handler(req, res) {
    var url,inUrl;

    url = '';
    m.id = '';
    m.search = '';

    console.log('\nreq.url='+req.url);
    inUrl = req.url.replace(m.host,'');
    console.log('inUrl='+inUrl);

    // inspect incoming identifier
    if(inUrl.indexOf(m.searchUrl)!==-1) {
        url = m.searchUrl;
	m.search = inUrl.substring(m.searchUrl.length,255).replace('?text=','');
    }
    if(inUrl.indexOf(m.itemId)!==-1) {
        url = m.itemUrl;
	m.id = inUrl.substring(m.itemUrl.length,255).replace(m.itemId,'');
    }
    
    if(url==='') {
        url = inUrl;
    }
   
    console.log('url='+url);

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
    sendResponse(req, res, format(list));
}

// return single item
function getItem(req, res, id) {
    var list;
    list = todo('item',id);
    sendResponse(req, res, format([list]));
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
	sendResponse(req, res, format(list));
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
	sendResponse(req, res, format(list));
    });
}

// return filtered list
function searchItem(req, res, text) {
    list = todo('search',text);
    sendResponse(req, res, format(list));
}

// format the list items
function format(list) {
  var data, coll, i, x;
  
  coll = [];
  for(i=0, x=list.length;i<x;i++) {
    data = [];
   
    /* 
    if(list[i].id) {
      data[0] = {name : 'id', value : list[i].id};
    }
    */
    
    if(list[i].title) {
      data[0] = {name : 'title', value : list[i].title};
    }
    if(list[i].category) {
      data[1] = {name : 'category', value : list[i].category};
    }
    if(list[i].assignee) {
      data[2] = {name : 'assignee', value : list[i].assignee};
    }
    
    coll.push({href:m.host+m.itemUrl+m.itemId+list[i].id,data:data});
  }
  return {href:m.host+m.itemUrl,items:coll};
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

