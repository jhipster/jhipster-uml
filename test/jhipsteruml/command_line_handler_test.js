const expect = require('chai').expect;
const handle = require('../../lib/jhipsteruml/command_line_handler').handle;
const fs = require('fs');

describe('CommandLineHandler', () => {
  describe('when using command line options without a jumlfile', () => {
    it('adds the db option', () => {
      const argv = handle(['--db', 'sql']).argv;
      expect(argv).to.have.property('db', 'sql');
    });
    it('adds the dto option', () => {
      const argv = handle(['--dto', 'mapstruct']).argv;
      expect(argv).to.have.property('dto', 'mapstruct');
    });
    it('adds the paginate option', () => {
      const argv = handle(['--paginate', 'pagination']).argv;
      expect(argv).to.have.property('paginate', 'pagination');
    });
    it('adds the service option', () => {
      const argv = handle(['--service', 'serviceImpl']).argv;
      expect(argv).to.have.property('service', 'serviceImpl');
    });
    it('adds the skip-client option', () => {
      const argv = handle(['--skip-client']).argv;
      expect(argv).to.have.property('skip-client', true);
    });
    it('adds the skip-server option', () => {
      const argv = handle(['--skip-server']).argv;
      expect(argv).to.have.property('skip-server', true);
    });
    it('adds the angular-suffix option', () => {
      const argv = handle(['--angular-suffix', 'angular-suffix']).argv;
      expect(argv).to.have.property('angular-suffix', 'angular-suffix');
    });
    it('adds the microservice-name option', () => {
      const argv = handle(['--microservice-name', 'microservice-name']).argv;
      expect(argv).to.have.property('microservice-name', 'microservice-name');
    });
    it('adds the search-engine option', () => {
      const argv = handle(['--search-engine', 'elasticsearch']).argv;
      expect(argv).to.have.property('search-engine', 'elasticsearch');
    });
    it('adds the skip-user-management option', () => {
      const argv = handle(['--skip-user-management']).argv;
      expect(argv).to.have.property('skip-user-management', true);
    });
    it('adds the no-fluent-methods option', () => {
      const argv = handle(['--no-fluent-methods']).argv;
      expect(argv).to.have.property('fluent-methods', false);
    });
    it('adds the to-jdl option', () => {
      const argv = handle(['--to-jdl']).argv;
      expect(argv).to.have.property('to-jdl', true);
    });
    it('adds the force option', () => {
      const argv = handle(['-f']).argv;
      expect(argv).to.have.property('force', true);
    });
    it('adds the editor option', () => {
      const argv = handle(['--editor', 'umldesigner']).argv;
      expect(argv).to.have.property('editor', 'umldesigner');
    });
  });
  describe('when using the command line without options but with a jumlfile', () => {
    it('loads the db option', () => {
      fs.writeFileSync('jumlfile', '{"db": "sql"}');
      const argv = handle([]).argv;
      fs.unlinkSync('jumlfile');
      expect(argv).to.have.property('db', 'sql');
    });
    it('loads the fluent-methods option', () => {
      fs.writeFileSync('jumlfile', '{"fluent-methods": "false"}');
      const argv = handle([]).argv;
      fs.unlinkSync('jumlfile');
      expect(argv).to.have.property('fluent-methods', 'false');
    });
  });
  describe('when using the command line with options and a jumlfile', () => {
    it('adds the db option from jumlfile and the dto option from the command line', () => {
      fs.writeFileSync('jumlfile', '{"db": "sql"}');
      const argv = handle(['--dto', 'mapstruct']).argv;
      fs.unlinkSync('jumlfile');
      expect(argv).to.have.property('db', 'sql');
      expect(argv).to.have.property('dto', 'mapstruct');
    });
    it('conflicts command line and jumlfile with standard option', () => {
      fs.writeFileSync('jumlfile', '{"db": "sql"}');
      const argv = handle(['--db', 'mongodb']).argv;
      fs.unlinkSync('jumlfile');
      expect(argv).to.have.property('db', 'mongodb');
    });
    it('conflicts command line and jumlfile with negative option', () => {
      fs.writeFileSync('jumlfile', '{"fluent-methods": false}');
      const argv = handle(['--no-fluent-methods']).argv;
      fs.unlinkSync('jumlfile');
      expect(argv).to.have.property('fluent-methods', false);
    });
  });
});
