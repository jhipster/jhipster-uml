'use strict';

const merge = require('../utils/object_utils').merge;

/**
 * The class holding type data.
 */
class TypeData {
  constructor(values) {
    var merged = merge(defaults(), values);
    this.name = merged.name;
  }
}

module.exports = TypeData;

function defaults() {
  return {
    name: ''
  };
}
