/* eslint-disable no-unused-expressions */
const fs = require('fs');
const expect = require('chai').expect;

const fail = expect.fail;
const FileUtils = require('../../lib/utils/file_utils');

describe('FileUtils', () => {
  describe('#isFile', () => {
    context('when passing an invalid value', () => {
      context('such as nil', () => {
        it('returns false', () => {
          expect(FileUtils.isFile()).to.be.false;
        });
      });
      context('such as an absent file', () => {
        it('returns false', () => {
          expect(FileUtils.isFile('absentfile')).to.be.false;
        });
      });
      context('such as a folder', () => {
        it('returns false', () => {
          expect(FileUtils.isFile('test/')).to.be.false;
        });
      });
    });
    context('when passing a valid file', () => {
      it('returns true', () => {
        expect(FileUtils.isFile('package.json')).to.be.true;
      });
    });
  });
  describe('#readJSONFile', () => {
    context('when passing an invalid value', () => {
      context('such as nil', () => {
        it('returns false', () => {
          try {
            FileUtils.readJSONFile();
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongFileException');
          }
        });
      });
      context('such as an absent file', () => {
        it('returns false', () => {
          try {
            FileUtils.readJSONFile('absentfile');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongFileException');
          }
        });
      });
      context('such as a folder', () => {
        it('returns false', () => {
          try {
            FileUtils.readJSONFile('test/');
            fail();
          } catch (error) {
            expect(error.name).to.equal('WrongFileException');
          }
        });
      });
    });
    context('when passing a valid JSON file', () => {
      let content = null;

      before((done) => {
        fs.writeFile(
          'testfile',
          JSON.stringify({ db: 'sql' }),
          (error) => {
            if (error) {
              return done(error);
            }
            content = FileUtils.readJSONFile('testfile');
            return done();
          });
      });
      after((done) => {
        fs.unlink('testfile', done);
      });

      it('returns its content', () => {
        expect(content).to.deep.equal({ db: 'sql' });
      });
    });
  });
});
