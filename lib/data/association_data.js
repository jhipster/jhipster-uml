'use strict';

var merge = require('../helper/object_helper').merge;

/**
 * The class holding association data.
 */
var AssociationData = module.exports = function(values) {
  var defaults = {
    name: '',
    type: '',
    isUpperValuePresent: false
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
  this.type = merged.type;
  this.isUpperValuePresent = merged.isUpperValuePresent;
};
