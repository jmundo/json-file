var json = require('../lib/index.js'); //Require json-file module for json parsing.

var file = json.read('../package.json'); //Reads in json file allowing for parsing.

file.read(function() {
    file.set('name', 'updated name'); //Sets a new value for the name key.
    console.log(file.get('name'));
});