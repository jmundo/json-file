var json = require('../lib/index.js'); //Require json-file module for json parsing.

var file = json.read('../package.json'); //Reads in json file allowing for parsing.

var name = file.get('name'); //Gets the value associated with the key "name".

console.log(name);