/*
 * message-style http client
 * 2012-09 (mca) : cmd-todo.js
 */

var http = require('http');
var m = {};

// read URLs
m.listUrl = '/';

// write URLs
m.addUrl = '/';
m.completeUrl = '/complete';

// query URLs
m.searchUrl = '/search?text=';

// write body
var itemBody = {title:'',category:'',assignee:''};

// server
m.host = 'localhost';
m.port = 1337;

// commands
m.cmd = '';
m.arg1 = '';
m.arg2 = '';
m.arg3 = '';

// handle command
if(process.argv.length<3) {
    console.log('enter a command');
}
else {
    // pull in args
    m.cmd = process.argv[2];
    m.arg1 = (process.argv[3]?process.argv[3]:'');
    m.arg2 = (process.argv[4]?process.argv[4]:'');
    m.arg3 = (process.argv[5]?process.argv[5]:'');
   
    // dispatch request
    switch(m.cmd) {
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
	   console.log('unknown command: '+m.cmd);
	   break;
    }
}

function getList() {
  makeRequest('GET',m.listUrl);
}

function getItem() {
  makeRequest('GET',m.arg1);
}

function addItem() {
  itemBody.title = m.arg1;
  itemBody.category = m.arg2;
  itemBody.assignee = m.arg3;
  makeRequest('POST',m.addUrl,JSON.stringify(itemBody));
}

function completeItem() {
  makeRequest('POST',m.completeUrl,m.arg1);
}

function searchItem() {
  makeRequest('GET',m.searchUrl+m.arg1);
}

// make request and display results
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
    var body, coll, i, x, line;
    
    body = '';
    res.on('data', function(d) {
      body += d;
    });

    res.on('end', function() {
      coll = JSON.parse(body);
      for(i=0,x=coll.items.length;i<x;i++) {
	line = '';
	for(j=0,y=coll.items[i].data.length;j<y;j++) {
	  if(j===0) {
            line += coll.items[i].href+', ';
	  }
	  else {
	    line += ', '
	  }
	  line += coll.items[i].data[j].value;
	}
	console.log(line);
      }
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

