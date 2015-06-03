'use strict';

var modelio_parser = require('./modelio_parser');
var genmymodel_parser = require('./genmymodel_parser');

exports.MODELIO = 'modelio';
exports.GENMYMODEL = 'genmymodel';

exports.Parsers = {
  modelio: modelio_parser.ModelioParser,
  genmymodel: genmymodel_parser.GenMyModelParser
};