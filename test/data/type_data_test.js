'use strict';

const expect = require('chai').expect,
  TypeData = require('../../lib/data/type_data');

describe('TypeData', () => {
  describe('#new', () => {
    describe('when not passing any argument', () => {
      it('does not fail', () => {
        new TypeData();
      });
      const data = new TypeData();

      it('sets the default values instead', () => {
        expect(data.name).to.eq('');
      });
    });
    describe('when passing arguments', () => {
      const data = new TypeData({name: 'Abc'});

      it('sets them', () => {
        expect(data.name).to.eq('Abc');
      });
    });
  });
});
