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
  if (!fs.existsSync('.jhipster')) {
    fs.mkdirSync('.jhipster');
  }
  for (let entityId in entities) {
    if (entities.hasOwnProperty(entityId) && entityIdsToGenerate.indexOf(entityId) !== -1) {
      let file = `.jhipster/${parsedData.getClass(entityId).name}.json`;
      fs.writeFileSync(file, JSON.stringify(entities[entityId], null, '  '));
    }
  }
}
