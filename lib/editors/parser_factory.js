'use strict';

var fs = require('fs'),
    xml2js = require('xml2js'),
    pegParser = require('../dsl/jhGrammar'),
    EditorDetector = require('./editor_detector'),
    Editors = require('./editors'),
    SQLTypes = require('../types/sql_types'),
    MongoDBTypes = require('../types/mongodb_types'),
    CassandraTypes = require('../types/cassandra_types'),
    ArgumentException = require('../exceptions/argument_exception'),
    WrongDatabaseTypeException = require('../exceptions/wrong_database_type_exception'),
    WrongPassedArgumentException = require('../exceptions/wrong_passed_argument_exception'),
    NoRootElementException = require('../exceptions/no_root_element_exception');

/**
 * Creates a parser.
 * @param args {Object} the arguments: file, files, and databaseType.
 * @return {Parser} the created parser.
 * @throws ArgumentException if the required arguments aren't passed.
 * @throws WrongPassedArgumentException if the input file doesn't exist, or is
 *                                      a folder, or if multiple XMI files
 *                                      have been passed, of if one mixes JDL and
 *                                      XMI files.
 * @throws NoRootElementException if the passed file doesn't have a root element.
 * @throws WrongDatabaseTypeException if the passed type isn't supported,
 *                                    or the files array is empty or nil.
 */
exports.createParser = function(args) {
  if (!args || (!args.file && !args.files) || !args.databaseType) {
    throw new ArgumentException('The file/s and the database type must be passed');
  }
  var types = initDatabaseTypeHolder(args.databaseType);
  if (args.file) { // standard mode
    if (endsWith(args.file, '.jh')) {
      return new Editors.Parsers.dsl(pegParser.parse(readJDLFile(args.file)), types);
    } else {
      return getXMIFileParser(args.file, types);
    }
  } else if (args.files) {
    if (areFilesJhFiles(args.files)) {
      return new Editors.Parsers.dsl(pegParser.parse(aggregateFiles(args.files)), types);
    } else {
      throw new WrongPassedArgumentException(
        'Only one XMI file can be passed, and mixing JDL and XMI files is not allowed.');
    }
  }
};

function getXMIFileParser(file, databaseType) {
  var root = getRootElement(readFileContent(file));
  var detectedEditor = EditorDetector.detect(root);
  return new Editors.Parsers[detectedEditor](root, databaseType);
}

function areFilesJhFiles(files) {
  return files.every(function(file) {
    return endsWith(file, '.jh');
  });
}

function aggregateFiles(files) {
  var content = '';
  files.forEach(function(file) {
    content = content + '\n' + readJDLFile(file);
  });
  return content;
}

function readJDLFile(file) {
  return fs.readFileSync('./' + file).toString();
}

function readFileContent(file) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    throw new WrongPassedArgumentException(
      "The passed file '"
      + file
      + "' must exist and must not be a directory.'");
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
        'The passed document has no immediate root element.');
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
        + "'.");
  }
}

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}
