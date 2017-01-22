'use strict';

const merge = require('../utils/object_utils').merge;

/**
 * The class holding enumeration data.
 */
class EnumData {
  constructor(values) {
    const merged = merge(defaults(), values);
    this.name = merged.name;
    this.values = merged.values;
  }
}

module.exports = EnumData;

function defaults() {
  return {
    name: '',
    values: []
  };
}
