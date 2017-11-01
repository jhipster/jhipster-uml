/* eslint-disable no-new,no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const ClassData = require('../../lib/data/class_data');

describe('ClassData', () => {
  describe('#new', () => {
    describe('when not passing any argument', () => {
      it('does not fail', () => {
        new ClassData();
      });
      it('sets the default values instead', () => {
        const data = new ClassData();
        expect(data.name).to.equal('');
        expect(data.comment).to.equal('');
        expect(data.dto).to.equal('no');
        expect(data.pagination).to.equal('no');
        expect(data.service).to.equal('no');
        expect(data.fields).to.deep.equal([]);
        expect(data.tableName).to.equal('');
        expect(data.fluentMethods).to.be.true;
        expect(data.jpaMetamodelFiltering).to.be.false;
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
        expect(data.name).to.equal('Abc');
        expect(data.comment).to.equal('42');
        expect(data.dto).to.equal('yes');
        expect(data.pagination).to.equal('always');
        expect(data.service).to.equal('never');
        expect(data.fields).to.deep.eq([1, 2]);
        expect(data.tableName).to.equal('something');
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
            expect(error.name).to.equal('IllegalNameException');
          }
        });
      });
      describe('as a table name', () => {
        it('doesn\'t fail', () => { // a warning is shown
          new ClassData({
            name: 'MyClass',
            tableName: 'ANALYZE'
          });
        });
      });
    });
  });
});
