'use strict';

var ParserFactory = require('./editors/parser_factory');

// var parser = ParserFactory.createParser('./test/xmi/modelio.xmi', 'sql');
var parser = ParserFactory.createParser('./test/xmi/umldesigner.uml', 'sql');


parser.parse();

Object.keys(parser.getClasses()).forEach(function(klass) {
	console.log(JSON.stringify(parser.getClasses()[klass].injectedFields));
});
	
