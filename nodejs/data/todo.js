/* todo.js - simple read/write module */

var fs = require('fs');
var folder = process.cwd()+'/data/';

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
    var coll, item, list, i, x;

    coll = [];
    list = fs.readdirSync(folder);
    for(i=0,x=list.length;i<x;i++) {
        item = JSON.parse(fs.readFileSync(folder+list[i]));
        if(arg) {
            if(item.title.indexOf(arg)!=-1) {
                coll.push(item);
            }
        }
        else {
            coll.push(item);
        }
    }
    return coll;
}

function getItem(id) {
    return JSON.parse(fs.readFileSync(folder+id));
}

function addItem(item) {
    item.id = makeId();
    fs.writeFileSync(folder+item.id, JSON.stringify(item));
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

