'use strict';

var fs = require('fs'),
    xml2js = require('xml2js'),
    EditorDetector = require('./editor_detector'),
    editors = require('./editors'),
    types = require('../types');

/**
 * Creates a parser.
 * @param file {string} the XMI file's name.
 * @param databaseTypeName {string} the database type's name (sql, mongoDB, etc.).
 * @return {Parser} the created parser.
 * @throws WrongPassedArgumentException if the input file doesn't exist, or is
 *                                      a folder.
 * @throws NoRootElementException if the passed file doesn't have a root element.
 * @throws WrongDatabaseTypeException if the passed type isn't supported.
 */
exports.createParser = function(file, databaseTypeName) {
  if(endsWith(file, ".jh")){
    var types = initDatabaseTypeHolder(databaseTypeName);
    return new editors.Parsers["dsl"](file, types);
  }else{
    var root = getRootElement(readFileContent(file));
    var detectedEditor = EditorDetector.detect(root);
    var types = initDatabaseTypeHolder(databaseTypeName);
    return new editors.Parsers[detectedEditor](root, types);
  }
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
  var parser = new xml2js.Parser();
  parser.parseString(content, function (err, result) {
    if (result.hasOwnProperty('uml:Model')) {
      root = result['uml:Model'];
    } else if (result.hasOwnProperty('xmi:XMI')) {
      root = result['xmi:XMI']['uml:Model'][0];
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

function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
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
