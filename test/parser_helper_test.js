'use strict';

var chai = require('chai'),
    expect = chai.expect,
    ParserHelper = require('../lib/editors/parser_helper');

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
  });

  describe('#getCardinality', function() {
    describe('#isOneToOne', function() {
      describe('when passing valid parameters', function() {
        it('returns true', function() {
          expect(ParserHelper.isOneToOne(false, false)).to.equal(true);
        });
      });
      describe('when passing invalid parameters', function() {
        it('returns false', function() {
          expect(ParserHelper.isOneToOne(true, true)).to.equal(false);
          expect(ParserHelper.isOneToOne(true, false)).to.equal(false);
          expect(ParserHelper.isOneToOne(false, true)).to.equal(false);
        });
      });
    });
    describe('#isOneToMany', function() {
      describe('when passing valid parameters', function() {
        it('returns true', function() {
          expect(ParserHelper.isOneToMany(true, false)).to.equal(true);
          expect(ParserHelper.isOneToMany(false, true)).to.equal(true);
        });
      });
      describe('when passing invalid parameters', function() {
        it('returns false', function() {
          expect(ParserHelper.isOneToMany(true, true)).to.equal(false);
          expect(ParserHelper.isOneToMany(false, false)).to.equal(false);
        });
      });
    });
    describe('#isManyToMany', function() {
      describe('when passing valid parameters', function() {
        it('returns true', function() {
          expect(ParserHelper.isManyToMany(true, true)).to.equal(true);
        });
      });
      describe('when passing invalid parameters', function() {
        it('returns false', function() {
          expect(ParserHelper.isManyToMany(false, false)).to.equal(false);
          expect(ParserHelper.isManyToMany(false, true)).to.equal(false);
          expect(ParserHelper.isManyToMany(true, false)).to.equal(false);
        });
      });
    });
  });
});
