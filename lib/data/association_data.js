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
const merge = require('jhipster-core').ObjectUtils.merge;

/**
 * The class holding association data.
 */
class AssociationData {
  constructor(values) {
    const merged = merge(defaults(), values);
    this.from = merged.from;
    this.to = merged.to;
    this.type = merged.type;
    this.injectedFieldInFrom = merged.injectedFieldInFrom;
    this.injectedFieldInTo = merged.injectedFieldInTo;
    this.isInjectedFieldInFromRequired = merged.isInjectedFieldInFromRequired;
    this.isInjectedFieldInToRequired = merged.isInjectedFieldInToRequired;
    this.commentInFrom = merged.commentInFrom;
    this.commentInTo = merged.commentInTo;
  }
}

module.exports = AssociationData;

function defaults() {
  return {
    from: null,
    to: null,
    type: '',
    injectedFieldInFrom: null,
    injectedFieldInTo: null,
    isInjectedFieldInFromRequired: false,
    isInjectedFieldInToRequired: false,
    commentInFrom: '',
    commentInTo: ''
  };
}
