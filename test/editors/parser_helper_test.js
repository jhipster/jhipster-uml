'use strict';

var expect = require('chai').expect,
    ParserHelper = require('../../lib/editors/parser_helper');

describe('ParserHelper', function() {
  describe('isAnId', function() {
    describe(
      "when passing fields that match 'id', with non-sensitive case",
      function() {
        it('returns true', function() {
          expect(ParserHelper.isAnId('id')).to.equal(true);
          expect(ParserHelper.isAnId('Id')).to.equal(true);
          expect(ParserHelper.isAnId('iD')).to.equal(true);
          expect(ParserHelper.isAnId('ID')).to.equal(true);
        });
      });
  });
});
