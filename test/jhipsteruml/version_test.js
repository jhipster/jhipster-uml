'use strict';

var expect = require('chai').expect,
    fail = expect.fail,
    displayVersion = require('../../lib/jhipsteruml/version').displayVersion;

describe('#displayVersion', function() {
  describe('when asking for the version', function() {
    it('returns it', function() {
      var version = displayVersion();
      expect(version).not.to.be.null;
    });
  });
});
