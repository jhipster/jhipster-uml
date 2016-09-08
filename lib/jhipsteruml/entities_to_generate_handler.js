'use strict';

const selectMultipleChoices = require('../helpers/question_asker').selectMultipleChoices;

module.exports = {
  getEntitiesToGenerate: getEntitiesToGenerate
};

function getEntitiesToGenerate(entityNames) {
  console.log(`The following ${entityNames.length === 1 ? 'class has' : 'classes have'} changed: ${entityNames.join(', ')}.`)
  return selectMultipleChoices({
    choices: getChoices(entityNames),
    question: 'Select the entities to override.'
  });
}

function getChoices(entityNames) {
  var choiceArray = ['*** All ***'];
  for (let i = 0; i < entityNames.length; i++) {
    choiceArray.push(entityNames[i]);
  }
  return choiceArray;
}
