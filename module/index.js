'use strict';

var editors = require('../lib/editors/editors'),
  entityGenerator = require('../lib/entity_generator'),
  EntitiesCreator = require('../lib/entitiescreator'),
  ClassScheduler = require('../lib/scheduler'),

  SQLTypes = require('../lib/types/sql_types'),
  MongoDBTypes = require('../lib/types/mongodb_types'),
  CassandraTypes = require('../lib/types/cassandra_types'),
  cardinalities = require('../lib/cardinalities');


module.exports = (function(){
  var self = {};
  self.editors = editors;
  self.entityGenerator = entityGenerator;
  self.EntitiesCreator = EntitiesCreator;
  self.ClassScheduler = ClassScheduler;


  self.SQLTypes = new SQLTypes();
  self.MongoDBTypes = new MongoDBTypes();
  self.CassandraTypes = new CassandraTypes();
  self.cardinalities = cardinalities;

  return self;
})();
