/* eslint-disable no-new,no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const ClassData = require('../../lib/data/class_data');

describe('ClassData', () => {
  describe('#new', () => {
    context('when not passing any argument', () => {
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
        expect(data.microserviceName).to.be.undefined;
        expect(data.searchEngine).to.be.undefined;
      });
    });
    context('when passing arguments', () => {
      const data = new ClassData({
        name: 'Abc',
        comment: '42',
        dto: 'yes',
        pagination: 'always',
        service: 'never',
        fields: [1, 2],
        tableName: 'something',
        microserviceName: 'toto',
        searchEngine: 'titi'
      });

      it('sets them all', () => {
        expect(data).to.deep.equal({
          name: 'Abc',
          comment: '42',
          dto: 'yes',
          pagination: 'always',
          service: 'never',
          fields: [1, 2],
          tableName: 'something',
          microserviceName: 'toto',
          searchEngine: 'titi',
          fluentMethods: true,
          jpaMetamodelFiltering: false
        });
      });
    });
    context('when passing a reserved word', () => {
      context('as class name', () => {
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
      context('as a table name', () => {
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
