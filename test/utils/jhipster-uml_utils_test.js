/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const fs = require('fs');
const JHipsterUMLUtils = require('../../lib/utils/jhipster-uml_utils');

const isJumlFilePresent = JHipsterUMLUtils.isJumlFilePresent;

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
