'use strict';

const expect = require('chai').expect,
  fail = expect.fail,
  areJHipsterEntitiesEqual = require('../../lib/helpers/object_helper').areJHipsterEntitiesEqual;

describe('ObjectHelper', () => {
  describe('::areJHipsterEntitiesEqual', () => {
    describe('when passing invalid arguments', () => {
      describe('for the first object', () => {
        it('fails', () => {
          try {
            areJHipsterEntitiesEqual(null, {});
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('for the second object', () => {
        it('fails', () => {
          try {
            areJHipsterEntitiesEqual({}, null);
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
      describe('for the both objects', () => {
        it('fails', () => {
          try {
            areJHipsterEntitiesEqual(null, null);
            fail();
          } catch (error) {
            expect(error.name).to.eq('NullPointerException');
          }
        });
      });
    });
    describe('when comparing objects', () => {
      describe('if they are identical', () => {
        const first = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "job",
      "otherEntityName": "job",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    },
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "department",
      "otherEntityName": "department",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    },
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "employee",
      "otherEntityName": "employee",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    }
  ],
  "fields": [
    {
      "fieldName": "startDate",
      "fieldType": "ZonedDateTime",
      "fieldValidateRules": [
        "required"
      ]
    },
    {
      "fieldName": "endDate",
      "fieldType": "ZonedDateTime"
    }
  ],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);
        const second = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "job",
      "otherEntityName": "job",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    },
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "department",
      "otherEntityName": "department",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    },
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "employee",
      "otherEntityName": "employee",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    }
  ],
  "fields": [
    {
      "fieldName": "startDate",
      "fieldType": "ZonedDateTime",
      "fieldValidateRules": [
        "required"
      ]
    },
    {
      "fieldName": "endDate",
      "fieldType": "ZonedDateTime"
    }
  ],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);

        it('returns true', () => {
          expect(areJHipsterEntitiesEqual(first, second)).to.be.true;
        });
      });
      describe('if they are both empty', () => {
        const first = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);
        const second = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);

        it('returns true', () => {
          expect(areJHipsterEntitiesEqual(first, second)).to.be.true;
        });
      });
      describe('if they both have the same fields', () => {
        const first = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [
    {
      "fieldName": "startDate",
      "fieldType": "ZonedDateTime",
      "fieldValidateRules": [
        "required"
      ]
    },
    {
      "fieldName": "endDate",
      "fieldType": "ZonedDateTime"
    }
  ],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);
        const second = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [
    {
      "fieldName": "startDate",
      "fieldType": "ZonedDateTime",
      "fieldValidateRules": [
        "required"
      ]
    },
    {
      "fieldName": "endDate",
      "fieldType": "ZonedDateTime"
    }
  ],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);

        it('returns true', () => {
          expect(areJHipsterEntitiesEqual(first, second)).to.be.true;
        });
      });
      describe('if their fields are not ordered the same', () => {
        const first = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [
    {
      "fieldName": "startDate",
      "fieldType": "ZonedDateTime",
      "fieldValidateRules": [
        "required"
      ]
    },
    {
      "fieldName": "endDate",
      "fieldType": "ZonedDateTime"
    }
  ],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);
        const second = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [
    {
      "fieldName": "endDate",
      "fieldType": "ZonedDateTime"
    },
    {
      "fieldName": "startDate",
      "fieldType": "ZonedDateTime",
      "fieldValidateRules": [
        "required"
      ]
    }
  ],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);

        it('returns false', () => {
          expect(areJHipsterEntitiesEqual(first, second)).to.be.false;
        });
      });
      describe('if their field attributes are not ordered the same', () => {
        const first = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [
    {
      "fieldType": "ZonedDateTime",
      "fieldName": "startDate",
      "fieldValidateRules": [
        "required"
      ]
    },
    {
      "fieldName": "endDate",
      "fieldType": "ZonedDateTime"
    }
  ],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);
        const second = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [
    {
      "fieldName": "startDate",
      "fieldType": "ZonedDateTime",
      "fieldValidateRules": [
        "required"
      ]
    },
    {
      "fieldName": "endDate",
      "fieldType": "ZonedDateTime"
    }
  ],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);

        it('returns true', () => {
          expect(areJHipsterEntitiesEqual(first, second)).to.be.true;
        });
      });
      describe('if they both have the same relationships', () => {
        const first = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "job",
      "otherEntityName": "job",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    },
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "department",
      "otherEntityName": "department",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    },
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "employee",
      "otherEntityName": "employee",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    }
  ],
  "fields": [],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);
        const second = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "job",
      "otherEntityName": "job",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    },
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "department",
      "otherEntityName": "department",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    },
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "employee",
      "otherEntityName": "employee",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    }
  ],
  "fields": [],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);

        it('returns true', () => {
          expect(areJHipsterEntitiesEqual(first, second)).to.be.true;
        });
      });
      describe('if their relationships are not ordered the same', () => {
        const first = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "job",
      "otherEntityName": "job",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    },
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "employee",
      "otherEntityName": "employee",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    },
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "department",
      "otherEntityName": "department",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    }
  ],
  "fields": [],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);
        const second = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "job",
      "otherEntityName": "job",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    },
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "department",
      "otherEntityName": "department",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    },
    {
      "relationshipType": "one-to-one",
      "relationshipValidateRules": "required",
      "relationshipName": "employee",
      "otherEntityName": "employee",
      "otherEntityField": "id",
      "ownerSide": true,
      "otherEntityRelationshipName": "jobHistory"
    }
  ],
  "fields": [],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);

        it('returns false', () => {
          expect(areJHipsterEntitiesEqual(first, second)).to.be.false;
        });
      });
      describe('if they both have the same options', () => {
        const first = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [],
  "changelogDate": "20160903132328",
  "dto": "mapstruct",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);
        const second = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [],
  "changelogDate": "20160903132328",
  "dto": "mapstruct",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);

        it('returns true', () => {
          expect(areJHipsterEntitiesEqual(first, second)).to.be.true;
        });
      });
      describe("if they don't have the same options", () => {
        const first = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);
        const second = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [],
  "changelogDate": "20160903132328",
  "dto": "mapstruct",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);

        it('returns false', () => {
          expect(areJHipsterEntitiesEqual(first, second)).to.be.false;
        });
      });
      describe('if their changelogDate differ', () => {
        const first = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [],
  "changelogDate": "20160903132329",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);
        const second = JSON.parse(`{
  "fluentMethods": true,
  "relationships": [],
  "fields": [],
  "changelogDate": "20160903132328",
  "dto": "no",
  "pagination": "no",
  "service": "no",
  "entityTableName": "job_history"
}`);
        it('returns true', () => {
          expect(areJHipsterEntitiesEqual(first, second)).to.be.true;
        });
      });
    });
  });
});
