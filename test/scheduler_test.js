'use strict';

var chai = require('chai'),
    expect = chai.expect, 
    ClassScheduler = require('../lib/scheduler'),
  	mp = require('../lib/editors/modelio_parser'),
    xml2js = require('xml2js'),
    fs = require('fs'),
    types = require('../lib/types'),
    cardinalities = require('../lib/cardinalities');

var parser = new mp.ModelioParser(
  getRootElement(readFileContent('./test/xmi/modelio.xmi')),
  initDatabaseTypeHolder('sql'));

parser.parse();

var employeeId = '_iW0ZH_JjEeSmmZm37nQR-w';

var scheduler = new ClassScheduler(
  Object.keys(parser.getClasses()),
  parser.getInjectedFields(),
  parser.getClasses()
  );

describe('ClassScheduler', function() {
  describe('#initialize', function() {
    describe('when passing nil arguments', function() {
      describe('for the class names', function() {
        it('throws an exception', function() {
          try {
            new ClassScheduler(
              null,
              parser.getInjectedFields());
          } catch (error) {
            expect(error.name).to.equal('NullPointerException');
          }
        });
      });

      describe('for the injected fields', function() {
        it('throws an exception', function() {
          try {
            new ClassScheduler(
              Object.keys(parser.getClasses()),
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
        Object.keys(parser.getClasses()),
        parser.getInjectedFields(),
        parser.getClasses());
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
    // this case checks whether classes are 'forgotten' by the scheduling
    describe(
        'when scheduling classes sorted so as to blend sorted and unsorted classes', 
        function() {

      var otherParser = new mp.ModelioParser(
        getRootElement(readFileContent('./test/xmi/mappedby_test.xmi')),
        initDatabaseTypeHolder('sql'));
      otherParser.parse();
      var otherScheduler = new ClassScheduler(
        Object.keys(otherParser.getClasses()),
        otherParser.getInjectedFields(),
        otherParser.getClasses());
      otherScheduler.schedule();
      expect(
        otherScheduler.getOrderedPool().length
      ).to.equal(Object.keys(otherParser.getClasses()).length);
    });

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
        var expectedOneToOneCount = 7;
        var expectedOneToManyCount = 1;
        var expectedManyToOneCount = 0;
        var expectedManyToManyCount = 1;

        var oneToOneCount = 0;
        var oneToManyCount = 0;
        var manyToOneCount = 0;
        var manyToManyCount = 0;

        for (var i = 0; i < Object.keys(parser.getInjectedFields()).length; i++) {
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
          expect(dependencies.length).to.equal(3);

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

      var otherParser = new mp.ModelioParser(
        getRootElement(readFileContent('./test/xmi/modelio_circular_dep_test.xmi')),
        initDatabaseTypeHolder('sql'));
      otherParser.parse();
      var otherScheduler = new ClassScheduler(
        Object.keys(otherParser.getClasses()),
        otherParser.getInjectedFields(),
        parser.getClasses());
      try {
        otherScheduler.schedule();
        fail();
      } catch (error) {
        expect(error.name).to.equal('CircularDependencyException');
      }
    });
  });
});

function getRootElement(content) {
  var root;
  var parser = new xml2js.Parser(); // as an option: {explicitArray : false}
  var result = parser.parseString(content, function (err, result) {
    if (result.hasOwnProperty('uml:Model')) {
      root = result['uml:Model'];
    } else if (result.hasOwnProperty('xmi:XMI')) {
      root = result['xmi:XMI']['uml:Model'][0];
    } else {
      throw new NoRootElementException(
        'The passed document has no immediate root element,'
        + ' exiting now.');
    }
  });
  return root;
}

function readFileContent(file) {
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    throw new WrongPassedArgumentException(
      "The passed file '"
      + file
      + "' must exist and must not be a directory, exiting now.'");
  }
  return fs.readFileSync(file, 'utf-8');
}

function initDatabaseTypeHolder(databaseTypeName) {
  switch (databaseTypeName) {
    case 'sql':
      return new types.SQLTypes();
    case 'mongodb':
      return new types.MongoDBTypes();
    case 'cassandra':
      return new types.CassandraTypes();
    default:
      throw new WrongDatabaseTypeException(
        'The passed database type is incorrect. '
        + "Must either be 'sql', 'mongodb', or 'cassandra'. Got '"
        + databaseTypeName
        + "', exiting now.");
  }
}
