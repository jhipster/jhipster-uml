'use strict';

const _ = require('lodash'),
    JHipsterRelationshipTypes = require('jhipster-core').JHipsterRelationshipTypes;

module.exports = {
  ONE_TO_ONE: _.kebabCase(JHipsterRelationshipTypes.RELATIONSHIP_TYPES.ONE_TO_ONE),
  ONE_TO_MANY: _.kebabCase(JHipsterRelationshipTypes.RELATIONSHIP_TYPES.ONE_TO_MANY),
  MANY_TO_ONE: _.kebabCase(JHipsterRelationshipTypes.RELATIONSHIP_TYPES.MANY_TO_ONE),
  MANY_TO_MANY: _.kebabCase(JHipsterRelationshipTypes.RELATIONSHIP_TYPES.MANY_TO_MANY)
};
