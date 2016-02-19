'use strict';

var cardinalities = require('./cardinalities'),
    getClassNames = require('./helpers/class_helper').getClassNames,
    NullPointerException = require('./exceptions/null_pointer_exception'),
    CircularDependencyException = require('./exceptions/circular_dependency_exception');

/**
 * This class sorts given classes and injected fields in order to make them
 * insertable in the given order, by respecting dependencies.
 * @param classes {hash<Object>} the classes.
 * @param associations {hash<Object>} the associations.
 * @throws NullPointerException if the passed class names or injected fields
 *                              are nil.
 */
var ClassScheduler = module.exports = function(classes, associations) {
  if (!classes || !associations) {
    throw new NullPointerException(
      'The class and the associations must not be nil.');
  }
  this.classIds = Object.keys(classes);
  this.classNames = getClassNames(classes);
  this.associations = associations;
  this.pool = [];
  this.orderedPool = [];
};

/**
 * Gets the ordered pool. Can be empty if called before the scheduling task.
 * @return {Array<string>} the ordered pool.
 */
ClassScheduler.prototype.getOrderedPool = function() {
  return this.orderedPool;
};

/**
 * Initializes the pool by creating special object representing vertexes in a
 * dependency graph.
 */
ClassScheduler.prototype.initPool = function() {
  this.pool = Object.keys(this.associations).map(function(associationId) {
    var association = this.associations[associationId];
    var relation = {
      source: association.from,
      destination: association.to,
      type: association.type
    };
    if (relation.source === relation.destination) {
      // special type that isn't checked later
      relation.type = 'reflexive';
    }
    return relation;
  }, this);
};

/**
 * This method is the main method of this class: it schedules the given classes
 * to make them creatable by JHipster in a correct way.
 * Basically, it goes through every dependency of every class in order to
 * determine if the class can be safely created before another, and/or after
 * another.
 * Please note that the order is not always guaranteed.
 * Note also that we use the Array#every method in order to exit as soon as
 * we'd like (every is just a pretty version of a much uglier for loop here).
 */
ClassScheduler.prototype.schedule = function() {
  this.initPool();
  // used to detect circular dependencies
  var previousCount = this.pool.length;

  while (this.pool.length !== 0) {
    this.classIds.forEach(function(classId) {
      var dependencies = this.getDependencies(classId);

      var isOkToRemove = dependencies.every(function(dependency) {
        return this.isSafeToRemove(classId, dependency);
      }, this);
      if (isOkToRemove) {
        this.remove(classId);
      }
    }, this);
    if (previousCount === this.pool.length) {
      throw new CircularDependencyException(
        'There is a circular dependency in the model.\n'
        + 'The processed entities so far: [ ' + formatOrderedPool(this.orderedPool, this.classNames) + ' ]\n'
        + 'The elements that still needed processing: [ ' + getUnhandledEntityNames(this.pool, this.classNames) + ' ].');
    }
    previousCount = this.pool.length;
  }

  this.addRemainingClasses();

  return this.orderedPool;
};

function formatOrderedPool(orderedPool, classNames) {
  var namedPool = orderedPool.map(function(classId) {
    return classNames[classId];
  });
  return (namedPool.length === 0)
    ? 'No entity could have been handled.'
    : namedPool.toString();
}

function getUnhandledEntityNames(pool, classNames) {
  return pool.map(function(element) {
    var source = classNames[element.source];
    var destination = classNames[element.destination];
    var cardinality = element.type;
    return 'Source entity: ' + source + ', destination entity: ' + destination + ', cardinality: ' + cardinality;
  });
}

/**
 * Adds the remaining classes to the pool, if they weren't previously added.
 */
ClassScheduler.prototype.addRemainingClasses = function() {
  this.classIds.forEach(function(classId) {
    if (this.orderedPool.indexOf(classId) === -1) {
      this.orderedPool.push(classId);
    }
  }, this);
};

/**
 * This method asserts whether a given class is safe to be removed from the
 * unsorted pool.
 * @param classId {string} a class.
 * @param dependency {Object} a dependency.
 * @return {boolean} whether it is safe to remove the class.
 * @throws NullPointerException if the passed classId is nil.
 */
ClassScheduler.prototype.isSafeToRemove = function(classId, dependency) {
  if (!classId) {
    throw new NullPointerException('The class name can not be nil.');
  }
  switch(dependency.type) {
    case cardinalities.ONE_TO_ONE:
    case cardinalities.MANY_TO_MANY:
    case cardinalities.MANY_TO_ONE:
      return dependency.source !== classId;
    case cardinalities.ONE_TO_MANY:
      return dependency.destination !== classId;
    default:
      // for reflexive associations
      return true;
  }
};

/**
 * Gets this class' dependencies.
 * A dependency is a vertex going to OR from this class.
 * @param classId {string} a class.
 * @return {Array<Object>} the dependencies.
 */
ClassScheduler.prototype.getDependencies = function(classId) {
  return this.pool.filter(function(relation) {
    return relation.source === classId || relation.destination === classId;
  });
};

/**
 * Removes a class from the unsorted pool, and adds it to the sorted one.
 * @param classId {string} a class name.
 * @throws NullPointerException if the passed classId is nil.
 */
ClassScheduler.prototype.remove = function(classId) {
  if (!classId) {
    throw new NullPointerException(
      'The class id can not be nil.');
  }
  this.addNewElement(classId);
  this.removeClassFromPool(classId);
};

/**
 * Adds the new class to the sorted pool, doing nothing if the class already
 * exists.
 * @param classId {string} a class.
 */
ClassScheduler.prototype.addNewElement = function(classId) {
  if (classId && this.orderedPool.indexOf(classId) === -1) {
    this.orderedPool.push(classId);
  }
};

/**
 * Removes the passed class from the unsorted pool.
 * @param classId {string} a class.
 */
ClassScheduler.prototype.removeClassFromPool = function (classId) {
  this.pool = this.pool.filter(function(relation) {
    return !(relation.source === classId || relation.destination === classId);
  });
};
