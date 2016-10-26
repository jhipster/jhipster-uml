'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    fs = require('fs'),
    JHipsterUtils = require('../../lib/utils/jhipster_utils'),
    isYoRcFilePresent = JHipsterUtils.isYoRcFilePresent,
    readJSONFiles = JHipsterUtils.readJSONFiles,
    checkForReservedClassName = JHipsterUtils.checkForReservedClassName,
    checkForReservedTableName = JHipsterUtils.checkForReservedTableName,
    checkForReservedFieldName = JHipsterUtils.checkForReservedFieldName;

describe('JHipsterUtils', () => {
  describe('::isYoRcFilePresent', () => {
    it('returns whether the .yo-rc.json file exists', () => {
      expect(isYoRcFilePresent()).to.be.false;
      fs.open('.yo-rc.json', 'w', (error, fileDescriptor) => {
        if (error) {
          throw error;
        }
        expect(isYoRcFilePresent()).to.be.true;
        fs.unlinkSync('.yo-rc.json');
      });
    });
  });
  describe('::readJSONFiles', () => {
    describe('when passing valid entity names', () => {
      it('reads the files', () => {
        fs.mkdirSync('.jhipster');
        fs.writeFileSync('./.jhipster/A.json', '{"name": "toto"}');
        var read = readJSONFiles(['A']);
        expect(read.A.name).to.eq('toto');
        fs.unlinkSync('./.jhipster/A.json');
        fs.rmdirSync('.jhipster');
      });
    });
    describe('when passing entity names for files that do not exist', () => {
      it('does nothing', () => {
        fs.mkdirSync('.jhipster');
        var read = readJSONFiles(['A']);
        expect(read).to.deep.eq({});
        fs.rmdirSync('.jhipster');
      });
    });
    describe('when passing nothing', () => {
      it('fails', () => {
        try {
          readJSONFiles();
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
  });
  describe('::checkForReservedClassName', () => {
    describe('when passing no arg', () => {
      it("doesn't fail", () => {
        checkForReservedClassName();
      });
    });
    describe('when passing valid args', () => {
      describe('with a valid class name', () => {
        it("doesn't fail", () => {
          checkForReservedClassName({
            name: 'Job',
            databaseTypeName: 'sql',
            shouldThrow: true
          });
        });
      });
      describe('with an invalid class name', () => {
        describe('with the shouldThrow flag to true', () => {
          it('fails', () => {
            try {
              checkForReservedClassName({
                name: 'Class',
                databaseTypeName: 'sql',
                shouldThrow: true
              });
              fail();
            } catch (error) {
              expect(error.name).to.eq('IllegalNameException');
            }
          });
        });
        describe('with the shouldThrow flag to false', () => {
          it("doesn't fail", () => {
            checkForReservedClassName({
              name: 'Class',
              databaseTypeName: 'sql',
              shouldThrow: false
            });
          });
        });
      });
    });
  });
  describe('::checkForReservedTableName', () => {
    describe('when passing no arg', () => {
      it("doesn't fail", () => {
        checkForReservedTableName();
      });
    });
    describe('when passing valid args', () => {
      describe('with a valid class name', () => {
        it("doesn't fail", () => {
          checkForReservedTableName({
            name: 'Job',
            databaseTypeName: 'sql',
            shouldThrow: true
          });
        });
      });
      describe('with an invalid class name', () => {
        describe('with the shouldThrow flag to true', () => {
          it('fails', () => {
            try {
              checkForReservedTableName({
                name: 'ANALYZE',
                databaseTypeName: 'sql',
                shouldThrow: true
              });
              fail();
            } catch (error) {
              expect(error.name).to.eq('IllegalNameException');
            }
          });
        });
        describe('with the shouldThrow flag to false', () => {
          it("doesn't fail", () => {
            checkForReservedTableName({
              name: 'ANALYZE',
              databaseTypeName: 'sql',
              shouldThrow: false
            });
          });
        });
      });
    });
  });
  describe('::checkForReservedFieldName', () => {
    describe('when passing no arg', () => {
      it("doesn't fail", () => {
        checkForReservedFieldName();
      });
    });
    describe('when passing valid args', () => {
      describe('with a valid class name', () => {
        it("doesn't fail", () => {
          checkForReservedFieldName({
            name: 'name',
            databaseTypeName: 'sql',
            shouldThrow: true
          });
        });
      });
      describe('with an invalid class name', () => {
        describe('with the shouldThrow flag to true', () => {
          it('fails', () => {
            try {
              checkForReservedFieldName({
                name: 'continue',
                databaseTypeName: 'sql',
                shouldThrow: true
              });
              fail();
            } catch (error) {
              expect(error.name).to.eq('IllegalNameException');
            }
          });
        });
        describe('with the shouldThrow flag to false', () => {
          it("doesn't fail", () => {
            checkForReservedFieldName({
              name: 'continue',
              databaseTypeName: 'sql',
              shouldThrow: false
            });
          });
        });
      });
    });
  });
});
