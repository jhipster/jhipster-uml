'use strict';

var expect = require('chai').expect,
    ParserHelper = require('../../lib/editors/parser_helper');

describe('ParserHelper', function() {
  describe('isAnId', function() {
    describe(
      "when passing fields that match 'id', with non-sensitive case",
      function() {
        it('returns true', function() {
          expect(ParserHelper.isAnId('id', 'Class')).to.equal(true);
          expect(ParserHelper.isAnId('Id', 'Class')).to.equal(true);
          expect(ParserHelper.isAnId('iD', 'Class')).to.equal(true);
          expect(ParserHelper.isAnId('ID', 'Class')).to.equal(true);
        });
      });
    describe('when passing fields matching: className + Id', function() {
      it('returns true', function() {
        expect(ParserHelper.isAnId('classId', 'Class')).to.equal(true);
      });
    });
    describe('when passing fields matching: id + Another string', function() {
      it('returns true', function() {
        expect(ParserHelper.isAnId('idTest', 'TestClass')).to.equal(true);
      });
    });
    describe('when passing fields matching: a string + Id', function() {
      it('returns true', function() {
        expect(ParserHelper.isAnId('somethingId', 'TestClass')).to.equal(true);
      });
    });
  });
});
