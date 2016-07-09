'use strict';

const ModelioParser = require('./modelio_parser'),
    GenMyModelParser = require('./genmymodel_parser'),
    UMLDesignerParser = require('./umldesigner_parser'),
    VisualParadigmParser = require('./visualparadigm_parser');

exports.MODELIO = 'modelio';
exports.UMLDESIGNER = 'umldesigner';
exports.GENMYMODEL = 'genmymodel';
exports.VISUALPARADIGM = 'visualparadigm';

exports.Parsers = {
  modelio: ModelioParser,
  umldesigner: UMLDesignerParser,
  genmymodel: GenMyModelParser,
  visualparadigm: VisualParadigmParser,
};

exports.UndetectedEditors = [
  'umldesigner'
];