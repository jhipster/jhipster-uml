'use strict';

var cardinalities = require('./cardinalities'),
    NullPointerException = require('./exceptions/null_pointer_exception'),
    CircularDependencyException = require('./exceptions/circular_dependency_exception');

/**
 * This class sorts given classes and injected fields in order to make them
 * insertable in the given order, by respecting dependencies.
 * @param classNames {Array<string>} the class names.
 * @param associations {hash<Object>} the associations.
 * @throws NullPointerException if the passed class names or injected fields
 *                              are nil.
 */
var ClassScheduler = module.exports = function(classNames, associations) {
  if (!classNames || !associations) {
    throw new NullPointerException(
      'The class names and the associations must not be nil.');
  }
  this.classNames = classNames;
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

  while(this.pool.length !== 0) {
    this.classNames.forEach(function(className) {
      var dependencies = this.getDependencies(className);

      var isOkToRemove = dependencies.every(function(dependency) {
        return this.isSafeToRemove(className, dependency);
      }, this);
      if (isOkToRemove) {
        this.remove(className);
      }
    }, this);
    if (previousCount === this.pool.length) {
      throw new CircularDependencyException(
        'There is a circular dependency in the model, exiting now.');
    }
    previousCount = this.pool.length;
  }

  this.addRemainingClasses();

  return this.orderedPool;
};

/**
 * Adds the remaining classes to the pool, if they weren't previously added.
 */
ClassScheduler.prototype.addRemainingClasses = function() {
  this.classNames.forEach(function(element) {
    if (this.orderedPool.indexOf(element) === -1) {
      this.orderedPool.push(element);
    }
  }, this);
};

/**
 * This method asserts whether a given class is safe to be removed from the
 * unsorted pool.
 * @param className {string} a class name.
 * @param dependency {Object} a dependency.
 * @return {boolean} whether it is safe to remove the class.
 * @throws NullPointerException if the passed className is nil.
 */
ClassScheduler.prototype.isSafeToRemove = function(className, dependency) {
  if (!className) {
    throw new NullPointerException('The class name can not be nil.');
  }
  switch(dependency.type) {
    case cardinalities.ONE_TO_ONE:
    case cardinalities.MANY_TO_MANY:
    case cardinalities.MANY_TO_ONE:
      return dependency.source !== className;
    case cardinalities.ONE_TO_MANY:
      return dependency.destination !== className;
    default:
      // for reflexive associations
      return true;
  }
};

/**
 * Gets this class' dependencies.
 * A dependency is a vertex going to OR from this class.
 * @param className {string} a class name.
 * @return {Array<Object>} the dependencies.
 */
ClassScheduler.prototype.getDependencies = function(className) {
  return this.pool.filter(function(relation) {
    return relation.source === className || relation.destination === className;
  });
};

/**
 * Removes a class from the unsorted pool, and adds it to the sorted one.
 * @param className {string} a class name.
 * @throws NullPointerException if the passed className is nil.
 */
ClassScheduler.prototype.remove = function(className) {
  if (!className) {
    throw new NullPointerException(
      'The class name can not be nil.');
  }
  this.addNewElement(className);
  this.removeClassFromPool(className);
};

/**
 * Adds the new class to the sorted pool. Doing nothing if the class already
 * exists.
 * @param className {string} a class name.
 */
ClassScheduler.prototype.addNewElement = function(className) {
  if (className && this.orderedPool.indexOf(className) === -1) {
    this.orderedPool.push(className);
  }
};

/**
 * Removes the passed class from the unsorted pool.
 * @param className {string} a class name.
 */
ClassScheduler.prototype.removeClassFromPool = function (className) {
  this.pool = this.pool.filter(function(relation) {
    return !(relation.source === className || relation.destination === className);
  });
};
