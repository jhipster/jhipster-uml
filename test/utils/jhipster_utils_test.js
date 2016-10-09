'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    checkForReservedClassName = require('../../lib/utils/jhipster_utils').checkForReservedClassName,
    checkForReservedTableName = require('../../lib/utils/jhipster_utils').checkForReservedTableName,
    checkForReservedFieldName = require('../../lib/utils/jhipster_utils').checkForReservedFieldName;

describe('JHipsterUtils', () => {
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
