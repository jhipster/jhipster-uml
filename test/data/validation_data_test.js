'use strict';

const expect = require('chai').expect,
    ValidationData = require('../../lib/data/validation_data');

describe('ValidationData', () => {
  describe('#new', () => {
    describe('when not passing any argument', () => {
      it('does not fail', () => {
        new ValidationData();
      });
      var data = new ValidationData();

      it('sets the default values instead', () => {
        expect(data.name).to.eq('');
        expect(data.value).to.eq(null);
      });
    });
    describe('when passing arguments', () => {
      var data = new ValidationData({name: 'Abc', value: 'def'});

      it('sets them', () => {
        expect(data.name).to.eq('Abc');
        expect(data.value).to.eq('def');
      });
    });
  });
});
