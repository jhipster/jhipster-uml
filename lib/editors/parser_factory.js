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
const fs = require('fs');
const xml2js = require('xml2js');
const DatabaseTypes = require('jhipster-core').JHipsterDatabaseTypes;
const EditorDetector = require('./editor_detector');
const Editors = require('./editors');
const SQLTypes = require('../types/sql_types');
const MongoDBTypes = require('../types/mongodb_types');
const CassandraTypes = require('../types/cassandra_types');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  createParser
};

/**
 * Creates a parser.
 * @param args {Object} the arguments: file, files, databaseType, and the noUserManagement flag.
 * @return {Parser} the created parser.
 */
async function createParser(args) {
  if (!args || !args.file || !args.databaseType) {
    throw new BuildException(
      exceptions.IllegalArgument,
      'The file and the database type must be passed');
  }
  const types = initDatabaseTypeHolder(args.databaseType);
  if (args.editor) {
    const root = getRootElement(readFileContent(args.file));
    return getFileParserByEditor(args.editor, root, types, args.noUserManagement);
  }
  return await getParserForSingleFile(args.file, types, args.noUserManagement);
}

async function getParserForSingleFile(file, types, noUserManagement) {
  return await getXMIFileParser(file, types, noUserManagement);
}

async function getXMIFileParser(file, databaseType, noUserManagement) {
  const root = getRootElement(readFileContent(file));
  const detectedEditor = await EditorDetector.detect(root);
  return getFileParserByEditor(detectedEditor, root, databaseType, noUserManagement);
}

function getFileParserByEditor(detectedEditor, root, databaseType, noUserManagement) {
  return {
    parser: Editors.Parsers[detectedEditor],
    data: {
      root,
      databaseTypes: databaseType,
      noUserManagement
    }
  };
}

function readFileContent(file) {
  try {
    fs.statSync(file).isFile();
  } catch (error) {
    throw new BuildException(
      exceptions.WrongFile,
      `The passed file '${file}' must exist and must not be a directory.`);
  }
  return fs.readFileSync(file, 'utf-8');
}

function getRootElement(content) {
  let root;
  const parser = new xml2js.Parser();
  parser.parseString(content, (err, result) => {
    if ('uml:Model' in result) {
      root = result['uml:Model'];
    } else if ('xmi:XMI' in result) {
      root = result['xmi:XMI']['uml:Model'][0];
    } else {
      throw new BuildException(
        exceptions.NoRoot,
        'The passed document has no immediate root element.');
    }
  });
  return root;
}

function initDatabaseTypeHolder(databaseTypeName) {
  switch (databaseTypeName) {
  case DatabaseTypes.SQL:
    return new SQLTypes();
  case DatabaseTypes.MONGODB:
    return new MongoDBTypes();
  case DatabaseTypes.CASSANDRA:
    return new CassandraTypes();
  default:
    throw new BuildException(exceptions.WrongDatabaseType,
      'The passed database type is incorrect. '
      + 'It must either be \'sql\', \'mongodb\', or \'cassandra\'. '
      + `Got '${databaseTypeName}'.`);
  }
}
