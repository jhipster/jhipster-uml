'use strict';

var expect = require('chai').expect,
    TypesHelper = require('../../lib/types/types_helper'),
    SQLTypes = require('../../lib/types/sql_types'),
    MongoDBTypes = require('../../lib/types/mongodb_types'),
    CassandraTypes = require('../../lib/types/cassandra_types');

describe('TypesHelper', function() {
  describe('#isNoSQL', function() {
    describe('when passing a SQL type', function() {
      describe('such as SQLTypes', function() {
        it('returns false', function() {
          expect(TypesHelper.isNoSQL(SQLTypes));
        });
      });
    });
    describe('when passing a NoSQL type', function() {
      describe('such as MongoDBTypes', function() {
        it('returns true', function() {
          expect(TypesHelper.isNoSQL(MongoDBTypes));
        });
      });
      describe('such as CassandraTypes', function() {
        it('returns true', function() {
          expect(TypesHelper.isNoSQL(CassandraTypes));
        });
      });
    });
  });
});
