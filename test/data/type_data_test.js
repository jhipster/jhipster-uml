'use strict';

const expect = require('chai').expect,
    TypeData = require('../../lib/data/type_data');

describe('TypeData', function () {
  describe('#new', function () {
    describe('when not passing any argument', function () {
      it('does not fail', function () {
        new TypeData();
      });
      it('sets the default values instead', function () {
        var data = new TypeData();
        expect(data.name).to.eq('');
      });
    });
    describe('when passing arguments', function () {
      it('sets them', function () {
        var data = new TypeData({name: 'Abc'});
        expect(data.name).to.eq('Abc');
      });
    });
  });
});