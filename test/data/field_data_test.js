'use strict';

const expect = require('chai').expect,
  FieldData = require('../../lib/data/field_data');

describe('FieldData', () => {
  describe('#new', () => {
    describe('when not passing any argument', () => {
      it('does not fail', () => {
        new FieldData();
      });
      const data = new FieldData();

      it('sets the default values instead', () => {
        expect(data.name).to.eq('');
        expect(data.comment).to.eq('');
        expect(data.type).to.eq('');
        expect(data.validations).to.deep.eq([]);
      });
    });
    describe('when passing arguments', () => {
      const data = new FieldData({
        name: 'Abc',
        comment: '42',
        type: 'None',
        validations: [1, 2]
      });

      it('sets them', function () {
        expect(data.name).to.eq('Abc');
        expect(data.comment).to.eq('42');
        expect(data.type).to.eq('None');
        expect(data.validations).to.deep.eq([1, 2]);
      });
    });
    describe('when passing a reserved word', () => {
      describe('as field name', () => {
        it("doesn't fail", () => { // a warning is shown though
          new FieldData({
            name: 'ANALYZE',
            type: 'None',
          });
        });
      });
    });
  });
});
