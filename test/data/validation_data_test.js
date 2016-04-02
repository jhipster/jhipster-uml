'use strict';

const expect = require('chai').expect,
    ValidationData = require('../../lib/data/validation_data');

describe('ValidationData', function () {
  describe('#new', function () {
    describe('when not passing any argument', function () {
      it('does not fail', function () {
        new ValidationData();
      });
      it('sets the default values instead', function () {
        var data = new ValidationData();
        expect(data.name).to.eq('');
        expect(data.value).to.eq(null);
      });
    });
    describe('when passing arguments', function () {
      it('sets them', function () {
        var data = new ValidationData({name: 'Abc', value: 'def'});
        expect(data.name).to.eq('Abc');
        expect(data.value).to.eq('def');
      });
    });
  });
});