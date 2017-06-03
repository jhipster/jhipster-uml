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
'use strict';

const buildException = require('../exceptions/exception_factory').buildException,
  exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  merge: merge,
  values: values
};

/**
 * Merge two objects.
 * The order is important here: o1.merge(o2) means that the keys values of o2
 * will replace those identical to o1.
 * The keys that don't belong to the other object will be added.
 * @param object2 the object to be merged with.
 * @returns {Object} the object result of the merge
 */
function merge(object1, object2) {
  if (!object1 || Object.keys(object1).length === 0) {
    return object2;
  }
  if (!object2 || Object.keys(object2).length === 0) {
    return object1;
  }
  const merged = {};
  for (let key in object1) {
    merged[key] = object1[key];
  }
  for (let key in object2) {
    merged[key] = object2[key];
  }
  return merged;
}

function values(object) {
  if (!object) {
    throw new buildException(exceptions.NullPointer, 'The passed object must not be nil.');
  }
  const values = [];
  for (let i = 0, keys = Object.keys(object); i < keys.length; i++) {
    values.push(object[keys[i]]);
  }
  return values;
}
