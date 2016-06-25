'use strict';

module.exports = {
  displayVersion: displayVersion
};

function displayVersion() {
  console.info(`The current version of JHipster UML is ${getPackageVersion()}.`);
}

function getPackageVersion() {
  return require('../../package.json').version;
}
