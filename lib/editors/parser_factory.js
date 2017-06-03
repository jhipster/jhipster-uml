/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
  const types = initDatabaseTypeHolder(args.databaseType);
  if(args.editor) {
    const root = getRootElement(readFileContent(args.file));
    return getFileParserByEditor(args.editor, root, types, args.noUserManagement);
  }
  return getParserForSingleFile(args.file, types, args.noUserManagement);
}

function getParserForSingleFile(file, types, noUserManagement) {
  return getXMIFileParser(file, types, noUserManagement);
}

function getXMIFileParser(file, databaseType, noUserManagement) {
  const root = getRootElement(readFileContent(file));
  const detectedEditor = EditorDetector.detect(root);
  return getFileParserByEditor(detectedEditor, root, databaseType, noUserManagement);
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
  let root;
  const parser = new xml2js.Parser();
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
