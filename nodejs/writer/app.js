/*
 * message-style+links+reader+writer
 * http connector
 * 2012-09 (mca) : app.js
 *
 * NOTES:
 * - items & queries support GET
 * - templates support POST
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
 *   ],
 *   queries :
 *   [
 *     {href:"...", rel:"..."},
 *     ...
 *     {href:"...", rel:"..."}
 *   ],
 *   template: 
 *   { 
 *     data
 *     [
 *       {name:"...", value:"..."},
 *       ...
 *       {name:"...", value:"..."}
 *     ]
 *   }
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
m.category = '';
m.completeUrl = '/complete';
m.searchUrl = '/search';
m.appJson = {'content-type':'application/json'};
m.textPlain = {'content-type':'text/plain'};
m.host = 'http://localhost:1337';

// add some queries
m.categoryUrl = '/?category=';

// add a write template
m.write = {};

m.write.data = m.data;

// message format
var collection = {};
collection.items = [];
var data = [];

function handler(req, res) {
    var url,inUrl;

    url = '';
    m.id = '';
    m.search = '';
    m.category = '';

    // inspect incoming identifier
    inUrl = req.url.replace(m.host,'');
    if(inUrl.indexOf(m.categoryUrl)!==-1) {
    	url = m.itemUrl;
	m.category = inUrl.substring(m.categoryUrl.length,255).replace('?category=','');
    }
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
   
    // route request
    switch(url) {
    	case m.itemUrl:
	    switch(req.method) {
	        case 'GET':
		    if(m.id!=='') {
		        getItem(req, res, m.id);
		    }
		    if(m.category!=='') {
		        getCategory(req, res, m.category);
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

// return category
function getCategory(req, res, category) {
    var list;
    list = todo('category',category);
    sendResponse(req, res, format(list));
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
    	id = JSON.parse(body).id;
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
  
  // add queries
  var queries = [];
  queries.push({href:m.host+m.searchUrl+'?text={@text}',rel:"search"});
  queries.push({href:m.host+m.categoryUrl+'work',rel:"work"});
  queries.push({href:m.host+m.categoryUrl+'play',rel:"play"});

  // add POST templates
  var templates = [];
  
  var data = [];
  data.push({name:'id',value:''});
  templates.push({href:m.host+m.completeUrl, rel:'complete',data:data});
  
  data =[];
  data.push({name:"title",value:""});
  data.push({name:"category",value:""});
  data.push({name:"assignee",value:""});
  templates.push({href:m.host+m.itemUrl, rel:'additem',data:data});

  // return formatted message
  return {href:m.host+m.itemUrl, items:coll, queries:queries, templates:templates};
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

