'use strict';

var merge = require('../helper/object_helper').merge;

var TypeData = module.exports = function(values) {
  var defaults = {
    name: ''
  };

  var merged = merge(defaults, values);
  this.name = merged.name;
};
