'use strict';

var expect = require('chai').expect,
    fail = expect.fail,
    isAValidDTO = require('../../lib/helpers/jhipster_option_helper').isAValidDTO,
    isAValidPagination = require('../../lib/helpers/jhipster_option_helper').isAValidPagination,
    isAValidService = require('../../lib/helpers/jhipster_option_helper').isAValidService;

describe('#isAValidDTO', function() {
  describe('when passing a valid DTO option', function() {
    it('returns true', function() {
      expect(isAValidDTO('mapstruct')).to.be.true;
    });
  });

  describe('when passing an invalid DTO option', function() {
    it('returns false', function() {
      expect(isAValidDTO('not a valid DTO option!')).to.be.false;
    });
  });
});

describe('#isAValidPagination', function() {
  describe('when passing a valid pagination option', function() {
    it('returns true', function() {
      expect(isAValidPagination('pager')).to.be.true;
    });
  });

  describe('when passing an invalid pagination option', function() {
    it('returns false', function() {
      expect(isAValidPagination('not a valid pagination option!!')).to.be.false;
    });
  });
});

describe('#isAValidService', function() {
  describe('when passing a valid service option', function() {
    it('returns true', function() {
      expect(isAValidService('serviceClass')).to.be.true;
    });
  });

  describe('when passing an invalid service option', function() {
    it('returns false', function() {
      expect(isAValidService('not a valid service option!!')).to.be.false;
    });
  });
});
