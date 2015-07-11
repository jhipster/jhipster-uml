"use strict"

var DSLParser = require("../lib/dsl/dsl_parser"),
    chai = require('chai'),
    fs = require('fs'),
    pegParser = require('../lib/dsl/jhGrammar'),
    expect = chai.expect,
    SQLTypes = require('../lib/types/sql_types'),
    MongoDBTypes = require('../lib/types/mongodb_types'),
    CassandraTypes = require('../lib/types/cassandra_types');

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
  describe("initialized",function(){
    it('All attributs are set', function(){
      expect(parser.file).to.be.equal(fileName);
      expect(parser.databaseTypes).to.deep.equal(new SQLTypes());
      expect(parser.classes).to.deep.equal({});
      expect(parser.fields).to.deep.equal({});
      expect(parser.types).to.deep.equal({});
      expect(parser.injectedFields).to.deep.equal({});
      expect(parser.associations).to.deep.equal({});
    });

  });
  describe("#fillClassesAndFields", function(){
    describe("when the classes and fields are created",function(){
      before(function(){
       var jh = fs.readFileSync(parser.file).toString();
       parser.result = pegParser.parse(jh);
       parser.fillEnums();
       parser.fillClassesAndFields()
      });

      it("there is the expected number of classes",function(){
        expect(Object.keys(parser.classes).length).to.be.equal(7);
      });
      it("there is the expected number of field",function(){
        expect(Object.keys(parser.fields).length).to.be.equal(20);
      });
      it("the classe Object is well formed",function(){
        var classObj = parser.classes["Employee"];
        expect(classObj.name).to.be.equals('Employee');
        expect(classObj.fields.length).to.be.equals(7);
        //the property injectedFields is not set yet
        expect(classObj.injectedFields.length).to.be.equals(0);
      });
      it("the field Object is well formed",function(){
        var firstnameFields = parser.fields["Employee_firstName"];
        expect(firstnameFields.name).to.be.equals("firstName");
        expect(firstnameFields.type).to.be.equals("String");
        expect(firstnameFields.validations).to.deep.equal([]);
      });
    });

    describe("When a field has type not supported by JHipster",function(){
      it("thows an parsing exception",function(){
        try{
          var jh = fs.readFileSync(parserWrongType.file).toString();
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
        var jh = fs.readFileSync(parserEnum.file).toString();
       parserEnum.result = pegParser.parse(jh);
       expect(parserEnum.result.enums[0].name).to.be.equal("Language");
       expect(parserEnum.result.enums[0].values.length).to.be.equal(4);
      });

      it("the enum Object is well formed",function(){
       var jh = fs.readFileSync(parserEnum.file).toString();
       parserEnum.result = pegParser.parse(jh);
       parserEnum.fillEnums();
       parserEnum.fillClassesAndFields();

       expect(parserEnum.enums['Language'].name).to.be.equal("Language");
       expect(parserEnum.enums['Language'].values.length).to.be.equal(4);
       //expect(parserEnum.fields['language'].type)
     //  expect(parserEnum.fields['language'].validations)
      });

    });

  });

  describe("#fillAssociations", function(){

    describe("When the relationships are created",function(){
      before(function(){
        var jh = fs.readFileSync(parser.file).toString();
        parser.result = pegParser.parse(jh);
        parser.fillEnums();
        parser.fillClassesAndFields();
        parser.fillAssociations();
      });
      it("there is the expected number of relationships",function(){
        expect(Object.keys(parser.associations).length).to.be.equal(7);
      });
      it("the associations Object is well formed",function(){
        expect(parser.associations["Departement_to_Employee"].name).to.be.equal("departement");
        expect(parser.associations["Departement_to_Employee"].type).to.be.equal("Departement");
      });
      it("the injectedFields Object is well formed",function(){
        expect(parser.injectedFields["Departement_employee"].name).to.be.equal("employee");
        expect(parser.injectedFields["Departement_employee"].type).to.be.equal("Employee");
        expect(parser.injectedFields["Departement_employee"].association).to.be.equal("Departement_to_Employee");
        expect(parser.injectedFields["Departement_employee"].class).to.be.equal("Departement");
        expect(parser.injectedFields["Departement_employee"].cardinality).to.be.equal("one-to-many");
      });
      it("the injectedField id has been injected in the corresponding class", function(){
        expect(contains(parser.classes["Departement"].injectedFields,"Departement_employee")).to.be.equal(true);
      });
    });

    describe("When an entity in a relationship is not declared",function(){
      before(function(){
        var jh = fs.readFileSync(parserUndeclaredEntity.file).toString();
        parserUndeclaredEntity.result = pegParser.parse(jh);
        parserUndeclaredEntity.fillClassesAndFields();
      });

      it("thows an UndeclaredEntityExecption",function(){
        try{
          parserUndeclaredEntity.fillAssociations();
        }catch(error){
          expect(error.name).to.be.equal("UndeclaredEntityExecption");
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