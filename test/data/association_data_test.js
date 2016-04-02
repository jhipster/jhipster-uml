'use strict';

const expect = require('chai').expect,
    AssociationData = require('../../lib/data/association_data');

describe('AssociationData', function () {
  describe('#new', function () {
    describe('when not passing any argument', function () {
      it('does not fail', function () {
        new AssociationData();
      });
      it('sets the default values instead', function () {
        var data = new AssociationData();
        expect(data.from).to.eq(null);
        expect(data.to).to.eq(null);
        expect(data.injectedFieldInFrom).to.eq(null);
        expect(data.injectedFieldInTo).to.eq(null);
        expect(data.commentInTo).to.eq('');
        expect(data.commentInFrom).to.eq('');
        expect(data.type).to.eq('');
      });
    });
    describe('when passing arguments', function () {
      it('sets them', function () {
        var data = new AssociationData({
          from: '1',
          to: '2',
          injectedFieldInFrom: '3',
          injectedFieldInTo: '4',
          commentInTo: '5',
          commentInFrom: '6',
          type: '7'
        });
        expect(data.from).to.eq('1');
        expect(data.to).to.eq('2');
        expect(data.injectedFieldInFrom).to.eq('3');
        expect(data.injectedFieldInTo).to.eq('4');
        expect(data.commentInTo).to.eq('5');
        expect(data.commentInFrom).to.eq('6');
        expect(data.type).to.eq('7');
      });
    });
  });
});