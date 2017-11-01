/**
 * Copyright 2013-2017 the original author or authors from the JHipster project.
 *
 * This file is part of the JHipster project, see https://jhipster.github.io/
 * for more information.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
const AbstractMappedTypes = require('./abstract_mapped_types');
const jhCore = require('jhipster-core');

const values = jhCore.ObjectUtils.values;
const fieldTypes = jhCore.JHipsterFieldTypes.CASSANDRA_TYPES;
const cassandra = jhCore.JHipsterDatabaseTypes.Types.cassandra;

/**
 * This class extends the Types interface to provide the Cassandra types
 * supported by JHipster.
 */
const CassandraTypes = module.exports = function () {
  this.types = values(fieldTypes);
};

// inheritance stuff
CassandraTypes.prototype = Object.create(AbstractMappedTypes.prototype);
CassandraTypes.prototype.constructor = AbstractMappedTypes;

CassandraTypes.prototype.getName = function () {
  return cassandra;
};
