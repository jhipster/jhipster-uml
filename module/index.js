'use strict';

const Editors = require('../lib/editors/editors'),
    createParser = require('../lib/editors/parser_factory').createParser,
    Parser = require('../lib/editors/parser'),
    AbstractParser = require('../lib/editors/abstract_parser'),
    entityGenerator = require('../lib/entity_generator').generateEntities,
    EntitiesCreator = require('../lib/entitiescreator').createEntities;

module.exports = {
  Editors: Editors,
  createParser: createParser,
  Parser: Parser,
  AbstractParser: AbstractParser,
  createEntities: createEntities,
  generateEntities: generateEntities
};
