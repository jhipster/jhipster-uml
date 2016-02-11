'use strict';

var HELP = 'Syntax: jhipster-uml <xmi file> [-options]\n'
  + 'The options are:\n'
  + '\t-db <the database name>\tDefines which database type your app uses;\n'
  + '\t-dto\t[BETA] Generates DTO with MapStruct for the selected entities;\n'
  + '\t-paginate \tGenerates pagination for the selected entities;\n'
  + '\t-service \tGenerates services for the selected entities.';

exports.displayHelp = function() {
  console.info(HELP);
};