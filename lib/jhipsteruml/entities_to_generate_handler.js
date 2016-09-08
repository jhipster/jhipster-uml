'use strict';

const selectMultipleChoices = require('../helpers/question_asker').selectMultipleChoices,
    askConfirmation = require('../helpers/question_asker').askConfirmation;

module.exports = {
  getEntitiesToGenerate: getEntitiesToGenerate
};

function getEntitiesToGenerate(entityNames) {
  console.log(`The following ${entityNames.length === 1 ? 'class has' : 'classes have'} changed: ${entityNames.join(', ')}.`);
  if (entityNames.length === 1) {
    return askConfirmation({question: `Generate ${entityNames[0]}?`, defaultValue: true})
      ? entityNames
      : [];
  }
  var choices = getChoices(entityNames);
  return selectMultipleChoices({
    choices: choices,
    question: 'Select the entities to override.'
  });
}

function getChoices(entityNames) {
  if (entityNames.length === 1) {
    return entityNames;
  }
  var choiceArray = ['*** All ***'];
  for (let i = 0; i < entityNames.length; i++) {
    choiceArray.push(entityNames[i]);
  }
  return choiceArray;
}
