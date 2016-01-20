'use strict';

var expect = require('chai').expect,
    EntitiesCreator = require('../lib/entitiescreator'),
    ParserFactory = require('../lib/editors/parser_factory');

var parser = ParserFactory.createParser('./test/xmi/modelio.xmi', 'sql');
var creator = new EntitiesCreator(parser.parse(), parser.databaseTypes, [], {}, {});

/* The variables set to do all the constraints */
var parserConstraint =
  ParserFactory.createParser('./test/xmi/test_constraint.xmi', 'sql');
var creatorConstraint =
  new EntitiesCreator(parserConstraint.parse(), parserConstraint.databaseTypes, [], {}, {});

/* the entity creator set to do the User Entity tests */
var parserUser =
  ParserFactory.createParser('./test/xmi/user_entity_test.xmi', 'sql');
var creatorUser =
  new EntitiesCreator(parserUser.parse(), parserUser.databaseTypes, [], {}, {});

/* the entity creator set to do the User Entity tests */
var parserUserWrong =
  ParserFactory.createParser('./test/xmi/user_entity_wrong_side_relationship.xmi', 'sql');
var creatorUserWrong =
  new EntitiesCreator(parserUserWrong.parse(), parserUserWrong.databaseTypes, [], {}, {});


describe('EntitiesCreator ', function(){
  describe('#initialize ', function(){
    describe('when passing valid argument ', function(){
      it('Successfully initialize Entities Parser', function(){
        try {
          new EntitiesCreator(creator.parsedData, parser.databaseTypes, [], {}, {});
        } catch (error) {
          fail();
        }
      });
      it('initializes each of its attributes', function() {
        expect(creator.getPrimitiveTypes()).to.deep.equal(parser.parsedData.types);
        expect(creator.getClasses()).to.deep.equal(parser.parsedData.classes);
        expect(creator.getFields()).to.deep.equal(parser.parsedData.fields);
        expect(creator.getAssociations()).to.deep.equal(parser.parsedData.associations);

        expect(creator.getEntities()).to.deep.equal({});
      });
      it('initializes each of its attributes', function() {
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
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });
    });
  });
  describe( '#createEntities', function(){

    describe('#initializeEntities', function(){
      before(function(){
        creator.initializeEntities();
        creatorUser.initializeEntities();
      });
      describe('when we initialize Entities', function(){
        it('there are as many Entities as Classes',function(){
          expect(creator.getEntities().length).equal(creator.getClasses().length);
        });
        it('all entities attributes are set',function(){
          expect(creator.getEntities()['_0iCzELieEeW4ip1mZlCqPg'].changelogDate).to.be.defined;
          expect(creator.getEntities()['_0iCzELieEeW4ip1mZlCqPg'].dto).to.be.defined;
          expect(creator.getEntities()['_0iCzELieEeW4ip1mZlCqPg'].pagination).to.be.defined;
          expect(creator.getEntities()['_0iCzELieEeW4ip1mZlCqPg'].javadoc).to.be.defined;
        });
      });
    });


    describe('#setFieldsOfEntity',function(){
      var firstClassId;
      var fields;

      before(function(){
        firstClassId = Object.keys(creatorConstraint.getClasses())[0];
        creatorConstraint.initializeEntities();
        creatorConstraint.setFieldsOfEntity(firstClassId);
        fields = creatorConstraint.getEntities()[firstClassId].fields;
      });

      describe('when dealing with blobs', function() {
        var otherParser =
          ParserFactory.createParser('./test/xmi/modelio_blob.xmi', 'sql');
        var otherCreator =
          new EntitiesCreator(otherParser.parse(), otherParser.databaseTypes, [], {}, {});
        otherCreator.createEntities();

        it('changes the type of blob fields from Blob to byte[]', function() {
          Object.keys(otherCreator.getEntities()).forEach(function(element) {
            otherCreator.getEntities()[element].fields.forEach(function(field) {
              expect(field.type).not.to.equal('Blob');
              expect(field.type).not.to.equal('AnyBlob');
              expect(field.type).not.to.equal('ImageBlob');
            });
          });
        });

        it('fills the blob type attribute', function() {
          Object.keys(otherCreator.getEntities()).forEach(function(element) {
            otherCreator.getEntities()[element].fields.forEach(function(field) {
              expect(field.fieldTypeBlobContent).to.match(/image|any/);
            });
          });
        });
      });

      describe('when creating enums', function() {
        var otherParser = ParserFactory.createParser(
          './test/xmi/modelio_enum_test.xmi',
          'sql');
        var otherCreator = new EntitiesCreator(otherParser.parse(), otherParser. databaseTypes, [], {}, {});
        otherCreator.createEntities();

        var enumFields;

        Object.keys(otherCreator.entities).forEach(function(element) {
          enumFields = otherCreator.entities[element].fields;
        });
      });

      describe('when fields trying to access an entity field ', function(){
        var field;
        before(function(){
          field = fields[0];
        });

        it('has fieldId property',function(){
          expect(field.fieldId).to.be.defined;
        });

        it('has fieldName property',function(){
          expect(field.fieldName).to.be.defined;
        });

        it('has fieldType property',function(){
          expect(field.fieldType).to.be.defined;
        });

        it('has fieldValidate property',function(){
          expect(field.fieldValidate).to.be.defined;
        });

      });

      /**
       * Here we check the validation gestion, for that purpose we created
       *   a xmi of a class constraint with 4 attributs, each with different
       *   constraints:
       *   - notTooSmall [ required , minlength : 4 ]
       *   - notTooBig [maxlength : 10]
       *   - onlyRequired [ required ]
       *   - noConstraint []
       */
      describe('#setValidationsOfField: ',function(){
        describe('when field has no validation', function(){
          it('fieldValidate is false',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === 'noContraint'){
                  expect(field.fieldValidate).to.equal(false);
                }
              }
            }
          });

          it('fieldValidateRules is undefined',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === 'noContraint'){
                  expect(field.fieldValidateRules).to.be.undefined;
                }
              }
            }
          });

        });
        describe('when field has a required validation', function(){
          it('has a \'required\' string in fieldValidateRules',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === 'notTooSmall' || field.fieldName === 'onlyRequired' ) {
                  expect(field.fieldValidateRules.indexOf('required')).not.to.equal(-1);
                }
              }
            }
          });
        });


        describe('when field has a maxlength validation', function(){
          it('has a \'maxlength\' string in fieldValidateRules',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === 'notTooBig' ){
                  expect(field.fieldValidateRules.indexOf('maxlength')).not.to.equal(-1);
                }
              }
            }
          });
          it('has a fieldValidateRulesMax with a value of 10',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === 'notTooBig' ){
                  expect(field.fieldValidateRulesMaxlength === '10').to.equal(true);
                }
              }
            }
          });
        });

        describe('when field has a minlength validation', function(){
          it('has a \'minlength\' string in fieldValidateRules',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === 'notTooSmall' ){
                  expect(field.fieldValidateRules.indexOf('minlength')).not.to.equal(-1);
                }
              }
            }
          });
          it('has a fieldValidateRulesMin with a value of 4',function(){
            for(var i in fields){
              if (fields.hasOwnProperty(i)) {
                var field = fields[i];
                if(field.fieldName === 'notTooSmall' ){
                  expect(field.fieldValidateRulesMinlength === '4').to.equal(true);
                }
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

          for (var i=0; i<Object.keys(entities).length; i++){
            var classId = Object.keys(entities)[i];
            var relationships = entities[classId].relationships;

            for(var j=0; j<relationships.length; j++) {
              switch(creator.getClasses()[classId].name.toLowerCase()) {
                case 'employee':
                  if(relationships[j].otherEntityName.toLowerCase() === 'job'){
                    employeeToJob = relationships[j];
                  } else if(relationships[j].otherEntityName.toLowerCase() === 'department'){
                    employeeToDepartment = relationships[j];
                  }
                  break;
                case 'department':
                  if(relationships[j].otherEntityName.toLowerCase() === 'employee'){
                    departmentToEmployee = relationships[j];
                  }
                  break;
                case 'job':
                  if(relationships[j].otherEntityName.toLowerCase() === 'employee'){
                    jobToEmployee = relationships[j];
                  }else if(relationships[j].otherEntityName.toLowerCase() === 'task'){
                    jobToTask = relationships[j];
                  }
                  break;
                case 'task':
                  if(relationships[j].otherEntityName.toLowerCase() === 'job'){
                    taskToJob = relationships[j];
                  }
                  break;
                default:
              }
            }
          }
        });

        describe('when trying to access a relationships', function(){

          describe('Employee to Job: Uni-directional One-to-Many owner side', function(){
            it('has no ownerSide property',function(){
              expect(employeeToJob.ownerSide).to.be.undefined;
            });
            it('has a one-to-one relationships type',function(){
              expect(employeeToJob.relationshipType).to.equal('one-to-many');
            });
            it("has an otherEntityRelationshipName set at 'employee' ",function(){
              expect(employeeToJob.otherEntityRelationshipName).to.equal('employee');
            });
            it("has no otherEntityField",function(){
              expect(employeeToJob.otherEntityField).to.be.undefined;
            });
          });

          describe('Job to Employee: Uni-directional One-to-One', function() {
            it('has  information about the relationship', function() {
              expect(jobToEmployee).not.to.be.undefined;
            });
          });

          describe('Department to Employee : One to Many', function(){
            it('has a one-to-many relationships type',function(){
              expect(departmentToEmployee.relationshipType).to.equal('one-to-many');
            });
            it('has no ownerSide property',function(){
              expect(departmentToEmployee.ownerSide).to.be.undefined;
            });
            it('has otherEntityRelationshipName set to department', function(){
              expect(departmentToEmployee.otherEntityRelationshipName).to.equal('department');
            });
          });

          describe('Employee to Department : Many to One', function(){
            it('has a many-to-one relationships type',function(){
              expect(employeeToDepartment.relationshipType).to.equal('many-to-one');
            });
            it('has no ownerSide property',function(){
              expect(employeeToDepartment.ownerSide).to.be.undefined;
            });
          });

          describe('Job to Task : Many to Many owner side', function(){
            it('has a ownerSide property at true ',function(){
              expect(jobToTask.ownerSide).to.equal(true);
            });
            it('has a many-to-many relationships type',function(){
              expect(jobToTask.relationshipType).to.equal('many-to-many');
            });
          });

          describe('Task to Job: Many to Many not owner side', function(){
            it('has a ownerSide property at false ',function(){
              expect(taskToJob.ownerSide).to.equal(false);
            });
            it('has a many-to-many relationships type',function(){
              expect(taskToJob.relationshipType).to.equal('many-to-many');
            });
            it("has otherEntityRelationshipName set at 'task'", function(){
              expect(taskToJob.otherEntityRelationshipName).to.equal('task');
            });
          });
        });

        describe('when the model has relationships and the app has a NoSQL database', function() {
          it('throw an exception', function() {
            try {
              var parserNoSQL_with_relationship =
                ParserFactory.createParser('./test/xmi/modelio.xmi', 'mongodb');
              new EntitiesCreator(
                parserNoSQL_with_relationship.parse(),
                parserNoSQL_with_relationship.databaseTypes,
                [],
                {});
              fail();
            } catch (error) {
              expect(error.name).to.equal('NoSQLModelingException');
            }

          });
        });
      });
    });
  });
  describe('#createEntities with an entity called USER ', function(){
    before(function(){
      creatorUser.createEntities();
    });
    it('there are less Entities as Classes when there is a Class called \'User\'', function(){
      expect(Object.keys(creatorUser.entities).length).to.equal(Object.keys(creatorUser.parsedData.classes).length-1);
    });

    describe('When an association goes to a USER class', function(){
      before(function(){
        creatorUserWrong.createEntities();
      });
      it('there is a relationship to USER entity after creating entities', function(){
        expect(Object.keys(creatorUserWrong.entities['_uy4W4g9IEeWa5JwclR5VRw'].relationships).length).not.to.equal(0);
      });
    });
  });
});
