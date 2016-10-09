'use strict';

const Editors = require('../lib/editors/editors'),
    createParser = require('../lib/editors/parser_factory').createParser,
    generateEntities = require('../lib/entity_generator').generateEntities,
    createEntities = require('../lib/entitiescreator').createEntities,
    JDLExporter = require('../lib/export/jdl_exporter');

module.exports = {
  Editors: Editors,
  createParser: createParser,
  createEntities: createEntities,
  generateEntities: generateEntities,
  toJDL: JDLExporter.toJDL,
  toJDLString: JDLExporter.toJDLString
};
