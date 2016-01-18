var json = require('../lib/index.js'); //Require json-file module for json parsing.

var file = json.read('../package.json'); //Reads in json file allowing for parsing.

file.read(function() {
    var name = file.get('name'); //Gets the current name of the file.
    console.log(name);
    name = file.set('name', 'updated name').get('name'); //Sets a new name and returns that new name. Chaining of get and set functions allowed.
    console.log(name);
});