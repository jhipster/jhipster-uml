'use strict';

var expect = require('chai').expect,
    fail = expect.fail,
    parseOptions = require('../../lib/jhipsteruml/jhipsteruml_options');

describe('#parseOptions', function () {
  describe('when passing an invalid arg array', function () {
    describe('because it is nil', function () {
      it('fails', function () {
        try {
          parseOptions(null);
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
    describe('because it is empty', function () {
      it('fails', function () {
        try {
          parseOptions([]);
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
    describe("because it doesn't contain the required args", function () {
      it('fails', function () {
        try {
          parseOptions([1, 2]);
        } catch (error) {
          expect(error.name).to.eq('IllegalArgumentException');
        }
      });
    });
  });
  describe('when passing a valid arg array', function () {
    describe('having the version option', function () {
      it('has a fail fast behavior', function () {
        var options = parseOptions([1, 2, '-db', 'sql', '-v', '-dto']);
        expect(options.db).to.be.true;
        expect(options.type).to.eq('sql');
        expect(options.displayVersion).to.be.true;
        expect(options.dto).to.be.false;
      });
    });
    describe('having the help option', function () {
      it('has a fail fast behavior', function () {
        var options = parseOptions([1, 2, '-db', 'sql', '-h', '-dto']);
        expect(options.db).to.be.true;
        expect(options.type).to.eq('sql');
        expect(options.displayHelp).to.be.true;
        expect(options.dto).to.be.false;
      });
    });
    describe('having files', function () {
      it('keeps track of them', function () {
        var options = parseOptions([1, 2, '-db', 'sql', '-service', '-dto', 'myfile1', 'myfile2', 'myfile3']);
        expect(options.files).to.deep.equal(['myfile1', 'myfile2', 'myfile3'])
      });
    });
  });
});
