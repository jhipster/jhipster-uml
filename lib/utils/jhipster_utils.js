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
    chalk = require('chalk'),
    merge = require('./object_utils').merge,
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
  checkForReservedFieldName: checkForReservedFieldName,
  dateFormatForLiquibase: dateFormatForLiquibase
};

function defaultsForLiquibaseDateFormatting() {
  return {
    date: new Date(),
    increment: 0
  };
}

/**
 * Formats the date to match the Liquibase format.
 * @param args {object} an object containing:
 *   - date: the date to format,
 *   - increment: the increment that will be applied to the seconds.
 * @returns {string} the formatted date.
 */
function dateFormatForLiquibase(args) {
  if (args && args.date) {
    // to safely handle the date, we create a copy of the date
    args.date = new Date(JSON.parse(JSON.stringify(args.date)));
  }
  const merged = merge(defaultsForLiquibaseDateFormatting(), args);
  merged.date.setSeconds(merged.date.getUTCSeconds() + merged.increment);
  const now_utc = new Date(
    merged.date.getUTCFullYear(),
    merged.date.getUTCMonth(),
    merged.date.getUTCDate(),
    merged.date.getUTCHours(),
    merged.date.getUTCMinutes(),
    merged.date.getUTCSeconds());
  const year = `${now_utc.getFullYear()}`;
  let month = `${now_utc.getMonth() + 1}`;
  if (month.length === 1) {
    month = `0${month}`;
  }
  let day = `${now_utc.getDate()}`;
  if (day.length === 1) {
    day = `0${day}`;
  }
  let hour = `${now_utc.getHours()}`;
  if (hour.length === 1) {
    hour = `0${hour}`;
  }
  let minute = `${now_utc.getMinutes()}`;
  if (minute.length === 1) {
    minute = `0${minute}`;
  }
  let second = `${now_utc.getSeconds()}`;
  if (second.length === 1) {
    second = `0${second}`;
  }
  return `${year}${month}${day}${hour}${minute}${second}`;
}

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
  const readFiles = {};
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
