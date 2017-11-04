/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const CommandLineOptionHandler = require('../../lib/jhipsteruml/command_line_option_handler');
const JHipsterUMLFileHandler = require('../../lib/jhipsteruml/jhipster_uml_file_handler');
const fs = require('fs');

describe('CommandLineHandler', () => {
  describe('#isNumberOfPassedArgumentsInvalid', () => {
    context(`with less than ${CommandLineOptionHandler.MINIMUM_ARGS_NUMBER} args`, () => {
      it('returns true', () => {
        expect(CommandLineOptionHandler.isNumberOfPassedArgumentsInvalid([1, 2])).to.be.true;
      });
    });
    context(`with ${CommandLineOptionHandler.MINIMUM_ARGS_NUMBER} args or more`, () => {
      it('returns false', () => {
        expect(CommandLineOptionHandler.isNumberOfPassedArgumentsInvalid([1, 2, 3])).to.be.false;
      });
    });
  });
  describe('#handle', () => {
    context(`without a ${JHipsterUMLFileHandler.JHIPSTER_UML_FILENAME}`, () => {
      let args = null;

      before(() => {
        args = CommandLineOptionHandler.handle([
          '--db', 'sql',
          '--dto', 'mapstruct',
          '--paginate', 'pagination',
          '--service', 'serviceImpl',
          '--skip-client',
          '--skip-server',
          '--angular-suffix', 'angular-suffix',
          '--microservice-name', 'microservice-name',
          '--search-engine', 'elasticsearch',
          '--skip-user-management',
          '--no-fluent-methods',
          '--to-jdl',
          '-f',
          '--editor', 'umldesigner'
        ]).argv;
      });
      it('adds all the options', () => {
        expect(args).to.have.property('db', 'sql');
        expect(args).to.have.property('dto', 'mapstruct');
        expect(args).to.have.property('paginate', 'pagination');
        expect(args).to.have.property('service', 'serviceImpl');
        expect(args).to.have.property('skip-client', true);
        expect(args).to.have.property('skip-server', true);
        expect(args).to.have.property('angular-suffix', 'angular-suffix');
        expect(args).to.have.property('microservice-name', 'microservice-name');
        expect(args).to.have.property('search-engine', 'elasticsearch');
        expect(args).to.have.property('skip-user-management', true);
        expect(args).to.have.property('fluent-methods', false);
        expect(args).to.have.property('to-jdl', true);
        expect(args).to.have.property('force', true);
        expect(args).to.have.property('editor', 'umldesigner');
      });
    });
    context(`without options but with a ${JHipsterUMLFileHandler.JHIPSTER_UML_FILENAME}`, () => {
      let args = null;

      before((done) => {
        fs.writeFile(
          JHipsterUMLFileHandler.JHIPSTER_UML_FILENAME,
          JSON.stringify({ db: 'sql', 'fluent-methods': false }),
          (error) => {
            if (error) {
              return done(error);
            }
            args = CommandLineOptionHandler.handle([]).argv;
            return done();
          });
      });
      after((done) => {
        fs.unlink(JHipsterUMLFileHandler.JHIPSTER_UML_FILENAME, done);
      });

      it('loads the options from the file', () => {
        expect(args).to.have.property('db', 'sql');
        expect(args).to.have.property('fluent-methods', false);
      });
    });
    context(`with options and a ${JHipsterUMLFileHandler.JHIPSTER_UML_FILENAME}`, () => {
      let args = null;

      before((done) => {
        fs.writeFile(
          JHipsterUMLFileHandler.JHIPSTER_UML_FILENAME,
          JSON.stringify({ db: 'sql' }),
          (error) => {
            if (error) {
              return done(error);
            }
            args = CommandLineOptionHandler.handle([
              '--dto', 'mapstruct',
              '--db', 'mongodb']
            ).argv;
            return done();
          });
      });
      after((done) => {
        fs.unlink(JHipsterUMLFileHandler.JHIPSTER_UML_FILENAME, done);
      });

      it('adds different options from both sources', () => {
        expect(args).to.have.property('dto', 'mapstruct');
      });
      it('chooses the command line options over the file\'s', () => {
        expect(args).to.have.property('db', 'mongodb');
      });
    });
  });
});
