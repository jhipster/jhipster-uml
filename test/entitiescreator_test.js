'use strict';

var chai = require('chai'),
    expect = chai.expect,
    EntitiesCreator = require('../entitiescreator'),
    XMIParser = require('../xmiparser');

var parser = new XMIParser('./test/modelio.xmi', 'sql');
parser.parse();
var creator = new EntitiesCreator(parser);

/* The variables set to do all the constraints */
var parserConstrainte = new XMIParser('./test/test_constraint.xmi', 'sql');
parserConstrainte.parse();
var creatorConstrainte = new EntitiesCreator(parserConstrainte);

describe('EntitiesCreator ', function(){
  describe('#initialize ', function(){
    describe('when passing valid argument ', function(){
      it('Successfully initialize Entities Parser', function(){
        var creator = new EntitiesCreator(parser);
      });
      it('initializes each of its attributes', function() {
        expect(creator.getPrimitiveTypes()).to.deep.equal(parser.getPrimitiveTypes());
        expect(creator.getClasses()).to.deep.equal(parser.getClasses());
        expect(creator.getFields()).to.deep.equal(parser.getFields());
        expect(creator.getInjectedFields()).to.deep.equal(parser.getInjectedFields());
        expect(creator.getAssociations()).to.deep.equal(parser.getAssociations());

        expect(creator.getEntities()).to.deep.equal({});
      });
    });
    describe('when passing invalid argument', function(){  
      describe('when passing a null argument',function(){
        it('throws an exception',function(){
          try{
            new EntitiesCreator(null);
            fail();
          }catch(error){
            expect(error.name).to.equal('NullArgumentException');
          }
        });
      });
    });
  });
  describe( '#creatEntities', function(){
    
    describe('#initializeEntities', function(){
      before(function(){
          creator.initializeEntities();
      });
      describe('when we intialize Entities', function(){
        it('there are as many Entities as Classes',function(){
          expect(creator.getEntities.length).equal(creator.getClasses.length);
        });
      });
    });


    describe('#setFieldsOfEntity',function(){
      var firstClassId;
      var fields;
      before(function(){
        firstClassId = Object.keys(creatorConstrainte.getClasses())[0];
        creatorConstrainte.initializeEntities();
        creatorConstrainte.setFieldsOfEntity(firstClassId);
        fields = creatorConstrainte.getEntities()[firstClassId].fields
      });

      describe("when fields trying to access an entity field ",function(){
        var field
        before(function(){
          field = fields[0];
        });

        it("has fieldId property",function(){
          expect(field.fieldId).to.be.defined;
        });

        it("has fieldName property",function(){
          expect(field.fieldName).to.be.defined;
        });

        it("has fieldType property",function(){
          expect(field.fieldType).to.be.defined;
        });

        it("has fieldValidate property",function(){
          expect(field.fieldValidate).to.be.defined;
        });

      });

      /**
       * Here we check the validation gestion, for that purpose we created
       *   a xmi of a class Contrainte with 4 attributs, each with differente 
       *   constraints:
       *   - notTooSmall [ required , minlength : 4 ]
       *   - notTooBig [maxlength : 10]
       *   - onlyRequired [ required ]
       *   - noConstraint []
       */
      describe("#setValidationsOfField: ",function(){
        describe('when field has no validation', function(){
          it('fieldValidate is false',function(){
            for(var i in fields){
              var field = fields[i];
              if(field.fieldName == "noContraint"){
                expect(field.fieldValidate).to.be.equal(false);
              }
            //  expect(true).equal(true);
            }
          });

          it('fieldValidateRules is undefined',function(){
            for(var i in fields){
              var field = fields[i];
              if(field.fieldName == "noContraint"){
                expect(field.fieldValidateRules).to.be.undefined;
              }
            //  expect(true).equal(true);
            }
          });

        });
        describe('when field has a required validation', function(){
          it('fieldValidate is true',function(){
            for(var i in fields){
              var field = fields[i];
              if(field.fieldName == "notTooSmall" || field.fieldName == "onlyRequired" ){
                expect(field.fieldValidate).to.be.equal(true);
              }
              //expect(true).equal(true);
            }
          });
          it('has a \'required\' string in fieldValidateRules',function(){
            for(var i in fields){
              var field = fields[i];
              if(field.fieldName == "notTooSmall" || field.fieldName == "onlyRequired" )
                expect(contains(field.fieldValidateRules,"required")).to.be.equal(true);
            }
          });
        });
      

      describe('when field has a maxlength validation', function(){
          it('fieldValidate is true',function(){
            for(var i in fields){
              var field = fields[i];
              if(field.fieldName == "notTooBig"){
                expect(field.fieldValidate).to.be.equal(true);
              }
            }
          });
          it('has a \'maxlength\' string in fieldValidateRules',function(){
            for(var i in fields){
              var field = fields[i];
              if(field.fieldName == "notTooBig" ){
                expect(contains(field.fieldValidateRules, "maxlength")).to.be.equal(true);
              }
            }
          });
          it('has a fieldValidateRulesMax with a value of 10',function(){
            for(var i in fields){
              var field = fields[i];
              if(field.fieldName == "notTooBig" ){
                expect(field.fieldValidateRulesMax == "10").to.be.equal(true);
              }
            }
          });
        });

        describe('when field has a minlength validation', function(){
          it('fieldValidate is true',function(){
            for(var i in fields){
              var field = fields[i];
              if(field.fieldName == "notTooSmall"){
                expect(field.fieldValidate).to.be.equal(true);
              }
            }
          });
          it('has a \'minlength\' string in fieldValidateRules',function(){
            for(var i in fields){
              var field = fields[i];
              if(field.fieldName == "notTooSmall" ){
                expect( contains(field.fieldValidateRules,"minlength")).to.be.equal(true);
              }
            }
          });
          it('has a fieldValidateRulesMin with a value of 4',function(){
            for(var i in fields){
              var field = fields[i];
              if(field.fieldName == "notTooSmall" ){
                expect(field.fieldValidateRulesMin == "4").to.be.equal(true);
              }
            }
          });
        });
      });
    
    describe('#setRelationshipOfEntity',function(){
      var employeeToJob; // relation one to one owner
      var departmentToEmployee; // relation one to many
      var jobToTask; // relation many to many owner
      var jobToEmployee; // relation one to one not owner
      var taskToJob; // relation many to many not owner
      var employeeToDepartment; // relation many to one
      var entities;
      before(function(){
          creator.createEntities();

          entities = creator.getEntities();
          
          //for ( var i=0; i<entities.length; i++){
          for(var i in Object.keys(entities) ){
            var classId = Object.keys(entities)[i];
            var relationships = entities[classId].relationships;
            if( creator.getClasses()[classId].name == "Employee"){
              for(var j=0; j<relationships.length; j++ ){
                if(relationships[j].otherEntityNameCapitalized == "Job"){
                  employeeToJob = relationships[j];
                }else if(relationships[j].otherEntityNameCapitalized == "Department"){
                  employeeToDepartment = relationships[j];
                }
              }
            }else if(creator.getClasses()[classId].name == "Department"){
              for(var j=0; j<relationships.length; j++ ){
                if(relationships[j].otherEntityNameCapitalized == "Employee"){
                  departmentToEmployee = relationships[j];
                }
              }
            }else if(creator.getClasses()[classId].name == "Job"){
              for(var j=0; j<relationships.length; j++ ){
                if(relationships[j].otherEntityNameCapitalized == "Employee"){
                  jobToEmployee = relationships[j];
                }else if(relationships[j].otherEntityNameCapitalized == "Task"){
                  jobToTask = relationships[j];
                }
              }
            }else if(creator.getClasses()[classId].name == "Task"){
              for(var j=0; j<relationships.length; j++ ){
                if(relationships[j].otherEntityNameCapitalized == "Job"){
                  taskToJob = relationships[j];
                }
              }
            }
          }
      });

      describe("when trying to access a relationships", function(){
        
        describe('Employee to Job: One to one owner side', function(){
          it("has a ownerSide property at true ",function(){
            expect(employeeToJob.ownerSide).to.be.equal(true);
          });
          it("has a one-to-one relationships type",function(){
            expect(employeeToJob.relationshipType).to.be.equal("one-to-one");
          });
        });

        describe('Job to Employee: One-to-One not owner side', function(){
          it("has a ownerSide property at false",function(){
            expect(jobToEmployee.ownerSide).to.be.equal(false);
          });
          it("has a one-to-one relationships type",function(){
            expect(jobToEmployee.relationshipType).to.be.equal("one-to-one");
          });
        });

        describe('Department to Employee : One to Many', function(){
          it("has a one-to-many relationships type",function(){
            expect(departmentToEmployee.relationshipType).to.be.equal("one-to-many");
          });
          it("has no ownerSide property",function(){
            expect(departmentToEmployee.ownerSide).to.be.undefined;
          });
        });

        describe('Employee to Department : Many to One', function(){
          it("has a many-to-one relationships type",function(){
            expect(employeeToDepartment.relationshipType).to.be.equal("many-to-one");
          });
          it("has no ownerSide property",function(){
            expect(employeeToDepartment.ownerSide).to.be.undefined;
          });
        });

        describe('Job to Task : Many to Many owner side', function(){
          it("has a ownerSide property at true ",function(){
            expect(jobToTask.ownerSide).to.be.equal(true);
          });
          it("has a many-to-many relationships type",function(){
            expect(jobToTask.relationshipType).to.be.equal("many-to-many");
          });
        });

        describe('Task to Job: Many to Many not owner side', function(){
          it("has a ownerSide property at false ",function(){
            expect(taskToJob.ownerSide).to.be.equal(false);
          });
          it("has a many-to-many relationships type",function(){
            expect(taskToJob.relationshipType).to.be.equal("many-to-many");
          });
        });

      });

    });

    });
  });
});

//contains methode definition
function contains(array, elem)
{
   for (var i in array)
   {
       if (array[i] == elem) return true;
   }
   return false;
}
