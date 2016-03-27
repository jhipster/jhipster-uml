'use strict';

var expect = require('chai').expect,
    isAnId = require('../../lib/editors/parser_helper').isAnId,
    extractClassName = require('../../lib/editors/parser_helper').extractClassName;

describe('ParserHelper', function () {
  describe('#isAnId', function () {
    describe(
        "when passing fields that match 'id', with non-sensitive case",
        function () {
          it('returns true', function () {
            expect(isAnId('id')).to.equal(true);
            expect(isAnId('Id')).to.equal(true);
            expect(isAnId('iD')).to.equal(true);
            expect(isAnId('ID')).to.equal(true);
          });
        });
  });

  describe('#extractClassName', function () {
    describe("when passing a name in the form of 'ENTITY_NAME'", function () {
      it('returns it, plus the formatted table name', function () {
        var names = extractClassName('EntityName');
        expect(names.entityName).to.eq('EntityName');
        expect(names.tableName).to.eq('entity_name');
      });
    });
    describe("when passing a name in the form of 'ENTITY_NAME(TABLE_NAME)", function () {
      it('parses it and returns the right result', function () {
        var names = extractClassName('EntityName(table_name)');
        expect(names.entityName).to.eq('EntityName');
        expect(names.tableName).to.eq('table_name');
        names = extractClassName('EntityName ( table_name )');
        expect(names.entityName).to.eq('EntityName');
        expect(names.tableName).to.eq('table_name');
      });
    });
  });
});
