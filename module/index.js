'use strict';
 
var editors = require('../lib/editors/editors'),
	EntitiesCreator = require('../lib/entitiescreator'),
	ClassScheduler = require('./lib/scheduler'),
	SQLTypes = require('../lib/types/sql_types'),
    MongoDBTypes = require('../lib/types/mongodb_types'),
    CassandraTypes = require('../lib/types/cassandra_types');

module.exports = (function(){
    var self = {};
   	self.editors = editors;
   	self.EntitiesCreator = EntitiesCreator;
   	self.ClassScheduler = ClassScheduler;

   	self.SQLTypes = new SQLTypes();
   	self.MongoDBTypes = new MongoDBTypes();
   	self.CassandraTypes = new CassandraTypes();

    return self;
})();