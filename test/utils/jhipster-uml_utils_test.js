'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    fs = require('fs'),
    JHipsterUMLUtils = require('../../lib/utils/jhipster-uml_utils'),
    isJumlFilePresent = JHipsterUMLUtils.isJumlFilePresent;

describe('JHipsterUMLUtils', () => {
  describe('::isJumlFilePresent', () => {
    describe('when no .juml file is present', () => {
      it('returns false', () => {
        expect(isJumlFilePresent()).to.be.false;
      });
    });
    describe('when a .juml file present', (done) => {
      it('returns true', () => {
        fs.open('.juml', 'w', (error, fileDescriptor) => {
          if (error) {
            throw error;
          }
          expect(isJumlFilePresent()).to.be.true;
          fs.unlinkSync('.juml');
        });
      });
    });
  });
});
