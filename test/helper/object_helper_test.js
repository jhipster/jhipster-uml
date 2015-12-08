'use strict';

var expect = require('chai').expect,
    merge = require('../../lib/helpers/object_helper').merge,
    areJHipsterEntitiesEqual = require('../../lib/helpers/object_helper').areJHipsterEntitiesEqual;

describe('ObjectHelper', function() {
  describe('#merge', function() {
    var object1 = {
      a: 1,
      b: 2
    };

    var object2 = {
      b: 3,
      c: 4
    };

    describe('when merging two object', function() {
      it('returns the merged object by merging the second into the first', function() {
        expect(
          merge(object1, object2)
        ).to.deep.equal({ a: 1, b: 3, c: 4 });

        expect(
          merge(object2, object1)
        ).to.deep.equal({ a: 1, b: 2, c: 4 });
      });

      it('does not modify any of the two objects', function() {
        merge(object1, object2);
        expect(
          object1
        ).to.deep.equal({ a: 1, b: 2 });
        expect(
          object2
        ).to.deep.equal({ b: 3,  c: 4 });
      });
    });
  });

  describe('#areJHipsterEntitiesEqual', function() {
    describe('when comparing two equal objects', function() {
      describe('as they are empty', function() {
        it('returns true', function() {
          var firstEmptyObject = {
            fields: [],
            relationships: []
          };
          var secondEmptyObject = {
            fields: [],
            relationships: []
          };
          expect(areJHipsterEntitiesEqual(firstEmptyObject, secondEmptyObject)).to.be.true;
        });
      });
      describe('they have no fields, but only relationships', function() {
        it('returns true', function() {
          var firstObject = {
            fields: [],
            relationships: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ]
          };
          var secondObject = {
            fields: [],
            relationships: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ]
          };
          expect(areJHipsterEntitiesEqual(firstObject, secondObject)).to.be.true;
        });
      });
      describe('they have fields but no relationships', function() {
        it('returns true', function() {
          var firstObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: []
          };
          var secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: []
          };
          expect(areJHipsterEntitiesEqual(firstObject, secondObject)).to.be.true;
        });
      });
      describe('they have both fields and relationships', function() {
        it('returns true', function() {
          var firstObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ]
          };
          var secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ]
          };
          expect(areJHipsterEntitiesEqual(firstObject, secondObject)).to.be.true;
        });
      });
    });
    describe('when comparing two unequal objects', function() {
      describe('as one of them is not empty, the other is', function() {
        it('returns false', function() {
          var firstObject = {
            fields: [],
            relationships: []
          };
          var secondObject = {
            fields: [],
            relationships: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ]
          };
          expect(areJHipsterEntitiesEqual(firstObject, secondObject)).to.be.false;
          var firstObject = {
            fields: [],
            relationships: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ]
          };
          var secondObject = {
            fields: [],
            relationships: []
          };
          expect(areJHipsterEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      describe('as both of them have different fields', function() {
        it('returns false', function() {
          var firstObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: []
          };
          var secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 44
              }
            ],
            relationships: []
          };
          expect(areJHipsterEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      describe('as both of them have different relationships', function() {
        it('returns false', function() {
          var firstObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 2,
                anotherField: 44
              }
            ]
          };
          var secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          expect(areJHipsterEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      describe('as they do not possess the same number of fields', function() {
        it('returns false', function() {
          var firstObject = {
            fields: [],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          var secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          expect(areJHipsterEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
      });
      describe('as they do not have the same number of keys in fields', function() {
        it('returns false', function() {
          var firstObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42,
                yetAnother: false
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          var secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          expect(areJHipsterEntitiesEqual(firstObject, secondObject)).to.be.false;
        })
      });
      describe('as they do not possess the same number of relationships', function() {
        it('returns false', function() {
          var firstObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              }
            ]
          };
          var secondObject = {
            fields: [
              {
                id: 1,
                theAnswer: 42
              },
              {
                id: 2,
                notTheAnswer: 43
              }
            ],
            relationships: [
              {
                id: 1,
                anotherField: 44
              },
              {
                id: 2,
                anotherField: 44
              }
            ]
          };
          expect(areJHipsterEntitiesEqual(firstObject, secondObject)).to.be.false;
        });
        describe('as they do not have the same number of fields in a relationship', function() {
          it('returns false', function() {
            var firstObject = {
              fields: [
                {
                  id: 1,
                  theAnswer: 42
                },
                {
                  id: 2,
                  notTheAnswer: 43
                }
              ],
              relationships: [
                {
                  id: 1,
                  anotherField: 44
                }
              ]
            };
            var secondObject = {
              fields: [
                {
                  id: 1,
                  theAnswer: 42
                },
                {
                  id: 2,
                  notTheAnswer: 43
                }
              ],
              relationships: [
                {
                  id: 1,
                  anotherField: 44,
                  yetAnother: false
                },
                {
                  id: 2,
                  anotherField: 44
                }
              ]
            };
            expect(areJHipsterEntitiesEqual(firstObject, secondObject)).to.be.false;
          });
        });
      });
    });
  });
});
