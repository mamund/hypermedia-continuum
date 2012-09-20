/* todo.js - simple read/write module */

var fs = require('fs');
var folder = './data/';

module.exports = main;

function main(action, arg1, arg2) {
    var rtn;

    switch(action) {
        case 'list':
            rtn = getList();
            break;
        case 'item':
            rtn = getItem(arg1);
            break;
        case 'add':
            rtn = addItem(arg1);
            break;
        case 'update':
            rtn = updateItem(arg1, arg2);
            break;
        case 'delete':
            rtn = deleteItem(arg1);
            break;
        case 'search':
            rtn = getList(arg1);
            break;
        default:
            break;
    }
    return rtn;
}

function getList(arg) {
    var collection, item, list, i, x;

    collection = [];
    list = fs.readdirSync(folder);
    for(i=0,x=list.length;i<x;i++) {
        item = JSON.parse(fs.readfileSync(folder,list[i]));
        if(arg) {
            if(item.title.substring(arg)>-1) {
                collection.push(item);
            }
        }
        else {
            collection.push(item);
        }
    }
    return collection;
}

function getItem(id) {
    return JSON.parse(fs.readfileSync(folder+id));
}

function addItem(item) {
    fs.writeFileSync(folder+makeId(), JSON.stringify(item));
    return getList();
}

function updateItem(id, item) {
    fs.writeFileSync(folder+id, JSON.stringify(item));
    return getList();
}

function deleteItem(id) {
    fs.unlinkSync(folder+id);
    return getList();
}

function makeId() {
    var tmp, rtn;

    tmp = Math.random();
    rtn = String(tmp);
    rtn = rtn.substring(2);
    return rtn;
}
/* eof */

