'use strict';

var modelio_parser = require('./modelio_parser'),
    genmymodel_parser = require('./genmymodel_parser'),
    umldesigner_parser = require('./umldesigner_parser'),
    dsl_parser = require('../dsl/dsl_parser'),
    visualparadigm_parser = require('./visualparadigm_parser');

exports.MODELIO = 'modelio';
exports.UMLDESIGNER = 'umldesigner';
exports.GENMYMODEL = 'genmymodel';
exports.VISUALPARADIGM = 'visualparadigm';
exports.DSL = 'dsl';

exports.Parsers = {
  modelio: modelio_parser.ModelioParser,
  umldesigner: umldesigner_parser.UMLDesignerParser,
  genmymodel: genmymodel_parser.GenMyModelParser,
  visualparadigm: visualparadigm_parser.VisualParadigmParser,
  dsl : dsl_parser.DSL
};