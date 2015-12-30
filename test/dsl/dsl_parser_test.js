"use strict"

var DSLParser = require("../../lib/dsl/dsl_parser"),
    fs = require('fs'),
    pegParser = require('../../lib/dsl/jhGrammar'),
    expect = require('chai').expect,
    fail = expect.fail,
    SQLTypes = require('../../lib/types/sql_types'),
    MongoDBTypes = require('../../lib/types/mongodb_types'),
    CassandraTypes = require('../../lib/types/cassandra_types');

var fileName = "test/jh/oracle.jh";
var parser = new DSLParser(fileName, initDatabaseTypeHolder('sql'));

/* The parser with an undeclared entity in a relationship */
var parserUndeclaredEntity = new DSLParser("test/jh/UndeclaredEntity.jh",
  initDatabaseTypeHolder('sql'));

/* The parser with a wrong type */
var parserWrongType = new DSLParser("test/jh/WrongType.jh",
  initDatabaseTypeHolder('sql'));

/* The parser with an enum */
var parserEnum = new DSLParser("test/jh/enum.jh",
  initDatabaseTypeHolder('sql'));


describe("DSL Parser", function(){
  describe("#fillClassesAndFields", function(){
    describe("when the classes and fields are created",function(){
      before(function(){
        var jh = fs.readFileSync(parser.root).toString();
        parser.result = pegParser.parse(jh);
        parser.fillEnums();
        parser.fillClassesAndFields();
      });

      it("there is the expected number of classes",function(){
        expect(Object.keys(parser.parsedData.classes).length).to.be.equal(7);
      });
      it("there is the expected number of field",function(){
        expect(Object.keys(parser.parsedData.fields).length).to.be.equal(20);
      });
      it("the class Object is well formed",function(){
        var classObj = parser.parsedData.classes["Employee"];
        expect(classObj.name).to.be.equals('Employee');
        expect(classObj.fields.length).to.be.equals(7);
        //the property injectedFields is not set yet
        expect(classObj.injectedFields.length).to.be.equals(0);
      });
      it("the field Object is well formed",function(){
        var firstNameFields = parser.parsedData.fields["Employee_firstName"];
        expect(firstNameFields.name).to.be.equals("firstName");
        expect(firstNameFields.type).to.be.equals("String");
        expect(firstNameFields.validations).to.deep.equal({});
      });
    });

    describe('when trying to add a field whose name is capitalized', function() {
      it('decapitalizes and adds it', function() {
        var otherParser = new DSLParser(
          'test/jh/capitalized_field_name.jh',
          initDatabaseTypeHolder('sql'));
        var jh = fs.readFileSync(otherParser.root).toString();
        parser.result = pegParser.parse(jh);
        parser.fillClassesAndFields();
        if (Object.keys(parser.parsedData.fields).length === 0) {
          fail();
        }
        Object.keys(parser.parsedData.fields).forEach(function(fieldData) {
          if (parser.parsedData.fields[fieldData].name.match('^[A-Z].*')) {
            fail();
          }
        });
      });
    });

    describe("When a field has a type not supported by JHipster",function(){
      it("throws an parsing exception",function(){
        try{
          var jh = fs.readFileSync(parserWrongType.root).toString();
          parserWrongType.result = pegParser.parse(jh);
          parserWrongType.fillEnums();
          parserWrongType.fillClassesAndFields();
        }catch(error){
          expect(error.name).to.be.equal("InvalidTypeException");
        }
      });
    });

    describe("When an enum is declared", function(){
      it("the enums in result are well formed",function(){
        var jh = fs.readFileSync(parserEnum.root).toString();
       parserEnum.result = pegParser.parse(jh);
       expect(parserEnum.result.enums[0].name).to.be.equal("Language");
       expect(parserEnum.result.enums[0].values.length).to.be.equal(4);
      });

      it("the enum Object is well formed",function(){
       var jh = fs.readFileSync(parserEnum.root).toString();
       parserEnum.result = pegParser.parse(jh);
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
        var jh = fs.readFileSync(parser.root).toString();
        parser.result = pegParser.parse(jh);
        parser.fillEnums();
        parser.fillClassesAndFields();
        parser.fillAssociations();
      });
      it("there is the expected number of relationships",function(){
        expect(Object.keys(parser.parsedData.associations).length).to.be.equal(7);
      });
      it("the associations Object is well formed",function(){
        expect(parser.parsedData.getAssociation("Department_employee_to_Employee_department").name).to.be.equal("department");
        expect(parser.parsedData.getAssociation("Department_employee_to_Employee_department").type).to.be.equal("Department");
      });
      it("the injectedFields Object is well formed",function(){
        expect(parser.parsedData.getInjectedField("Department_employee").name).to.be.equal("employee");
        expect(parser.parsedData.getInjectedField("Department_employee").type).to.be.equal("Employee");
        expect(parser.parsedData.getInjectedField("Department_employee").association).to.be.equal("Department_employee_to_Employee_department");
        expect(parser.parsedData.getInjectedField("Department_employee").class).to.be.equal("Department");
        expect(parser.parsedData.getInjectedField("Department_employee").cardinality).to.be.equal("one-to-many");
      });
      it("the injectedField id has been injected in the corresponding class", function(){
        expect(contains(parser.parsedData.getClass("Department").injectedFields,"Department_employee")).to.be.equal(true);
      });
    });

    describe("When an entity in a relationship is not declared",function(){
      before(function(){
        var jh = fs.readFileSync(parserUndeclaredEntity.root).toString();
        parserUndeclaredEntity.result = pegParser.parse(jh);
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
  });

});

function initDatabaseTypeHolder(databaseTypeName) {
  switch (databaseTypeName) {
    case 'sql':
      return new SQLTypes();
    case 'mongodb':
      return new MongoDBTypes();
    case 'cassandra':
      return new CassandraTypes();
    default:
      throw new WrongDatabaseTypeException(
        'The passed database type is incorrect. '
        + "Must either be 'sql', 'mongodb', or 'cassandra'. Got '"
        + databaseTypeName
        + "', exiting now.");
  }
}


function contains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}