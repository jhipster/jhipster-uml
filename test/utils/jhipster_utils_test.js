'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    checkForReservedClassName = require('../../lib/utils/jhipster_utils').checkForReservedClassName,
    checkForReservedTableName = require('../../lib/utils/jhipster_utils').checkForReservedTableName,
    checkForReservedFieldName = require('../../lib/utils/jhipster_utils').checkForReservedFieldName;

describe('JHipsterUtils', function () {
  describe('::checkForReservedClassName', function () {
    describe('when passing no arg', function () {
      it("doesn't fail", function () {
        checkForReservedClassName();
      });
    });
    describe('when passing valid args', function() {
      describe('with a valid class name', function() {
        it("doesn't fail", function() {
          checkForReservedClassName({
            name: 'Job',
            databaseTypeName: 'sql',
            shouldThrow: true
          });
        });
      });
      describe('with an invalid class name', function() {
        describe('with the shouldThrow flag to true', function() {
          it('fails', function() {
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
        describe('with the shouldThrow flag to false', function() {
          it("doesn't fail", function() {
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
  describe('::checkForReservedTableName', function () {
    describe('when passing no arg', function () {
      it("doesn't fail", function () {
        checkForReservedTableName();
      });
    });
    describe('when passing valid args', function() {
      describe('with a valid class name', function() {
        it("doesn't fail", function() {
          checkForReservedTableName({
            name: 'Job',
            databaseTypeName: 'sql',
            shouldThrow: true
          });
        });
      });
      describe('with an invalid class name', function() {
        describe('with the shouldThrow flag to true', function() {
          it('fails', function() {
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
        describe('with the shouldThrow flag to false', function() {
          it("doesn't fail", function() {
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
  describe('::checkForReservedFieldName', function () {
    describe('when passing no arg', function () {
      it("doesn't fail", function () {
        checkForReservedFieldName();
      });
    });
    describe('when passing valid args', function() {
      describe('with a valid class name', function() {
        it("doesn't fail", function() {
          checkForReservedFieldName({
            name: 'name',
            databaseTypeName: 'sql',
            shouldThrow: true
          });
        });
      });
      describe('with an invalid class name', function() {
        describe('with the shouldThrow flag to true', function() {
          it('fails', function() {
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
        describe('with the shouldThrow flag to false', function() {
          it("doesn't fail", function() {
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
