'use strict';

var ModelioParser = require('./modelio_parser'),
    GenMyModelParser = require('./genmymodel_parser'),
    UMLDesignerParser = require('./umldesigner_parser'),
    DSLParser = require('../dsl/dsl_parser'),
    VisualParadigmParser = require('./visualparadigm_parser');

exports.MODELIO = 'modelio';
exports.UMLDESIGNER = 'umldesigner';
exports.GENMYMODEL = 'genmymodel';
exports.VISUALPARADIGM = 'visualparadigm';
exports.DSL = 'dsl';

exports.Parsers = {
  modelio: ModelioParser,
  umldesigner: UMLDesignerParser,
  genmymodel: GenMyModelParser,
  visualparadigm: VisualParadigmParser,
  dsl: DSLParser
};

exports.UndetectedEditors = [
  'umldesigner'
];