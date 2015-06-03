'use strict';

var fs = require('fs'),
    xml2js = require('xml2js'),
    EditorDetector = require('./editor_detector'),
    editors = require('./editors'),
    types = require('../types');

exports.createParser = function createParser(file, databaseTypeName) {
  var root = getRootElement(readFileContent(file));
  var detectedEditor = EditorDetector.detect(root);
  var types = initDatabaseTypeHolder(databaseTypeName);
  return new editors.Parsers[detectedEditor](root, types);
};

function readFileContent(file) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    throw new WrongPassedArgumentException(
      "The passed file '"
      + file
      + "' must exist and must not be a directory, exiting now.'");
  }
  return fs.readFileSync(file, 'utf-8');
}

function getRootElement(content) {
  var root;
  var parser = new xml2js.Parser(); // as an option: {explicitArray : false}
  var result = parser.parseString(content, function (err, result) {
    if (result.hasOwnProperty('uml:Model')) {
      root = result['uml:Model'];
    } else if (result.hasOwnProperty('xmi:XMI')) {
      root = result['xmi:XMI'];
    } else { // TODO: find the root, if there is one at all.
      throw new NoRootElementException(
        'The passed document has no immediate root element,'
        + ' exiting now.');
    }
  });
  return root;
}

function initDatabaseTypeHolder(databaseTypeName) {
  switch (databaseTypeName) {
    case 'sql':
      return new types.SQLTypes();
    case 'mongodb':
      return new types.MongoDBTypes();
    case 'cassandra':
      return new types.CassandraTypes();
    default:
      throw new WrongDatabaseTypeException(
        'The passed database type is incorrect. '
        + "Must either be 'sql', 'mongodb', or 'cassandra'. Got '"
        + databaseTypeName
        + "', exiting now.");
  }
}

function WrongDatabaseTypeException(message) {
  this.name = 'WrongDatabaseTypeException';
  this.message = (message || '');
}
WrongDatabaseTypeException.prototype = new Error();

function WrongPassedArgumentException(message) {
  this.name = 'WrongPassedArgumentException';
  this.message = (message || '');
}
WrongPassedArgumentException.prototype = new Error();

function NoRootElementException(message) {
  this.name = 'NoRootElementException';
  this.message = (message || '');
}
NoRootElementException.prototype = new Error();
