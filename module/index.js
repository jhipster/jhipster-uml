'use strict';

const Editors = require('../lib/editors/editors'),
    createParser = require('../lib/editors/parser_factory').createParser,
    Parser = require('../lib/editors/parser'),
    AbstractParser = require('../lib/editors/abstract_parser'),
    generateEntities = require('../lib/entity_generator').generateEntities,
    createEntities = require('../lib/entitiescreator').createEntities,
    JDLExporter = require('../lib/export/jdl_exporter');

module.exports = {
  Editors: Editors,
  createParser: createParser,
  Parser: Parser,
  AbstractParser: AbstractParser,
  createEntities: createEntities,
  generateEntities: generateEntities,
  toJDL: JDLExporter.toJDL,
  toJDLString: JDLExporter.toJDLString
};
