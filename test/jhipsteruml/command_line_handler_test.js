'use strict';

const expect = require('chai').expect,
      handle = require('../../lib/jhipsteruml/command_line_handler').handle,
      fs = require('fs');

describe('CommandLineHandler', () => {
  describe('when use command line options without jumlfile', () => {
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
      expect(argv).to.have.property('fluent-methods', false);
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
  describe('when use command line without options but with jumlfile', () => {
    it('load db option', () => {
      fs.writeFileSync('jumlfile', '{"db": "sql"}');
      let argv = handle([]).argv;
      fs.unlinkSync('jumlfile');
      expect(argv).to.have.property('db', 'sql');
    });
    it('load fluent-methods option', () => {
      fs.writeFileSync('jumlfile', '{"fluent-methods": "false"}');
      let argv = handle([]).argv;
      fs.unlinkSync('jumlfile');
      expect(argv).to.have.property('fluent-methods', 'false');
    });
  });
  describe('when use command line with options and jumlfile', () => {
    it('adds the db option from jumlfile and dto option from command line', () => {
      fs.writeFileSync('jumlfile', '{"db": "sql"}');
      let argv = handle(['--dto', 'mapstruct']).argv;
      fs.unlinkSync('jumlfile');
      expect(argv).to.have.property('db', 'sql');
      expect(argv).to.have.property('dto', 'mapstruct');
    });
    it('conflict command line and jumlfile with standard option', () => {
      fs.writeFileSync('jumlfile', '{"db": "sql"}');
      let argv = handle(['--db','mongodb']).argv;
      fs.unlinkSync('jumlfile');
      expect(argv).to.have.property('db', 'mongodb');
    });
    it('conflict command line and jumlfile with negative option', () => {
      fs.writeFileSync('jumlfile', '{"fluent-methods": false}');
      let argv = handle(['--no-fluent-methods']).argv;
      fs.unlinkSync('jumlfile');
      expect(argv).to.have.property('fluent-methods', false);
    });
  });
});
