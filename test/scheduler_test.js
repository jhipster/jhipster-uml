'use strict';

var chai = require('chai'),
    expect = chai.expect, 
    ClassScheduler = require('../scheduler'),
  	XMIParser = require('../xmiparser');

var parser = new XMIParser('./test/modelio.xmi', 'sql');

parser.parse();

var employeeId = '_iW0ZH_JjEeSmmZm37nQR-w';

var scheduler = new ClassScheduler(
  Object.keys(parser.getClasses()),
  parser.getInjectedFields());

describe('ClassScheduler', function() {
  describe('#initialize', function() {
    it ('successfully creates a scheduler', function() {
      new ClassScheduler(
        Object.keys(parser.getClasses()),
        parser.getInjectedFields());
    });

    it('initializes each of its attributes', function() {
      expect(
        scheduler.classNames
      ).not.to.equal(undefined);
      expect(
        scheduler.injectedFields
      ).not.to.equal(undefined);
      expect(
        scheduler.pool
      ).not.to.equal(undefined);
      expect(
        scheduler.orderedPool
      ).not.to.equal(undefined);
    });
  });

  describe('#schedule', function() {
    describe('#initPool', function() {
      before(function() {
        scheduler.initPool();
      });

      it('fills the pool with correct objects', function() {
        expect(
          scheduler.pool.length
        ).to.equal(Object.keys(parser.getInjectedFields()).length);

        for (var i = 0; i < Object.keys(parser.getInjectedFields()).length; i++) {
          var relation = scheduler.pool[i];

          expect(relation).not.to.equal(undefined);
          expect(relation.source).not.to.equal(undefined);
          expect(relation.destination).not.to.equal(undefined);
          expect(relation.type).not.to.equal(undefined);
        }
      });

      it('detects the cardinalities', function() {
        var expectedReflexiveCount = 1;
        var expectedOneToOneCount = 7;
        var expectedOneToManyCount = 1;
        var expectedManyToOneCount = 0;
        var expectedManyToManyCount = 1;

        var reflexiveCount = 0;
        var oneToOneCount = 0;
        var oneToManyCount = 0;
        var manyToOneCount = 0;
        var manyToManyCount = 0;

        for (var i = 0; i < Object.keys(parser.getInjectedFields()).length; i++) {
          var relation = scheduler.pool[i];

          switch(relation.type) {
            case 'one-to-one':
              oneToOneCount++;
              break;
            case 'one-to-many':
              oneToManyCount++;
              break;
            case 'many-to-one':
              manyToOneCount++;
              break;
            case 'many-to-many':
              manyToManyCount++;
              break;
            case 'reflexive':
              reflexiveCount++;
              break;
          }
        }

        expect(reflexiveCount).to.equal(expectedReflexiveCount);
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

          for (var i = 0; i < dependencies.length; i++) {
            expect(
              dependencies[i].source == employeeId 
                || dependencies[i].destination == employeeId
            ).to.equal(true);
          }
        });
      });

      describe('given an invalid class', function() {
        it('returns an empty dependency list', function() {
          expect(
            scheduler.getDependencies('NoClass')
          ).to.deep.equal([]);
        });
      });
    });

    describe('#remove', function() {
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
        })

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
        })
      });

      describe('#isSafeToRemove', function() {
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
        '_iW0ZQfJjEeSmmZm37nQR-w',
        '_iW0ZRPJjEeSmmZm37nQR-w',
        '_iW0ZSPJjEeSmmZm37nQR-w',
        '_iW0ZBfJjEeSmmZm37nQR-w',
        '_iW0ZO_JjEeSmmZm37nQR-w',
        '_iW0ZMvJjEeSmmZm37nQR-w',
        '_iW0ZEfJjEeSmmZm37nQR-w',
        '_iW0ZH_JjEeSmmZm37nQR-w',
        '_iW0Y-PJjEeSmmZm37nQR-w' ];
      var expectedPathB = [ 
        '_iW0ZQfJjEeSmmZm37nQR-w',
        '_iW0ZSPJjEeSmmZm37nQR-w',
        '_iW0ZO_JjEeSmmZm37nQR-w',
        '_iW0ZMvJjEeSmmZm37nQR-w',
        '_iW0ZEfJjEeSmmZm37nQR-w',
        '_iW0ZRPJjEeSmmZm37nQR-w',
        '_iW0ZBfJjEeSmmZm37nQR-w',
        '_iW0ZH_JjEeSmmZm37nQR-w',
        '_iW0Y-PJjEeSmmZm37nQR-w' ];

      expect(
        scheduler.orderedPool.length == expectedPathA.length 
          && scheduler.orderedPool.length == expectedPathB.length
      ).to.equal(true);

      scheduler.orderedPool.every(function(element, index, array) {
        expect(
          element == expectedPathA[index] || element == expectedPathB[index]
        ).to.equal(true);
      });
    });

    it('throws an exception if it cannot sort anymore', function() {
      var otherParser = 
        new XMIParser('./test/modelio_circular_dep_test.xmi', 'sql');
      otherParser.parse();
      var otherScheduler = new ClassScheduler(
        Object.keys(otherParser.getClasses()),
        otherParser.getInjectedFields());
      try {
        otherScheduler.schedule();
        fail();
      } catch (error) {
        expect(error.name).to.equal('CircularDependencyException');
      }

    });
  });
});
