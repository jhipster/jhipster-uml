'use strict';

const fs = require('fs'),
    chalk = require('chalk'),
    isReservedClassName = require('jhipster-core').isReservedClassName,
    isReservedTableName = require('jhipster-core').isReservedTableName,
    isReservedFieldName = require('jhipster-core').isReservedFieldName,
    DatabaseTypes = require('jhipster-core').JHipsterDatabaseTypes.Types,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  isYoRcFilePresent: isYoRcFilePresent,
  readJSONFiles: readJSONFiles,
  checkForReservedClassName: checkForReservedClassName,
  checkForReservedTableName: checkForReservedTableName,
  checkForReservedFieldName: checkForReservedFieldName
};

function isYoRcFilePresent() {
  try {
    fs.statSync('./.yo-rc.json').isFile();
    return true;
  } catch (error) {
    return false;
  }
}

function readJSONFiles(entityNames) {
  if (!entityNames) {
    throw new buildException(
        exceptions.IllegalArgument,
        'The entity to read from the files must be passed.');
  }
  var readFiles = {};
  for (let i = 0; i < entityNames.length; i++) {
    let file = `.jhipster/${entityNames[i]}.json`;
    if (fs.existsSync(file)) {
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
  if (isReservedClassName(args.name)) {
    if (args.shouldThrow) {
      throw new buildException(
          exceptions.IllegalName,
          `The passed class name '${args.name}' is reserved.`);
    } else {
      console.warn(
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
      checkTableName(args.name, DatabaseTypes[types[i]], args.shouldThrow);
    }
  }
}

function checkTableName(name, databaseTypeName, shouldThrow) {
  if (isReservedTableName(name, databaseTypeName)) {
    if (shouldThrow) {
      throw new buildException(
          exceptions.IllegalName,
          `The passed table name '${name}' is reserved for ${databaseTypeName}.`);
    } else {
      console.warn(
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
  if (isReservedFieldName(name, databaseTypeName)) {
    if (shouldThrow) {
      throw new buildException(
          exceptions.IllegalName,
          `The passed field name '${name}' is reserved for ${databaseTypeName}.`);
    } else {
      console.warn(
          chalk.yellow(
              `The passed field name '${name}' is reserved for ${databaseTypeName}.`));
    }
  }
}