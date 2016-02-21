"use strict"

var ParserFactory = require('../../lib/editors/parser_factory'),
    expect = require('chai').expect,
    fail = expect.fail,
    SQLTypes = require('../../lib/types/sql_types'),
    MongoDBTypes = require('../../lib/types/mongodb_types'),
    CassandraTypes = require('../../lib/types/cassandra_types');

var parser = ParserFactory.createParser({
  file: 'test/jh/oracle.jh',
  databaseType: 'sql'
});

/* The parser with an undeclared entity in a relationship */
var parserUndeclaredEntity = ParserFactory.createParser({
  file: 'test/jh/UndeclaredEntity.jh',
  databaseType: 'sql'
});

/* The parser with a wrong type */
var parserWrongType = ParserFactory.createParser({
  file: 'test/jh/WrongType.jh',
  databaseType: 'sql'
});

/* The parser with an enum */
var parserEnum = ParserFactory.createParser({
  file: 'test/jh/enum.jh',
  databaseType: 'sql'
});

describe("DSL Parser", function(){
  describe("#fillClassesAndFields", function(){
    describe("when the classes and fields are created",function(){
      before(function(){
        parser.fillEnums();
        parser.fillClassesAndFields();
      });

      it("there is the expected number of classes",function(){
        expect(Object.keys(parser.parsedData.classes).length).to.be.equal(8);
      });
      it("there is the expected number of field",function(){
        expect(Object.keys(parser.parsedData.fields).length).to.be.equal(28);
      });
      it("the class Object is well formed",function(){
        var classObj = parser.parsedData.classes["Employee"];
        expect(classObj.name).to.be.equals('Employee');
        expect(classObj.fields.length).to.be.equals(8);
      });
      it("the field Object is well formed",function(){
        var firstNameFields = parser.parsedData.fields["Employee_firstName"];
        expect(firstNameFields.name).to.be.equals("firstName");
        expect(firstNameFields.type).to.be.equals("String");
        expect(firstNameFields.validations).to.deep.equal([]);
      });
    });

    describe('when trying to add a field whose name is capitalized', function() {
      it('decapitalizes and adds it', function() {
        var otherParser = ParserFactory.createParser({
          file: 'test/jh/capitalized_field_name.jh',
          databaseType: 'sql'
        });
        otherParser.fillClassesAndFields();
        if (Object.keys(otherParser.parsedData.fields).length === 0) {
          fail();
        }
        Object.keys(otherParser.parsedData.fields).forEach(function(fieldData) {
          if (otherParser.parsedData.fields[fieldData].name.match('^[A-Z].*')) {
            fail();
          }
        });
      });
    });

    describe("When a field has a type not supported by JHipster",function(){
      it("throws an parsing exception",function(){
        try{
          parserWrongType.fillEnums();
          parserWrongType.fillClassesAndFields();
        }catch(error){
          expect(error.name).to.be.equal("InvalidTypeException");
        }
      });
    });

    describe("When an enum is declared", function(){
      it("the enums in result are well formed",function(){
       expect(parserEnum.result.enums[0].name).to.be.equal("Language");
       expect(parserEnum.result.enums[0].values.length).to.be.equal(4);
      });

      it("the enum Object is well formed",function(){
       parserEnum.fillEnums();
       parserEnum.fillClassesAndFields();

       expect(parserEnum.parsedData.getEnum('Language').name).to.be.equal("Language");
       expect(parserEnum.parsedData.getEnum('Language').values.length).to.be.equal(4);
      });

    });

  });

  describe("#fillAssociations", function(){
    describe("When the relationships are created",function(){
      before(function(){
        parser.fillEnums();
        parser.fillClassesAndFields();
        parser.fillAssociations();
      });
      it("there is the expected number of relationships",function(){
        expect(Object.keys(parser.parsedData.associations).length).to.be.equal(10);
      });
      it("the associations Object is well formed",function(){
        expect(parser.parsedData.getAssociation("Department_employee_to_Employee_null").from).to.be.equal("Department");
        expect(parser.parsedData.getAssociation("Department_employee_to_Employee_null").type).to.be.equal("one-to-many");
      });
    });

    describe("When an entity in a relationship is not declared",function(){
      before(function(){
        parserUndeclaredEntity.fillClassesAndFields();
      });

      it("throws an UndeclaredEntityException",function(){
        try{
          parserUndeclaredEntity.fillAssociations();
        }catch(error){
          expect(error.name).to.be.equal("UndeclaredEntityException");
        }
      });
    });

    describe('when generating entities with options', function() {
      describe("and using the '*' keyword", function() {
        it('assigns the option for each entity', function() {
          var parser = ParserFactory.createParser({
            file: 'test/jh/all_keyword_1.jh',
            databaseType: 'sql'
          });
          var parsedData = parser.parse();
          expect(Object.keys(parsedData.classes).length).to.eq(3);
          Object.keys(parsedData.classes).forEach(function(className) {
            expect(parsedData.getClass(className).dto).to.eq('mapstruct');
            expect(parsedData.getClass(className).pagination).to.eq('pager');
            expect(parsedData.getClass(className).service).to.eq('serviceClass');
          });
        });
      });
      describe("and using the 'all' keyword", function() {
        it('assigns the option for each entity', function() {
          var parser = ParserFactory.createParser({
            file: 'test/jh/all_keyword_2.jh',
            databaseType: 'sql'
          });
          var parsedData = parser.parse();
          expect(Object.keys(parsedData.classes).length).to.eq(3);
          Object.keys(parsedData.classes).forEach(function(className) {
            expect(parsedData.getClass(className).dto).to.eq('mapstruct');
            expect(parsedData.getClass(className).pagination).to.eq('pager');
            expect(parsedData.getClass(className).service).to.eq('serviceClass');
          });
        });
      });
      describe("and using the 'except' keyword", function() {
        it("doesn't the option to the excluded entity", function() {
          var parser = ParserFactory.createParser({
            file: 'test/jh/except_keyword.jh',
            databaseType: 'sql'
          });
          var parsedData = parser.parse();
          expect(Object.keys(parsedData.classes).length).to.eq(3);
          expect(parsedData.getClass('A').dto).to.eq('no');
          expect(parsedData.getClass('B').dto).to.eq('no');
          expect(parsedData.getClass('C').dto).to.eq('mapstruct');
          expect(parsedData.getClass('A').pagination).to.eq('pager');
          expect(parsedData.getClass('B').pagination).to.eq('no');
          expect(parsedData.getClass('C').pagination).to.eq('no');
          expect(parsedData.getClass('A').service).to.eq('no');
          expect(parsedData.getClass('B').service).to.eq('serviceClass');
          expect(parsedData.getClass('C').service).to.eq('no');
        });
      });
    });
  });
});

function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}