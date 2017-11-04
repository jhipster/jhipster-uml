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

const FileUtils = require('../utils/file_utils');

const JHIPSTER_UML_FILENAME = 'jumlfile';

module.exports = {
  JHIPSTER_UML_FILENAME,
  isJHipsterUMLFilePresent,
  readJHipsterUMLFile
};


function isJHipsterUMLFilePresent() {
  return FileUtils.isFile(JHIPSTER_UML_FILENAME);
}

function readJHipsterUMLFile() {
  try {
    if (isJHipsterUMLFilePresent()) {
      return FileUtils.readJSONFile(JHIPSTER_UML_FILENAME);
    }
  } catch (error) {
    // do nothing
  }
  return {};
}
