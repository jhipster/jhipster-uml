'use strict';

var expect = require('chai').expect,
    ClassScheduler = require('../lib/scheduler'),
  	ParserFactory = require('../lib/editors/parser_factory'),
    cardinalities = require('../lib/cardinalities');

var parser = ParserFactory.createParser('./test/xmi/modelio.xmi', 'sql');

var parsedData = parser.parse();

var employeeId = '_qlOV3ZWyEeWgPqZDqm9Now';

var scheduler = new ClassScheduler(
  Object.keys(parsedData.classes),
  parsedData.injectedFields);

describe('ClassScheduler', function() {
  describe('#initialize', function() {
    describe('when passing nil arguments', function() {
      describe('for the class names', function() {
        it('throws an exception', function() {
          try {
            new ClassScheduler(
              null,
              parsedData.injectedFields);
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('for the injected fields', function() {
        it('throws an exception', function() {
          try {
            new ClassScheduler(
              Object.keys(parsedData.classes),
              null);
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('for both', function() {
        it('throws an exception', function() {
          try {
            new ClassScheduler(
              null,
              null);
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });
    });

    it ('successfully creates a scheduler', function() {
      new ClassScheduler(
        Object.keys(parsedData.classes),
        parsedData.injectedFields);
    });

    it('initializes each of its attributes', function() {
      expect(
        scheduler.classNames
      ).not.to.be.undefined;
      expect(
        scheduler.injectedFields
      ).not.to.be.undefined;
      expect(
        scheduler.pool
      ).not.to.be.undefined;
      expect(
        scheduler.orderedPool
      ).not.to.be.undefined;
    });
  });

  describe('#schedule', function() {
    // this case checks whether classes are 'forgotten' by the scheduling
    describe(
        'when scheduling classes sorted so as to blend sorted and unsorted classes',
        function() {
      var otherParser =
        ParserFactory.createParser('./test/xmi/mappedby_test.xmi', 'sql');
      var parsedData = otherParser.parse();
      var otherScheduler = new ClassScheduler(
        Object.keys(parsedData.classes),
        parsedData.injectedFields);
      expect(
        otherScheduler.schedule().length
      ).to.equal(Object.keys(parsedData.classes).length);
    });

    describe('#initPool', function() {
      before(function() {
        scheduler.initPool();
      });

      it('fills the pool with correct objects', function() {
        expect(
          scheduler.pool.length
        ).to.equal(Object.keys(parsedData.injectedFields).length);

        for (var i = 0; i < Object.keys(parsedData.injectedFields).length; i++) {
          var relation = scheduler.pool[i];

          expect(relation).not.to.be.undefined;
          expect(relation.source).not.to.be.undefined;
          expect(relation.destination).not.to.be.undefined;
          expect(relation.type).not.to.be.undefined;
        }
      });

      it('detects the cardinalities', function() {
        var expectedOneToOneCount = 7;
        var expectedOneToManyCount = 1;
        var expectedManyToOneCount = 0;
        var expectedManyToManyCount = 1;

        var oneToOneCount = 0;
        var oneToManyCount = 0;
        var manyToOneCount = 0;
        var manyToManyCount = 0;

        for (var i = 0; i < Object.keys(parsedData.injectedFields).length; i++) {
          var relation = scheduler.pool[i];

          switch(relation.type) {
            case cardinalities.ONE_TO_ONE:
              oneToOneCount++;
              break;
            case cardinalities.ONE_TO_MANY:
              oneToManyCount++;
              break;
            case cardinalities.MANY_TO_ONE:
              manyToOneCount++;
              break;
            case cardinalities.MANY_TO_MANY:
              manyToManyCount++;
              break;
            default:
          }
        }

        expect(oneToOneCount).to.equal(expectedOneToOneCount);
        expect(oneToManyCount).to.equal(expectedOneToManyCount);
        expect(manyToOneCount).to.equal(expectedManyToOneCount);
        expect(manyToManyCount).to.equal(expectedManyToManyCount);
      });
    });

    describe('#getDependencies', function() {
      describe('given a valid class', function() {
        var dependencies;

        before(function() {
          dependencies = scheduler.getDependencies(employeeId);
        });

        it(
            'returns the dependencies having the class as source or destination',
            function() {
          expect(dependencies.length).to.equal(4);

          dependencies.forEach(function(dependency) {
            expect(
              dependency.source === employeeId
                || dependency.destination === employeeId
            ).to.equal(true);
          });
        });
      });

      describe('given an invalid class', function() {
        it('returns an empty dependency list', function() {
          expect(
            scheduler.getDependencies('NoClass')
          ).to.deep.equal([]);
          expect(
            scheduler.getDependencies(null)
          ).to.deep.equal([]);
        });
      });
    });

    describe('#remove', function() {
      describe('when passing a null class name', function() {
        it('throws an exception', function() {
           try {
            scheduler.remove(null);
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('#addNewElement', function() {
        var fictiveClass = {
          source: '42',
          destination: '42',
          type: 'reflexive'
        };
        var length;

        before(function() {
          scheduler.addNewElement(fictiveClass);
          length = scheduler.orderedPool.length;
        });

        it('inserts the class key into the ordered pool', function() {
          expect(
            scheduler.orderedPool[scheduler.orderedPool.length - 1]
          ).to.equal(fictiveClass);
        });

        describe('given an already present class', function() {
          it('does not add it again', function() {
            scheduler.addNewElement(fictiveClass);
            expect(scheduler.orderedPool.length).to.equal(length);
          });
        });

        describe('given a nil class name',function() {
          it('does not add it', function() {
            var previousSize = scheduler.getOrderedPool().length;
            scheduler.addNewElement(null);
            expect(scheduler.getOrderedPool().length).to.equal(previousSize);
          });
        });
      });

      describe('#isSafeToRemove', function() {
        describe('when passing an invalid class name', function() {
          it('throws an exception', function() {
            try {
              scheduler.isSafeToRemove(null, {
                source: 'test',
                destination: 'test2',
                type: 'one-to-one'
              });
            } catch (error) {
              expect(error.name).to.equal('NullPointerException');
            }
          });
        });

        describe('given an unremovable class', function() {
          it('returns false', function() {
            expect(
              scheduler.isSafeToRemove('test', {
                source: 'test',
                destination: 'test2',
                type: 'one-to-one'
              })
            ).to.equal(false);
          });
        });

        describe('given a removable class', function() {
          it('returns true', function() {
            expect(
              scheduler.isSafeToRemove('test', {
                source: 'test2',
                destination: 'test',
                type: 'one-to-one'
              })
            ).to.equal(true);
          });
        });
      });

      describe('#removeClassFromPool', function() {
        var previousPool = scheduler.pool;

        before(function() {
          scheduler.removeClassFromPool(employeeId);
        });

        after(function() {
          scheduler.pool = previousPool;
        });

        it(
            'remove any element having the key as source or destination',
            function() {
          expect(scheduler.pool.length).to.equal(6);
        });
      });
    });

    it('sorts the classes and resolves dependencies', function() {
      scheduler.schedule();
      var expectedPathA = [
        '_qlOV_5WyEeWgPqZDqm9Now', // Region
        '_qlOWApWyEeWgPqZDqm9Now', // Task
        '_qlOWBpWyEeWgPqZDqm9Now', // BugFixing
        '_qlOVw5WyEeWgPqZDqm9Now', // Job
        '_qlOV-ZWyEeWgPqZDqm9Now', // Country
        '_qlOV8JWyEeWgPqZDqm9Now', // Location
        '_qlOVz5WyEeWgPqZDqm9Now', // Department
        '_qlOV3ZWyEeWgPqZDqm9Now', // Employee
        '_qlOVtpWyEeWgPqZDqm9Now' ]; // JobHistory
      var expectedPathB = [
        '_qlOWApWyEeWgPqZDqm9Now', // Task
        '_qlOV_5WyEeWgPqZDqm9Now', // Region
        '_qlOWBpWyEeWgPqZDqm9Now', // BugFixing
        '_qlOVw5WyEeWgPqZDqm9Now', // Job
        '_qlOV-ZWyEeWgPqZDqm9Now', // Country
        '_qlOV8JWyEeWgPqZDqm9Now', // Location
        '_qlOVz5WyEeWgPqZDqm9Now', // Department
        '_qlOV3ZWyEeWgPqZDqm9Now', // Employee
        '_qlOVtpWyEeWgPqZDqm9Now' ]; // JobHistory

      expect(
        scheduler.orderedPool.length === expectedPathA.length
          && scheduler.orderedPool.length === expectedPathB.length
      ).to.equal(true);

      scheduler.orderedPool.every(function(element, index) {
        expect(
          element === expectedPathA[index] || element === expectedPathB[index]
        ).to.equal(true);
      });
    });

    it('throws an exception if it cannot sort anymore', function() {

      var otherParser =
        ParserFactory.createParser('./test/xmi/modelio_circular_dep_test.xmi', 'sql');
      var parsedData = otherParser.parse();
      var otherScheduler = new ClassScheduler(
        Object.keys(parsedData.classes),
        parsedData.injectedFields);
      try {
        otherScheduler.schedule();
        fail();
      } catch (error) {
        expect(error.name).to.equal('CircularDependencyException');
      }
    });
  });
});

