'use strict';

const expect = require('chai').expect,
      handle = require('../../lib/jhipsteruml/command_line_handler').handle;

describe('CommandLineHandler', () => {
  it('adds the db option', () => {
    let argv = handle([ '--db', 'sql']).argv;
    expect(argv).to.have.property('db', 'sql');
  });
  it('adds the dto option', () => {
    let argv = handle([ '--dto', 'mapstruct']).argv;
    expect(argv).to.have.property('dto', 'mapstruct');
  });
  it('adds the paginate option', () => {
    let argv = handle([ '--paginate','pagination']).argv;
    expect(argv).to.have.property('paginate', 'pagination');
  });
  it('adds the service option', () => {
    let argv = handle([ '--service','serviceImpl']).argv;
    expect(argv).to.have.property('service', 'serviceImpl');
  });
  it('adds the skip-client option', () => {
    let argv = handle([ '--skip-client']).argv;
    expect(argv).to.have.property('skip-client', true);
  });
  it('adds the skip-server option', () => {
    let argv = handle([ '--skip-server']).argv;
    expect(argv).to.have.property('skip-server', true);
  });
  it('adds the angular-suffix option', () => {
    let argv = handle([ '--angular-suffix', 'angular-suffix']).argv;
    expect(argv).to.have.property('angular-suffix', 'angular-suffix');
  });
  it('adds the microservice-name option', () => {
    let argv = handle([ '--microservice-name', 'microservice-name']).argv;
    expect(argv).to.have.property('microservice-name', 'microservice-name');
  });
  it('adds the search-engine option', () => {
    let argv = handle([ '--search-engine', 'elasticsearch']).argv;
    expect(argv).to.have.property('search-engine', 'elasticsearch');
  });
  it('adds the skip-user-management option', () => {
    let argv = handle([ '--skip-user-management']).argv;
    expect(argv).to.have.property('skip-user-management', true);
  });
  it('adds the no-fluent-methods option', () => {
    let argv = handle([ '--no-fluent-methods']).argv;
    expect(argv).to.have.property('no-fluent-methods', true);
  });
  it('adds the to-jdl option', () => {
    let argv = handle([ '--to-jdl']).argv;
    expect(argv).to.have.property('to-jdl', true);
  });
  it('adds the force option', () => {
    let argv = handle([ '-f']).argv;
    expect(argv).to.have.property('force', true);
  });
  it('adds the editor option', () => {
    let argv = handle([ '--editor', 'umldesigner']).argv;
    expect(argv).to.have.property('editor', 'umldesigner');
  });
});
