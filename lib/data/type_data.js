'use strict';

var merge = require('../helpers/object_helper').merge;

/**
 * The class holding type data.
 */
var TypeData = module.exports = function(values) {
  var defaults = {
    name: ''
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
};
