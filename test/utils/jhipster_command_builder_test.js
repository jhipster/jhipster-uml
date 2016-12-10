'use strict';

const JHipsterCommandBuilder = require('../../lib/utils/jhipster_command_builder'),
    expect = require('chai').expect,
    fail = expect.fail;

describe('JHipsterCommandBuilder', () => {
  const builder = new JHipsterCommandBuilder();

  describe('#force', () => {
    it('adds the --force option', () => {
      builder.force();
      expect(builder.args.has('--force')).to.be.true;
    });
  });
  describe('#className', () => {
    describe('when passing a valid class name', () => {
      it('adds it', () => {

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

  });
  describe('#skipServer', () => {

  });
  describe('#noFluentMethods', () => {

  });
  describe('#angularSuffix', () => {

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
