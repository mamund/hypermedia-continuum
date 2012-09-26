/* 2012-09 (mca) : cmd-todo */

var http = require('http');
var m = {};

// URLs
m.listUrl = '/';
m.itemUrl = '/?id=';
m.addUrl = '/';
m.completeUrl = '/complete';
m.searchUrl = '/search?text=';

// body
m.itemBody = {};
m.itemBody.title = '';

// server
m.host = 'localhost';
m.port = 1337;

var cmd = '';
var arg = '';

// handle command
if(process.argv.length<3) {
    console.log('enter a command');
}
else {
    cmd = process.argv[2];
    if(process.argv.length===4) {
       arg = process.argv[3];
    }
    switch(cmd) {
        case 'list':
	case 'l':
	   getList();
	   break;
	case 'item':
	case 'i':
	   getItem();
	   break;
	case 'add':
	case 'a':
	   addItem();
	   break;
	case 'complete':
	case 'c':
	   completeItem();
	   break;
	case 'search':
	case 's':
	   searchItem();
	   break;
	default:
	   console.log('unknown command: '+cmd);
	   break;
    }
}

function getList() {
  makeRequest('GET',m.listUrl);
}

function getItem() {
  makeRequest('GET',m.itemUrl+arg);
}

function addItem() {
  var item = {};
  item.title = arg;
  makeRequest('POST',m.addUrl,JSON.stringify(item));
}

function completeItem() {
  makeRequest('POST',m.completeUrl,arg);
}

function searchItem() {
  makeRequest('GET',m.searchUrl+arg);
}

// make request and handle results
function makeRequest(method, path, msg) {
  var hdrs = {
    'host' : m.host + ':' + m.port,
    'content-type' : 'application/json',
  };
  if(msg) {
    hdrs['content-length']=msg.length;
  } 

  var options = {
    host : m.host,
    port : m.port,
    path : path,
    method : method,
    headers : hdrs
  };
  
  var req = http.request(options, function(res) {
    res.on('data', function(d) {
      process.stdout.write(d);
    });
  });
    
  req.on('error', function(error) {
    console.log(error);
  });

  if(msg) {
    req.write(msg);
  }

  req.end();  
}

// eof

