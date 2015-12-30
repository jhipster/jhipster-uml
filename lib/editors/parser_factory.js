'use strict';

var fs = require('fs'),
    xml2js = require('xml2js'),
    EditorDetector = require('./editor_detector'),
    Editors = require('./editors'),
    SQLTypes = require('../types/sql_types'),
    MongoDBTypes = require('../types/mongodb_types'),
    CassandraTypes = require('../types/cassandra_types'),
    WrongDatabaseTypeException = require('../exceptions/wrong_database_type_exception'),
    WrongPassedArgumentException = require('../exceptions/wrong_passed_argument_exception'),
    NoRootElementException = require('../exceptions/no_root_element_exception');

/**
 * Creates a parser.
 * @param file {string} the XMI file's name.
 * @param databaseTypeName {string} the database type's name (SQL, MongoDB, etc.).
 * @return {Parser} the created parser.
 * @throws WrongPassedArgumentException if the input file doesn't exist, or is
 *                                      a folder.
 * @throws NoRootElementException if the passed file doesn't have a root element.
 * @throws WrongDatabaseTypeException if the passed type isn't supported.
 */
exports.createParser = function(file, databaseTypeName) {
  var types = initDatabaseTypeHolder(databaseTypeName);
  if(endsWith(file, '.jh')) {
    return new Editors.Parsers['dsl'](file, types);
  } else {
    var root = getRootElement(readFileContent(file));
    var detectedEditor = EditorDetector.detect(root);
    return new Editors.Parsers[detectedEditor](root, types);
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
    } else {
      throw new NoRootElementException(
        'The passed document has no immediate root element, exiting now.');
    }
  });
  return root;
}

function initDatabaseTypeHolder(databaseTypeName) {
  switch (databaseTypeName) {
    case 'sql':
      return new SQLTypes();
    case 'mongodb':
      return new MongoDBTypes();
    case 'cassandra':
      return new CassandraTypes();
    default:
      throw new WrongDatabaseTypeException(
        'The passed database type is incorrect. '
        + "It must either be 'sql', 'mongodb', or 'cassandra'. Got '"
        + databaseTypeName
        + "', exiting now.");
  }
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
