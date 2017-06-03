'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  ClassData = require('../../lib/data/class_data');

describe('ClassData', () => {
  describe('#new', () => {
    describe('when not passing any argument', () => {
      it('does not fail', () => {
        new ClassData();
      });
      it('sets the default values instead', () => {
        const data = new ClassData();
        expect(data.name).to.eq('');
        expect(data.comment).to.eq('');
        expect(data.dto).to.eq('no');
        expect(data.pagination).to.eq('no');
        expect(data.service).to.eq('no');
        expect(data.fields).to.deep.eq([]);
        expect(data.tableName).to.eq('');
      });
    });
    describe('when passing arguments', () => {
      const data = new ClassData({
        name: 'Abc',
        comment: '42',
        dto: 'yes',
        pagination: 'always',
        service: 'never',
        fields: [1, 2],
        tableName: 'something'
      });

      it('sets them', () => {
        expect(data.name).to.eq('Abc');
        expect(data.comment).to.eq('42');
        expect(data.dto).to.eq('yes');
        expect(data.pagination).to.eq('always');
        expect(data.service).to.eq('never');
        expect(data.fields).to.deep.eq([1, 2]);
        expect(data.tableName).to.eq('something');
      });
    });
    describe('when passing a reserved word', () => {
      describe('as class name', () => {
        it('fails', () => {
          try {
            new ClassData({
              name: 'Class',
              tableName: 'something'
            });
            fail();
          } catch (error) {
            expect(error.name).to.eq('IllegalNameException');
          }
        });
      });
      describe('as a table name', () => {
        it("doesn't fail", () => { // a warning is shown
          new ClassData({
            name: 'MyClass',
            tableName: 'ANALYZE'
          });
        });
      });
    });
  });
});
