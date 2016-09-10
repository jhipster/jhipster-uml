'use strict';

const ModelioParser = require('./modelio_parser'),
    GenMyModelParser = require('./genmymodel_parser'),
    UMLDesignerParser = require('./umldesigner_parser');

module.exports = {
  MODELIO: 'modelio',
  UMLDESIGNER: 'umldesigner',
  GENMYMODEL: 'genmymodel',
  Parsers: {
    modelio: ModelioParser,
    umldesigner: UMLDesignerParser,
    genmymodel: GenMyModelParser
  },
  UndetectedEditors: [
    'umldesigner'
  ]
};
