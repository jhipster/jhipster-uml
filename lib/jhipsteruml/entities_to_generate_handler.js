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
const logger = require('../utils/logger');
const QuestionAsker = require('../helpers/question_asker');


module.exports = {
  getEntitiesToGenerate
};

async function getEntitiesToGenerate(entityNames) {
  if (!entityNames || entityNames.length === 0) {
    return [];
  }
  logger.info(`The following ${entityNames.length === 1 ? 'class has' : 'classes have'} changed: ${entityNames.join(', ')}.`);
  if (entityNames.length === 1) {
    return await QuestionAsker.askConfirmation({ question: `Generate ${entityNames[0]}?`, defaultValue: true })
      ? entityNames
      : [];
  }
  return await QuestionAsker.selectMultipleChoices({
    choices: entityNames,
    question: 'Select the entities to override.'
  });
}
