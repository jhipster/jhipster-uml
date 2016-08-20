'use strict';

const expect = require('chai').expect,
    FieldData = require('../../lib/data/field_data');

describe('FieldData', function () {
  describe('#new', function () {
    describe('when not passing any argument', function () {
      it('does not fail', function () {
        new FieldData();
      });
      it('sets the default values instead', function () {
        var data = new FieldData();
        expect(data.name).to.eq('');
        expect(data.comment).to.eq('');
        expect(data.type).to.eq('');
        expect(data.validations).to.deep.eq([]);
      });
    });
    describe('when passing arguments', function () {
      it('sets them', function () {
        var data = new FieldData({
          name: 'Abc',
          comment: '42',
          type: 'None',
          validations: [1, 2]
        });
        expect(data.name).to.eq('Abc');
        expect(data.comment).to.eq('42');
        expect(data.type).to.eq('None');
        expect(data.validations).to.deep.eq([1, 2]);
      });
    });
    describe('when passing a reserved word', function() {
      describe('as field name', function() {
        it("doesn't fail", function() { // a warning is shown though
          new FieldData({
            name: 'ANALYZE',
            type: 'None',
          });
        });
      });
    });
  });
});