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
const path = require('path');
const chalk = require('chalk');
const JHipsterCore = require('jhipster-core');
const winston = require('winston');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

const DatabaseTypes = JHipsterCore.JHipsterDatabaseTypes;

module.exports = {
  isYoRcFilePresent,
  readJSONFiles,
  checkForReservedClassName,
  checkForReservedTableName,
  checkForReservedFieldName
};

function isYoRcFilePresent() {
  return JHipsterCore.FileUtils.doesFileExist('.yo-rc.json');
}

function readJSONFiles(entityNames) {
  if (!entityNames) {
    throw new BuildException(
      exceptions.IllegalArgument,
      'The entity to read from the files must be passed.');
  }
  const readFiles = {};
  for (let i = 0; i < entityNames.length; i++) {
    const file = path.join('.jhipster', `${entityNames[i]}.json`);
    if (JHipsterCore.FileUtils.doesFileExist(file)) {
      readFiles[entityNames[i]] = JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  }
  return readFiles;
}

/**
 * Checks for reserved class name.
 * @param args an object having as keys: name and shouldThrow
 */
function checkForReservedClassName(args) {
  if (!args) {
    return;
  }
  if (JHipsterCore.isReservedClassName(args.name)) {
    if (args.shouldThrow) {
      throw new BuildException(
        exceptions.IllegalName,
        `The passed class name '${args.name}' is reserved.`);
    } else {
      winston.warn(
        chalk.yellow(
          `The passed class name '${args.name}' is reserved .`));
    }
  }
}

/**
 * Checks for reserved table name.
 * @param args an object having as keys: name, databaseTypeName and shouldThrow
 */
function checkForReservedTableName(args) {
  if (!args) {
    return;
  }
  if (args.databaseTypeName) {
    checkTableName(args.name, args.databaseTypeName, args.shouldThrow);
  } else {
    for (let i = 0, types = Object.keys(DatabaseTypes); i < types.length; i++) {
      if (typeof DatabaseTypes[types[i]] !== 'function') {
        checkTableName(args.name, DatabaseTypes[types[i]], args.shouldThrow);
      }
    }
  }
}

function checkTableName(name, databaseTypeName, shouldThrow) {
  if (JHipsterCore.isReservedTableName(name, databaseTypeName)) {
    if (shouldThrow) {
      throw new BuildException(
        exceptions.IllegalName,
        `The passed table name '${name}' is reserved for ${databaseTypeName}.`);
    } else {
      winston.warn(
        chalk.yellow(
          `The passed table name '${name}' is reserved for ${databaseTypeName}.`));
    }
  }
}

/**
 * Checks for reserved field name.
 * @param args an object having as keys: name, databaseTypeName and shouldThrow
 */
function checkForReservedFieldName(args) {
  if (!args) {
    return;
  }
  if (args.databaseTypeName) {
    checkFieldName(args.name, args.databaseTypeName, args.shouldThrow);
  } else {
    for (let i = 0, types = Object.keys(DatabaseTypes); i < types.length; i++) {
      checkFieldName(args.name, DatabaseTypes[types[i]], args.shouldThrow);
    }
  }
}

function checkFieldName(name, databaseTypeName, shouldThrow) {
  if (JHipsterCore.isReservedFieldName(name, databaseTypeName)) {
    if (shouldThrow) {
      throw new BuildException(
        exceptions.IllegalName,
        `The passed field name '${name}' is reserved for ${databaseTypeName}.`);
    } else {
      winston.warn(
        chalk.yellow(
          `The passed field name '${name}' is reserved for ${databaseTypeName}.`));
    }
  }
}
