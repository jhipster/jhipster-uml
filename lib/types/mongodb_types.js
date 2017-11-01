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
const fieldTypes = jhCore.JHipsterFieldTypes.COMMON_DB_TYPES;
const mongodb = jhCore.JHipsterDatabaseTypes.Types.mongodb;

/**
 * This class extends the Types interface to provide the MongoDB types
 * supported by JHipster.
 */
const MongoDBTypes = module.exports = function () {
  this.types = values(fieldTypes);
};

// inheritance stuff
MongoDBTypes.prototype = Object.create(AbstractMappedTypes.prototype);
MongoDBTypes.prototype.constructor = AbstractMappedTypes;

MongoDBTypes.prototype.getName = function () {
  return mongodb;
};
