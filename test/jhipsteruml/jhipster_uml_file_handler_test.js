/* eslint-disable no-unused-expressions */
const fs = require('fs');
const expect = require('chai').expect;
const JHipsterUMLFileHandler = require('../../lib/jhipsteruml/jhipster_uml_file_handler');

describe('JHipsterUMLFileHandler', () => {
  describe('#isJHipsterUMLFilePresent', () => {
    context('when there is no file', () => {
      it('returns false', () => {
        expect(JHipsterUMLFileHandler.isJHipsterUMLFilePresent()).to.be.false;
      });
    });
    context('when there is a file', () => {
      before((done) => {
        fs.writeFile(
          JHipsterUMLFileHandler.JHIPSTER_UML_FILENAME,
          '',
          done);
      });
      after((done) => {
        fs.unlink(JHipsterUMLFileHandler.JHIPSTER_UML_FILENAME, done);
      });

      it('returns true', () => {
        expect(JHipsterUMLFileHandler.isJHipsterUMLFilePresent()).to.be.true;
      });
    });
  });
  describe('#readJHipsterUMLFile', () => {
    context('when there is no file', () => {
      it('returns an empty object', () => {
        expect(JHipsterUMLFileHandler.readJHipsterUMLFile()).to.deep.equal({});
      });
    });
    context('when there is a file', () => {
      before((done) => {
        fs.writeFile(
          JHipsterUMLFileHandler.JHIPSTER_UML_FILENAME,
          JSON.stringify({ db: 'sql' }),
          done);
      });
      after((done) => {
        fs.unlink(JHipsterUMLFileHandler.JHIPSTER_UML_FILENAME, done);
      });

      it('returns its content', () => {
        expect(JHipsterUMLFileHandler.readJHipsterUMLFile()).to.deep.equal({ db: 'sql' });
      });
    });
  });
});
