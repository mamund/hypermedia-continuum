/*
 * message-style+links+reader+writer
 * http client
 * 2012-09 (mca) : cmd-todo.js
 */

var prompt = require('prompt');
var fs = require('fs');
var http = require('http');
var m = {};

// starting URL & instructions
m.listUrl = '/';
m.queries = [];
m.templates = [];

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
	   postItem('additem');
	   break;
	case 'complete':
	case 'c':
	   postItem('complete');
	   break;
	case 'query':
	case 'q':
	   queryList();
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

// execute any query
function queryList() {
  var tmp, url;

  tmp = getInstructions(m.arg1);
  if(tmp!==null) {
    url = tmp.href;
    if(m.arg2) {
      url = tmp.href.replace('{@text}',m.arg2);
    }
  }
  console.log(url);
  makeRequest('GET',url);
}

// execute any update
function postItem(rel) {
  var tmp, url, inputs;

  inputs = [];
  tmp = getInstructions(rel);
  if(tmp) {
    url = tmp.href;
    // pull prompts from instructions
    for(i=0,x=tmp.data.length;i<x;i++) {
    	inputs.push(tmp.data[i].name);
    }
    // get user input and write
    prompt.start();
    prompt.get(inputs, function(err, values) {
      if(err) throw err;
      makeRequest('POST',url,JSON.stringify(values));
    });
  }
}

// pull saved instructions and return item
function getInstructions(name) {
  
  data = fs.readFileSync('./templates.json');
  m.templates = JSON.parse(data);
  
  data = fs.readFileSync('./queries.json');
  m.queries = JSON.parse(data);

  return processInstructions(name);
}
function processInstructions(name) {
  var rtn, i, x;

  rtn = null;
  for(i=0,x=m.templates.length;i<x;i++) {
    if(m.templates[i].rel===name) {
      rtn = m.templates[i];
      break;
    }
  }

  if(rtn===null) {
    for(i=0,x=m.queries.length;i<x;i++) {
      if(m.queries[i].rel===name) {
        rtn = m.queries[i];
	break;
      }
    }
  }
  return rtn;
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
      
      console.log('ITEMS:');
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

      console.log('\nQUERIES:');
      for(i=0,x=coll.queries.length;i<x;i++) {
	line = '';
	line += coll.queries[i].href +':';
	line += coll.queries[i].rel;
	console.log(line);      
      }
      
      console.log('\nTEMPLATES:');
      for(i=0,x=coll.templates.length;i<x;i++) {
      	line = '';
	line += coll.templates[i].href + ':';
	line += coll.templates[i].rel;
	console.log(line);
      }

      // save details for later use
      saveInstructions(coll.queries, coll.templates);
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

// save instructions for later use
function saveInstructions(queries, templates) {
  
  fs.writeFile('./queries.json', JSON.stringify(queries), function (err) {
    if (err) throw err;
  });

  fs.writeFile('./templates.json', JSON.stringify(templates), function (err) {
    if (err) throw err;
  });
}
// eof

