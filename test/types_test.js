var chai = require('chai'),
    expect = chai.expect,
    types = require('../lib/types');

describe('Types', function() {
  it('is not accessible outside the file', function() {
    expect(types.Types).to.be.undefined;
  });
});

describe('AbstractMappedTypes', function() {
  it('is not accessible outside the file', function() {
    expect(types.AbstractMappedTypes).to.be.undefined;
  });
});
