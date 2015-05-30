'use strict';

var ParserFactory = require('./editors/parser_factory');

var parser = ParserFactory.createParser('./test/xmi/modelio.xmi', 'sql');

parser.parse();

console.log(parser.getClasses());