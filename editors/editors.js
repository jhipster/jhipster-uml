'use strict';

var modelio_parser = require('./modelio_parser');

exports.MODELIO = 'modelio';

exports.Parsers = {
  modelio: modelio_parser.ModelioParser
};