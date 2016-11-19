'use strict';

var expect = require('chai').expect,
    isAnId = require('../../lib/editors/parser_helper').isAnId,
    extractClassName = require('../../lib/editors/parser_helper').extractClassName,
    getXmlElementFromRawIndexes = require('../../lib/editors/parser_helper').getXmlElementFromRawIndexes;

describe('ParserHelper', () => {
  describe('#isAnId', () => {
    describe("when passing fields that match 'id', with non-sensitive case", () => {
      it('returns true', () => {
        expect(isAnId('id')).to.equal(true);
        expect(isAnId('Id')).to.equal(true);
        expect(isAnId('iD')).to.equal(true);
        expect(isAnId('ID')).to.equal(true);
      });
    });
  });

  describe('#extractClassName', () => {
    describe("when passing a name in the form of 'ENTITY_NAME'", () => {
      var names = extractClassName('EntityName');

      it('returns it, plus the formatted table name', () => {
        expect(names.entityName).to.eq('EntityName');
        expect(names.tableName).to.eq('entity_name');
      });
    });
    describe("when passing a name in the form of 'ENTITY_NAME(TABLE_NAME)", () => {
      var names = extractClassName('EntityName(table_name)');

      it('parses it and returns the right result', () => {
        expect(names.entityName).to.eq('EntityName');
        expect(names.tableName).to.eq('table_name');
        names = extractClassName('EntityName ( table_name )');
        expect(names.entityName).to.eq('EntityName');
        expect(names.tableName).to.eq('table_name');
      });
    });
  });
  describe('#getXmlElementFromRawIndexes', () => {
    var root = {
      packagedElement: [
        {dumb: 'dumb'},
        {
          packagedElement: [
            {dumb: 'dumb'},
            {dumb: 'dumb'},
            {dumb: 'good'}
          ]
        }
      ]
    };
    var rawIndexes = [{index: 2, path: [1]}];
    var xmlElt = getXmlElementFromRawIndexes(root, rawIndexes[0]);

    it('returns the right element', () => {
      expect(xmlElt.dumb).to.eq('good');
    });
  });
});
