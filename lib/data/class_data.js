'use strict';

const merge = require('../utils/object_utils').merge,
    checkForReservedClassName = require('../utils/jhipster_utils').checkForReservedClassName,
    checkForReservedTableName = require('../utils/jhipster_utils').checkForReservedTableName;

/**
 * The class holding class data.
 */
class ClassData {
  constructor(values) {
    var merged = merge(defaults(), values);
    checkForReservedClassName({name: merged.name, shouldThrow: true});
    checkForReservedTableName({name: merged.tableName, shouldThrow: false});
    this.name = merged.name;
    this.tableName = merged.tableName || this.name;
    this.fields = merged.fields;
    this.comment = merged.comment;
    this.dto = merged.dto;
    this.pagination = merged.pagination;
    this.service = merged.service;
    if (merged.microserviceName) {
      this.microserviceName = merged.microserviceName;
    }
    if (merged.searchEngine) {
      this.searchEngine = merged.searchEngine;
    }
  }

  /**
   * Adds a field to the class.
   * @param {Object} field the field to add.
   * @return {ClassData} this modified class.
   */
  addField(field) {
    this.fields.push(field);
    return this;
  }
}

module.exports = ClassData;

function defaults() {
  return {
    name: '',
    tableName: '',
    fields: [],
    comment: '',
    dto: 'no',
    pagination: 'no',
    service: 'no'
  };
}
