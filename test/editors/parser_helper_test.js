const expect = require('chai').expect;
const isAnId = require('../../lib/editors/parser_helper').isAnId;
const extractClassName = require('../../lib/editors/parser_helper').extractClassName;
const getXmlElementFromRawIndexes = require('../../lib/editors/parser_helper').getXmlElementFromRawIndexes;

describe('ParserHelper', () => {
  describe('#isAnId', () => {
    describe('when passing fields that match \'id\', with non-sensitive case', () => {
      it('returns true', () => {
        expect(isAnId('id')).to.equal(true);
        expect(isAnId('Id')).to.equal(true);
        expect(isAnId('iD')).to.equal(true);
        expect(isAnId('ID')).to.equal(true);
      });
    });
  });

  describe('#extractClassName', () => {
    describe('when passing a name in the form of \'ENTITY_NAME\'', () => {
      const names = extractClassName('EntityName');

      it('returns it, plus the formatted table name', () => {
        expect(names.entityName).to.eq('EntityName');
        expect(names.tableName).to.eq('entity_name');
      });
    });
    describe('when passing a name in the form of \'ENTITY_NAME(TABLE_NAME)', () => {
      let names = extractClassName('EntityName(table_name)');

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
    const root = {
      packagedElement: [
        { dumb: 'dumb' },
        {
          packagedElement: [
            { dumb: 'dumb' },
            { dumb: 'dumb' },
            { dumb: 'good' }
          ]
        }
      ]
    };
    const rawIndexes = [{ index: 2, path: [1] }];
    const xmlElt = getXmlElementFromRawIndexes(root, rawIndexes[0]);

    it('returns the right element', () => {
      expect(xmlElt.dumb).to.eq('good');
    });
  });
});
