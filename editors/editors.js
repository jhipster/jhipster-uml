'use strict';

var modelio_parser = require('./modelio_parser'),
	  umldesigner_parser = require('./umldesigner_parser');

exports.MODELIO = 'modelio';
exports.UMLDESIGNER = 'umldesigner';

exports.Parsers = {
  modelio: modelio_parser.ModelioParser,
  umldesigner: umldesigner_parser.UMLDesigner
};