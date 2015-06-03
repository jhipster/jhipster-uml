'use strict';

var modelio_parser = require('./modelio_parser'),
	  genmymodel_parser = require('./genmymodel_parser'),
    umldesigner_parser = require('./umldesigner_parser');

exports.MODELIO = 'modelio';
exports.UMLDESIGNER = 'umldesigner';
exports.GENMYMODEL = 'genmymodel';

exports.Parsers = {
  modelio: modelio_parser.ModelioParser,
  umldesigner: umldesigner_parser.UMLDesigner,
  genmymodel: genmymodel_parser.GenMyModelParser
};