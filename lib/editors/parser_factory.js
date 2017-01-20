'use strict';

const fs = require('fs'),
    xml2js = require('xml2js'),
    DatabaseTypes = require('jhipster-core').JHipsterDatabaseTypes.Types,
    EditorDetector = require('./editor_detector'),
    Editors = require('./editors'),
    SQLTypes = require('../types/sql_types'),
    MongoDBTypes = require('../types/mongodb_types'),
    CassandraTypes = require('../types/cassandra_types'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  createParser: createParser
};

/**
 * Creates a parser.
 * @param args {Object} the arguments: file, files, databaseType, and the noUserManagement flag.
 * @return {Parser} the created parser.
 */
function createParser(args) {
  if (!args || !args.file || !args.databaseType) {
    throw new buildException(
        exceptions.IllegalArgument,
        'The file and the database type must be passed');
  }
  var types = initDatabaseTypeHolder(args.databaseType);
  if(args.editor) {
    var root = getRootElement(readFileContent(args.file));
    return getFileParserByEditor(args.editor, root, types, args.noUserManagement);
  }
  return getParserForSingleFile(args.file, types, args.noUserManagement);
}

function getParserForSingleFile(file, types, noUserManagement) {
  return getXMIFileParser(file, types, noUserManagement);
}

function getXMIFileParser(file, databaseType, noUserManagement) {
  var root = getRootElement(readFileContent(file));
  var detectedEditor = EditorDetector.detect(root);
  return getFileParserByEditor(detectedEditor, root, databaseType, noUserManagement);
  // return Editors.Parsers[detectedEditor].initParser({root: root, databaseTypes: databaseType, noUserManagement: noUserManagement});
  //return new Editors.Parsers[detectedEditor]({root: root, databaseTypes: databaseType, noUserManagement: noUserManagement});
}

function getFileParserByEditor(detectedEditor, root, databaseType, noUserManagement)
{
  return {
    parser: Editors.Parsers[detectedEditor],
    data: {
      root: root,
      databaseTypes: databaseType,
      noUserManagement: noUserManagement
    }
  };
}

function readFileContent(file) {
  try {
    fs.statSync(file).isFile();
  } catch (error) {
    throw new buildException(
        exceptions.WrongFile,
        `The passed file '${file}' must exist and must not be a directory.`);
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
      throw new buildException(
          exceptions.NoRoot,
          'The passed document has no immediate root element.');
    }
  });
  return root;
}

function initDatabaseTypeHolder(databaseTypeName) {
  switch (databaseTypeName) {
  case DatabaseTypes.sql:
    return new SQLTypes();
  case DatabaseTypes.mongodb:
    return new MongoDBTypes();
  case DatabaseTypes.cassandra:
    return new CassandraTypes();
  default:
    throw new buildException(exceptions.WrongDatabaseType,
        'The passed database type is incorrect. '
        + "It must either be 'sql', 'mongodb', or 'cassandra'. "
        + `Got '${databaseTypeName}'.`);
  }
}
