var chai = require('chai'),
    expect = chai.expect,
    parser = require('../editors/parser');

describe('Parser', function() {
  it('is not accessible outside the file', function() {
    expect(parser.Parser).to.be.undefined;
  });
});

describe('AbstractParser', function() {
  it('is accessible outside the file', function() {
    expect(parser.AbstractParser).not.to.be.undefined;
  });

  describe('when trying to access its operations', function() {
    describe('#initialize',function() {
      it('is accessible', function() {
        expect(new parser.AbstractParser(null, null)).not.to.be.undefined;
      });
    });

    describe('#parse', function() {
      it('is accessible', function() {
        expect(new parser.AbstractParser(null, null).parse).not.to.be.undefined;
      });
    });

    describe('#findElements', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).findElements
        ).not.to.be.undefined;
      });
    });

    describe('#findTypes', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).findTypes
        ).not.to.be.undefined;
      });

      it('is not defined yet', function() {
        try {
          new parser.AbstractParser(null, null).findTypes();
          fail();
        } catch (error) {
          expect(error.name).to.equal('UnimplementedOperationException');
        }
      });
    });

    describe('#findClasses', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).findClasses
        ).not.to.be.undefined;
      });

      it('is not defined yet', function() {
        try {
          new parser.AbstractParser(null, null).findTypes();
          fail();
        } catch (error) {
          expect(error.name).to.equal('UnimplementedOperationException');
        }
      });
    });

    describe('#findAssociations', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).findAssociations
        ).not.to.be.undefined;
      });

      it('is not defined yet', function() {
        try {
          new parser.AbstractParser(null, null).findAssociations();
          fail();
        } catch (error) {
          expect(error.name).to.equal('UnimplementedOperationException');
        }
      });
    });

    describe('#findConstraints', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).findConstraints
        ).not.to.be.undefined;
      });

      it('is not defined yet', function() {
        try {
          new parser.AbstractParser(null, null).findConstraints();
          fail();
        } catch (error) {
          expect(error.name).to.equal('UnimplementedOperationException');
        }
      });
    });

    describe('#fillTypes', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).fillTypes
        ).not.to.be.undefined;
      });

      it('is not defined yet', function() {
        try {
          new parser.AbstractParser(null, null).fillTypes();
          fail();
        } catch (error) {
          expect(error.name).to.equal('UnimplementedOperationException');
        }
      });
    });

    describe('#fillAssociations', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).fillAssociations
        ).not.to.be.undefined;
      });

      it('is not defined yet', function() {
        try {
          new parser.AbstractParser(null, null).fillAssociations();
          fail();
        } catch (error) {
          expect(error.name).to.equal('UnimplementedOperationException');
        }
      });
    });

    describe('#fillClassesAndFields', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).fillClassesAndFields
        ).not.to.be.undefined;
      });

      it('is not defined yet', function() {
        try {
          new parser.AbstractParser(null, null).fillClassesAndFields();
          fail();
        } catch (error) {
          expect(error.name).to.equal('UnimplementedOperationException');
        }
      });
    });

    describe('#fillConstraints', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).fillConstraints
        ).not.to.be.undefined;
      });

      it('is not defined yet', function() {
        try {
          new parser.AbstractParser(null, null).fillConstraints();
          fail();
        } catch (error) {
          expect(error.name).to.equal('UnimplementedOperationException');
        }
      });
    });

    describe('#getUserClassId', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).getUserClassId
        ).not.to.be.undefined;
      });
    });

    describe('#getTypes', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).getTypes
        ).not.to.be.undefined;
      });

      it('is defined', function() {
         new parser.AbstractParser(null, null).getTypes();
      });
    });

    describe('#getClasses', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).getClasses
        ).not.to.be.undefined;
      });

      it('is defined', function() {
         new parser.AbstractParser(null, null).getClasses();
      });
    });

    describe('#getFields', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).getFields
        ).not.to.be.undefined;
      });

      it('is defined', function() {
         new parser.AbstractParser(null, null).getFields();
      });
    });

    describe('#getInjectedFields', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).getInjectedFields
        ).not.to.be.undefined;
      });

      it('is defined', function() {
         new parser.AbstractParser(null, null).getInjectedFields();
      });
    });

    describe('#getAssociations', function() {
      it('is accessible', function() {
        expect(
          new parser.AbstractParser(null, null).getAssociations
        ).not.to.be.undefined;
      });

      it('is defined', function() {
         new parser.AbstractParser(null, null).getAssociations();
      });
    });
  });
});
