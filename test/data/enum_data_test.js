'use strict';

const expect = require('chai').expect,
    EnumData = require('../../lib/data/enum_data');

describe('EnumData', function () {
  describe('#new', function () {
    describe('when not passing any argument', function () {
      it('does not fail', function () {
        new EnumData();
      });
      it('sets the default values instead', function () {
        var data = new EnumData();
        expect(data.name).to.eq('');
        expect(data.values).to.deep.eq([]);
      });
    });
    describe('when passing arguments', function () {
      it('sets them', function () {
        var data = new EnumData({
          name: 'Abc',
          values: [1, 2]
        });
        expect(data.name).to.eq('Abc');
        expect(data.values).to.deep.eq([1, 2]);
      });
    });
  });
});