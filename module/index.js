const Editors = require('../lib/editors/editors');
const createParser = require('../lib/editors/parser_factory').createParser;
const generateEntities = require('../lib/entity_generator').generateEntities;
const createEntities = require('../lib/entitiescreator').createEntities;
const JDLExporter = require('../lib/export/jdl_exporter');

module.exports = {
  Editors,
  createParser,
  createEntities,
  generateEntities,
  toJDL: JDLExporter.toJDL,
  toJDLString: JDLExporter.toJDLString
};
