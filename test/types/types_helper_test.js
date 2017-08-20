const expect = require('chai').expect;

const TypesHelper = require('../../lib/types/types_helper');
const SQLTypes = require('../../lib/types/sql_types');
const MongoDBTypes = require('../../lib/types/mongodb_types');
const CassandraTypes = require('../../lib/types/cassandra_types');

describe('TypesHelper', () => {
  describe('#isNoSQL', () => {
    describe('when passing a SQL type', () => {
      describe('such as SQLTypes', () => {
        it('returns false', () => {
          expect(TypesHelper.isNoSQL(SQLTypes));
        });
      });
    });
    describe('when passing a NoSQL type', () => {
      describe('such as MongoDBTypes', () => {
        it('returns true', () => {
          expect(TypesHelper.isNoSQL(MongoDBTypes));
        });
      });
      describe('such as CassandraTypes', () => {
        it('returns true', () => {
          expect(TypesHelper.isNoSQL(CassandraTypes));
        });
      });
    });
  });
});
