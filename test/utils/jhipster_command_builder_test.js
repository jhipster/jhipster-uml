'use strict';

const JHipsterCommandBuilder = require('../../lib/utils/jhipster_command_builder'),
    expect = require('chai').expect,
    fail = expect.fail;

describe('JHipsterCommandBuilder', () => {
  let builder = null;

  beforeEach (() => {
    builder = new JHipsterCommandBuilder()
  });


  describe('#force', () => {
    it('adds the --force option', () => {
      builder.force();
      expect(builder.args.indexOf('--force')).not.to.eq(-1);
    });
  });
  describe('#className', () => {
    describe('when passing a valid class name', () => {
      it('adds it', () => {
        const className = 'toto';
        builder.className(className);
        expect(builder.build().args.indexOf(className)).not.to.eq(-1);
      });
    });
    describe('when passing an invalid value', () => {
      it('fails', () => {
        try {
          builder.className();
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
        try {
          builder.className('');
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
  });
  describe('#skipClient', () => {
    it('adds the --skip-client flag', () => {
      builder.skipClient();
      expect(builder.args.indexOf('--skip-client')).not.to.eq(-1);
    });
  });
  describe('#skipServer', () => {
    it('adds the --skip-server flag', () => {
      builder.skipServer();
      expect(builder.args.indexOf('--skip-server')).not.to.eq(-1);
    });
  });
  describe('#noFluentMethods', () => {
    it('adds the --no-fluent-methods flag', () => {
      builder.noFluentMethods();
      expect(builder.args.indexOf('--no-fluent-methods')).not.to.eq(-1);
    });
  });
  describe('#angularSuffix', () => {
    it('adds the --angular-suffix flag followed by the suffix', () => {
      builder.angularSuffix('suffix');
      var index = builder.args.indexOf('--angular-suffix');
      expect(index).not.to.eq(-1);
      expect(builder.args[index + 1]).to.eq('suffix');
    });
  });
  describe('#skipUserManagement', () => {

  });
  describe('#skipUserManagement', () => {

  });
  describe('#skipInstall', () => {

  });
  describe('#build', () => {

  });
});
