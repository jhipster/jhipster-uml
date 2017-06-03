'use strict';

const expect = require('chai').expect,
  fs = require('fs'),
  JHipsterUMLUtils = require('../../lib/utils/jhipster-uml_utils'),
  isJumlFilePresent = JHipsterUMLUtils.isJumlFilePresent;

describe('JHipsterUMLUtils', () => {
  describe('::isJumlFilePresent', () => {
    describe('when no jumlfile file is present', () => {
      it('returns false', () => {
        expect(isJumlFilePresent()).to.be.false;
      });
    });
    describe('when a jumlfile file present', (done) => {
      it('returns true', () => {
        fs.open('jumlfile', 'w', (error) => {
          if (error) {
            throw error;
          }
          expect(isJumlFilePresent()).to.be.true;
          fs.unlinkSync('jumlfile');
          done();
        });
      });
    });
  });
});
