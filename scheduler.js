'use strict';

// constants used throughout the script
var ONE_TO_ONE = 'one-to-one';
var ONE_TO_MANY = 'one-to-many';
var MANY_TO_ONE = 'many-to-one';
var MANY_TO_MANY = 'many-to-many';

/**
 * This class sorts the 
 */
var ClassScheduler = module.exports = function ClassScheduler(classNames,
    injectedFields) {
  this.classNames = classNames;
  this.injectedFields = injectedFields;
  this.pool = [];
  this.orderedPool = [];
};

ClassScheduler.prototype.getOrderedPool = function() {
  return this.ordered_pool;
};

ClassScheduler.prototype.initPool = function() {
  var injectedFieldKeys = Object.keys(this.injectedFields);
  for (var i = 0; i < injectedFieldKeys.length; i++) {
    var injectedField = this.injectedFields[injectedFieldKeys[i]];
    var relation = {
      source: injectedField.class,
      destination: injectedField.type,
      type: injectedField.cardinality
    };
    if (relation.source == relation.destination) {
      relation.type = 'reflexive'; // special type that isn't checked later
    }
    this.pool.push(relation);
  }
};

ClassScheduler.prototype.schedule = function() {
  this.initPool();
  var previousCount = this.pool.length; // used to detect circular dependencies

  while(this.pool.length != 0) {
    for (var i = 0; i < this.classNames.length; i++) {
      var dependencies = this.getDependencies(this.classNames[i]);

      var isOkToRemove = true;
      for (var j = 0; j < dependencies.length; j++) {
        if (!this.isSafeToRemove(this.classNames[i], dependencies[j])) {
          isOkToRemove = false;
          break;
        }
      }
      if (isOkToRemove) {
        this.remove(this.classNames[i]);
      }
    }
    if (previousCount == this.pool.length) {
      throw new CircularDependencyException(
        'There is a circular dependency in the model, exiting now.');
    }
    previousCount = this.pool.length;
  }
  for (var i = 0; i < this.classNames.length && this.classNames.length != this.orderedPool.length; i++) {
    if (this.orderedPool.indexOf(this.classNames[i]) == -1) {
      this.orderedPool.push(this.classNames[i]);
    }
  }
};

ClassScheduler.prototype.isSafeToRemove = function(className, dependency) {
  switch(dependency.type) { // we don't check for reflexive cases
                            // because they can be removed right away
    case ONE_TO_ONE:
    case MANY_TO_MANY:
      return dependency.source != className;
    case ONE_TO_MANY:
      return dependency.destination != className;
    default:
      return true;
  }
};

ClassScheduler.prototype.getDependencies = function(className) {
  var dependencies = [];
  for (var i = 0; i < this.pool.length; i++) {
    if (this.pool[i].source == className
        || this.pool[i].destination == className) {
      dependencies.push(this.pool[i]);
    }
  }
  return dependencies;
};

ClassScheduler.prototype.remove = function(className) {
  this.addNewElement(className);
  this.removeClassFromPool(className);
};

ClassScheduler.prototype.addNewElement = function(className) {
  if (this.orderedPool.indexOf(className) == -1) {
    this.orderedPool.push(className);
  }
};

ClassScheduler.prototype.removeClassFromPool = function (className) {
  var newPool = [];
  for (var i = 0; i < this.pool.length; i++) {
    if (!(this.pool[i].source == className 
        || this.pool[i].destination == className)) {
      newPool.push(this.pool[i]);
    }
  }
  this.pool = newPool;
}

function CircularDependencyException(message) {
  this.name = 'CircularDependencyException';
  this.message = (message || '');
}
CircularDependencyException.prototype = new Error();
