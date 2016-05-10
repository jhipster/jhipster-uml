'use strict';

const fs = require('fs'),
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportToJSON: exportToJSON
};

function exportToJSON(entities, classList, parsedData) {
  if (!entities || ! classList || !parsedData) {
    throw new buildException(
        exceptions.NullPointer,
        'Entities have to be passed to be exported.');
  }
  if (!fs.existsSync('.jhipster')) {
    fs.mkdirSync('.jhipster');
  }
  for (let entity in entities) {
    if (entities.hasOwnProperty(entity) && classList.indexOf(entity) !== -1) {
      let file = `.jhipster/${parsedData.getClass(entity).name}.json`;
      fs.writeFileSync(file, JSON.stringify(entities[entity], null, '  '));
    }
  }
}
