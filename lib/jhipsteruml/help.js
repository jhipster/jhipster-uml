'use strict';

const HELP = 'Syntax: jhipster-uml <xmi file> [-options]\n'
    + 'The options are:\n'
    + '\t-db <the database name>\tDefines which database type your app uses;\n'
    + '\t-dto\tGenerates DTO with MapStruct for the selected entities;\n'
    + '\t-paginate \tGenerates pagination for the selected entities;\n'
    + '\t-service \tGenerates services for the selected entities.\n'
    + '\t-skip-client \tSkips client code generation.\n'
    + '\t-skip-server \tSkips server code generation.\n'
    + '\t-angular-suffix \tAdds a suffix to angular files for the selected entities.\n'
    + '\t-f or -force \tOverrides entities.\n'
    + '\t-h or -help \tDisplays this message.\n'
    + "\t-v or -version \tDisplays JHipster UML's version.";

module.exports = {
  displayHelp: displayHelp
};

function displayHelp() {
  console.info(HELP);
}
