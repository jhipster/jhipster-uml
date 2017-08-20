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
const fs = require('fs');
const BuildException = require('../exceptions/exception_factory').BuildException;
const exceptions = require('../exceptions/exception_factory').exceptions;

module.exports = {
  exportToJSON
};

function exportToJSON(entities, entityIdsToGenerate, parsedData, entityNamesToGenerate) {
  if (!entities || !entityIdsToGenerate || !parsedData) {
    throw new BuildException(
      exceptions.NullPointer,
      'Entities have to be passed to be exported.');
  }
  createJHipsterJSONFolder();
  for (let i = 0, entityIds = Object.keys(entities); i < entityIds.length; i++) {
    if (entityNamesToGenerate.indexOf(parsedData.getClass(entityIds[i]).name) !== -1) {
      const file = `.jhipster/${parsedData.getClass(entityIds[i]).name}.json`;
      fs.writeFileSync(file, JSON.stringify(entities[entityIds[i]], null, '  '));
    }
  }
}

function createJHipsterJSONFolder() {
  try {
    if (!fs.statSync('./.jhipster').isDirectory()) {
      fs.mkdirSync('.jhipster');
    }
  } catch (error) {
    fs.mkdirSync('.jhipster');
  }
}
