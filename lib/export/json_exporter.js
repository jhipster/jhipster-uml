'use strict';

const fs = require('fs'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportToJSON: exportToJSON
};

function exportToJSON(entities, entityIdsToGenerate, parsedData) {
  if (!entities || ! entityIdsToGenerate || !parsedData) {
    throw new buildException(
        exceptions.NullPointer,
        'Entities have to be passed to be exported.');
  }
  try {
    fs.statSync('./.jhipster').isDirectory()
  } catch (error) {
    fs.mkdirSync('.jhipster');
  }
  for (let i = 0, entityIds = Object.keys(entities); i < entityIds.length; i++) {
    let file = `.jhipster/${parsedData.getClass(entityIds[i]).name}.json`;
    fs.writeFileSync(file, JSON.stringify(entities[entityIds[i]], null, '  '));
  }
}
