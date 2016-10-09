'use strict';

const expect = require('chai').expect,
    EnumData = require('../../lib/data/enum_data');

describe('EnumData', () => {
  describe('#new', () => {
    describe('when not passing any argument', () => {
      it('does not fail', () => {
        new EnumData();
      });
      var data = new EnumData();

      it('sets the default values instead', () => {
        expect(data.name).to.eq('');
        expect(data.values).to.deep.eq([]);
      });
    });
    describe('when passing arguments', () => {
      var data = new EnumData({
        name: 'Abc',
        values: [1, 2]
      });

      it('sets them', () => {
        expect(data.name).to.eq('Abc');
        expect(data.values).to.deep.eq([1, 2]);
      });
    });
  });
});
