'use strict';

const fs = require('fs'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportToJSON: exportToJSON
};

function exportToJSON(entities, entityIdsToGenerate, parsedData, entityNamesToGenerate) {
  if (!entities || ! entityIdsToGenerate || !parsedData) {
    throw new buildException(
        exceptions.NullPointer,
        'Entities have to be passed to be exported.');
  }
  createJHipsterJSONFolder();
  for (let i = 0, entityIds = Object.keys(entities); i < entityIds.length; i++) {
    if (entityNamesToGenerate.indexOf(parsedData.getClass(entityIds[i]).name) === -1) {
      continue;
    }
    let file = `.jhipster/${parsedData.getClass(entityIds[i]).name}.json`;
    fs.writeFileSync(file, JSON.stringify(entities[entityIds[i]], null, '  '));
  }
}

function createJHipsterJSONFolder() {
  try {
    if (!fs.statSync('./.jhipster').isDirectory()) {
      fs.mkdirSync('.jhipster');
    }
  } catch (error) {
    fs.mkdirSync('.jhipster');
  }
}