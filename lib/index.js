
var fs    = require('fs'); //Requires the fs module in order to read local json files.
var path  = require('path'); //Requires the path module in order to clean file paths for processing.

/**
 * @exports
 * Constructs an object from a JSON file.
 * @param {string} filePath - Path to the JSON file.
 */
var File = exports.File = function(filePath) {
	this.indent  = null;
	this.data    = void(0);
	this.path    = path.normalize(filePath); //Cleans filePath
};

/**
 * @exports
 * Reads a JSON file and allows for content to be parsed after
 * @param {string} filePath - Path to the JSON file
 * @param {File~fileCallback} callback - Callback allows for the file read to be parsed and modified.
 * @returns {Object} JSON file as an object.
 */
exports.read = function(filePath, callback) {
	var file = new File(filePath);
	if (callback) {
		file.read(callback); //reads file async
	} else {
		file.readSync(); //reads file sync
	}
	return file;
};

// ------------------------------------------------------------------
//  File I/O

/**
 * Reads the JSON file
 * @param {File~fileCallback} callback - Callback allows for the file read to be parsed and modified.
 */
File.prototype.read = function(callback) {
	fs.readFile(this.path, 'utf8', this._afterRead.bind(this, callback));
};

/**
 * @protected
 * Called after the file is read. Passes data onto the _processJson private function for further processing.
 * @param {File~fileCallback} callback - Callback allows for the file read to be parsed and modified.
 * @param {Object} err - allows for an error to be passed in if file could not be read.
 * @param {Object} json - JSON object that was read.
 * @returns {Object} error from reading.
 */
File.prototype._afterRead = function(callback, err, json) {
	if (err) {
		return callback(err);
	}
	this._processJson(json);
	callback();
};

/**
 * Reads the JSON file synchronously
 * @param {File~fileCallback} callback - Callback allows for the file read to be parsed and modified.
 */
File.prototype.readSync = function(callback) {
	this._processJson(
		fs.readFileSync(this.path, 'utf8')
	);
};

/**
 * @protected
 * Parses the JSON string into a JSON object and sets the global file objects data field.
 * Also determines the whitespace used in the file and sets the global file objects indent field.
 * @param {string} json - JSON string that was read from _afterRead private function.
 */
File.prototype._processJson = function(json) {
	this.data = JSON.parse(json);
	this.indent = determineWhitespace(json);
};

/**
 * Writes new content using the .set method to the file.
 * @param {File~fileCallback} callback - JSON file has been updated.
 * @param {Object/Array} replacer - can be used to filter results in an additional function.
 * @param {string/number} space - Inserts white space into the output JSON for readability.
 */
File.prototype.write = function(callback, replacer, space) {
	var space = space || this.indent,
		json = JSON.stringify(this.data, replacer, space);
	fs.writeFile(this.path, json, callback);
};

/**
 * Writes new content using the .set method to the file synchronously.
 * @param {Object/Array} replacer - can be used to filter results in an additional function.
 * @param {string/number} space - Inserts white space into the output JSON for readability.
 */
File.prototype.writeSync = function(replacer, space) {
	var space = space || this.indent,
		json = JSON.stringify(this.data, replacer, space);
	fs.writeFileSync(this.path, json);
};

// ------------------------------------------------------------------
//  Property editing

/**
 * Gets the requested value from a json object given a key.
 * @param {string/Object} key - Requested key in the json object
 * @returns {string/Object} value for the given key
 */
File.prototype.get = function(key) {
	return this._resolve(key, function(scope, key, value) {
		return value;
	});
};

/**
 * Sets a new value in a json object at the desired key.
 * @param {string/Object} key - key to set.
 * @param {string/Object} value - value to set.
 * @returns {Object} new json object.
 */
File.prototype.set = function(key, value) {
	this._resolve(key, function(scope, key) {
		scope[key] = value;
	});
	return this;
};

// 
/**
 * @protected
 * Resolves a value and key from the global JSON object. Has a callback, but is NOT async.
 * @param {string/Object} key - key used to resolve the value.
 * @param {File~fileCallback} callback - Callback gives back the resolved JSON object.
 * @returns {Object} with parameters of the object and associated key and value.
 */
File.prototype._resolve = function(key, callback) {
	var current = this.data;
	var keys = key.split('.');
	key = keys.pop();

	//Loops through each key and sets the current data to the value of that key.
	keys.forEach(function(key) {
		current = current[key];
	});
	return callback(current, key, current[key]);
};

// ------------------------------------------------------------------

var findWhitespace = /^(\s+)/;
function determineWhitespace(contents) {
	var whitespace = 0;
	contents = contents.split('\n');
	for (var i = 0, c = contents.length; i < c; i++) {
		var match = findWhitespace.exec(contents);
		if (match && typeof match[1] === 'string') {
			if (match[1][0] === '\t') {
				whitespace = '\t';
				break;
			} else if (match[1].length < whitespace || ! whitespace) {
				whitespace = match[1].length;
			}
		}
	}
}

