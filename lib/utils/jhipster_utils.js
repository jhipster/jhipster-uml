'use strict';

const fs = require('fs'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  readJSONFiles: readJSONFiles
};

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
