'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    DatabaseTypes = require('jhipster-core').JHipsterDatabaseTypes.Types,
    UMLDesignerParser = require('../../lib/editors/umldesigner_parser'),
    xml2js = require('xml2js'),
    fs = require('fs'),
    SQLTypes = require('../../lib/types/sql_types'),
    MongoDBTypes = require('../../lib/types/mongodb_types'),
    CassandraTypes = require('../../lib/types/cassandra_types'),
    buildException = require('../../lib/exceptions/exception_factory').buildException,
    exceptions = require('../../lib/exceptions/exception_factory').exceptions;

describe('UMLDesignerParser', () => {
  describe('when passing a valid diagram', () => {
    describe('taken from the HR example', () => {
      var parsedData = UMLDesignerParser.parse({
        root: getRootElement(readFileContent('./test/xmi/umldesigner.uml')),
        databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
      });

      it('parses it', () => {
        expect(parsedData).not.to.be.null;
      });
      it('correctly parses the JobHistory class', () => {
        var jobHistory = parsedData.classes['_q9OKYLvPEeWmS7iaRSwQeQ'];
        expect(jobHistory.name).to.eq('JobHistory');
        expect(jobHistory.tableName).to.eq('job_history');
        expect(jobHistory.fields).to.deep.eq([
          '_KsO50LvQEeWmS7iaRSwQeQ',
          '_MkO9QLvQEeWmS7iaRSwQeQ'
        ]);
        expect(jobHistory.comment).to.eq('');
        expect(jobHistory.dto).to.eq('no');
        expect(jobHistory.pagination).to.eq('no');
        expect(jobHistory.service).to.eq('no');
      });
      it('correctly parses the Job class', () => {
        var job = parsedData.classes['_4wnzYLvQEeWmS7iaRSwQeQ'];
        expect(job.name).to.eq('Job');
        expect(job.tableName).to.eq('job');
        expect(job.fields).to.deep.eq([
          '_7MxFsLvQEeWmS7iaRSwQeQ',
          '_9SifYLvQEeWmS7iaRSwQeQ'
        ]);
        expect(job.comment).to.eq('');
        expect(job.dto).to.eq('no');
        expect(job.pagination).to.eq('no');
        expect(job.service).to.eq('no');
      });
      it('correctly parses the Department class', () => {
        var department = parsedData.classes['_RAdQ8LvQEeWmS7iaRSwQeQ'];
        expect(department.name).to.eq('Department');
        expect(department.tableName).to.eq('department');
        expect(department.fields).to.deep.eq([
          '_SM09cLvQEeWmS7iaRSwQeQ',
          '_WspXsLvQEeWmS7iaRSwQeQ'
        ]);
        expect(department.comment).to.eq('');
        expect(department.dto).to.eq('no');
        expect(department.pagination).to.eq('no');
        expect(department.service).to.eq('no');
      });
      it('correctly parses the Employee class', () => {
        var employee = parsedData.classes['_1_M_MLvREeWmS7iaRSwQeQ'];
        expect(employee.name).to.eq('Employee');
        expect(employee.tableName).to.eq('employee');
        expect(employee.fields).to.deep.eq([
          '_Ujyi4LvSEeWmS7iaRSwQeQ',
          '_XZUlkLvSEeWmS7iaRSwQeQ',
          '_cUZ_gLvSEeWmS7iaRSwQeQ',
          '_elRO4LvSEeWmS7iaRSwQeQ',
          '_hQJgwLvSEeWmS7iaRSwQeQ',
          '_kp98QLvSEeWmS7iaRSwQeQ',
          '_n7ySULvSEeWmS7iaRSwQeQ',
          '_qm_7YLvSEeWmS7iaRSwQeQ'
        ]);
        expect(employee.comment).to.eq('');
        expect(employee.dto).to.eq('no');
        expect(employee.pagination).to.eq('no');
        expect(employee.service).to.eq('no');
      });
      it('correctly parses the Location class', () => {
        var location = parsedData.classes['_DCZ6ULvTEeWmS7iaRSwQeQ'];
        expect(location.name).to.eq('Location');
        expect(location.tableName).to.eq('location');
        expect(location.fields).to.deep.eq([
          '_EfSvELvTEeWmS7iaRSwQeQ',
          '_GrL-4LvTEeWmS7iaRSwQeQ',
          '_KWzVALvTEeWmS7iaRSwQeQ',
          '_NQNLELvTEeWmS7iaRSwQeQ',
          '_P_k7YLvTEeWmS7iaRSwQeQ'
        ]);
        expect(location.comment).to.eq('');
        expect(location.dto).to.eq('no');
        expect(location.pagination).to.eq('no');
        expect(location.service).to.eq('no');
      });
      it('correctly parses the Country class', () => {
        var country = parsedData.classes['_igcOgLvTEeWmS7iaRSwQeQ'];
        expect(country.name).to.eq('Country');
        expect(country.tableName).to.eq('country');
        expect(country.fields).to.deep.eq([
          '_ka5JALvTEeWmS7iaRSwQeQ',
          '_meCFcLvTEeWmS7iaRSwQeQ'
        ]);
        expect(country.comment).to.eq('');
        expect(country.dto).to.eq('no');
        expect(country.pagination).to.eq('no');
        expect(country.service).to.eq('no');
      });
      it('correctly parses the Region class', () => {
        var region = parsedData.classes['_tCa_gLvTEeWmS7iaRSwQeQ'];
        expect(region.name).to.eq('Region');
        expect(region.tableName).to.eq('region');
        expect(region.fields).to.deep.eq([
          '_vF-LoLvTEeWmS7iaRSwQeQ',
          '_xksQ0LvTEeWmS7iaRSwQeQ'
        ]);
        expect(region.comment).to.eq('');
        expect(region.dto).to.eq('no');
        expect(region.pagination).to.eq('no');
        expect(region.service).to.eq('no');
      });
      it('correctly parses the Task class', () => {
        var task = parsedData.classes['_xC4PILvREeWmS7iaRSwQeQ'];
        expect(task.name).to.eq('Task');
        expect(task.tableName).to.eq('task');
        expect(task.fields).to.deep.eq([
          '_4l-NILvREeWmS7iaRSwQeQ',
          '_6-KMgLvREeWmS7iaRSwQeQ',
          '_9hCY8LvREeWmS7iaRSwQeQ'
        ]);
        expect(task.comment).to.eq('');
        expect(task.dto).to.eq('no');
        expect(task.pagination).to.eq('no');
        expect(task.service).to.eq('no');
      });
      it('correctly adds the class names', () => {
        expect(parsedData.classNames).to.deep.eq([
          'JobHistory',
          'Department',
          'Job',
          'Task',
          'Employee',
          'Location',
          'Country',
          'Region'
        ]);
      });
    });
    describe('with required relationships', () => {
      var parsedData = UMLDesignerParser.parse({
        root: getRootElement(readFileContent('./test/xmi/umldesigner_required_relationships.uml')),
        databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
      });
      var parsedData2 = UMLDesignerParser.parse({
        root: getRootElement(readFileContent('./test/xmi/umldesigner_no_lower_bound.uml')),
        databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
      });

      it('sets the required flag in the AssociationData objects', () => {
        for (let i = 0, associationKeys = Object.keys(parsedData.associations); i < associationKeys.length; i++) {
          expect(
            parsedData.associations[associationKeys[i]].isInjectedFieldInFromRequired
              && parsedData.associations[associationKeys[i]].isInjectedFieldInToRequired
          ).to.be.true;
        }
      });

      describe('when parsing a file containing a relationship with no lower bound', () => {
        it('must not set it as required', () => {
          for (let i = 0, associationKeys = Object.keys(parsedData2.associations); i < associationKeys.length; i++) {
            expect(
              parsedData2.associations[associationKeys[i]].isInjectedFieldInFromRequired
                && parsedData2.associations[associationKeys[i]].isInjectedFieldInToRequired
            ).to.be.false;
          }
        });
      });
    });
    describe('with a lowercase type', () => {
      var parsedData = UMLDesignerParser.parse({
        root: getRootElement(readFileContent('./test/xmi/umldesigner_lowercased_string_type.uml')),
        databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
      });

      it('adds it capitalized', () => {
        expect(parsedData.types['_IEL5gLvQEeWmS7iaRSwQeQ'].name).to.eq('String');
      });
    });
    describe('with comments', () => {
      var parsedData = UMLDesignerParser.parse({
        root: getRootElement(readFileContent('./test/xmi/umldesigner_comments.uml')),
        databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
      });

      it('parses it', () => {
        expect(parsedData).not.to.be.null;
      });
      it('adds comments in classes', () => {
        expect(parsedData.classes['_2q878FFXEeWn8vWfxOEIOg'].comment).to.eq(
`This is a class comment.<br/>
This <b>sucks</b>.`
        );
        expect(parsedData.classes['_5fY9AFFYEeWn8vWfxOEIOg'].comment).to.eq('Another&nbsp;comment.');
      });
      it('adds comments in fields', () => {
        expect(parsedData.fields['_MYveEFFYEeWn8vWfxOEIOg'].comment).to.eq(
`This is an attribute comment.<br/>
<p>This sucks <i>too</i></p>`
        );
      });
      it('adds comments in relationships, but does not support both sides', () => {
        expect(parsedData.associations['_9ZgpMFFYEeWn8vWfxOEIOg'].commentInFrom).to.eq('Comment on a relationship.');
        expect(parsedData.associations['_9ZgpMFFYEeWn8vWfxOEIOg'].commentInTo).to.eq('Comment on a relationship.');
      });
    });
    describe('with a user class', () => {
      var parsedData = UMLDesignerParser.parse({
        root: getRootElement(readFileContent('./test/xmi/umldesigner_user.uml')),
        databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql),
        noUserManagement: true
      });

      it('parses it', () => {
        expect(parsedData).not.to.be.null;
      });
      it('includes the user class', () => {
        expect(parsedData.classes['_tCa_gLvTEeWmS7iaRSwQeQ']).not.to.be.null;
        expect(parsedData.classNames).to.deep.eq(['User']);
      });
    });
    describe('with enums', () => {
      describe('with values', () => {
        var parsedData = UMLDesignerParser.parse({
          root: getRootElement(readFileContent('./test/xmi/umldesigner_enum_test.uml')),
          databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
        });

        it('parses it', () => {
          expect(parsedData).not.to.be.null;
        });
        it('adds the enums and the values', () => {
          expect(parsedData.enums['_iYeo8CGOEeW-sfm-95cxKg']).not.to.be.null;
          expect(parsedData.enums['_iYeo8CGOEeW-sfm-95cxKg'].name).to.eq('MyEnumeration');
          expect(parsedData.enums['_iYeo8CGOEeW-sfm-95cxKg'].values).to.deep.eq(['VALUE_A', 'VALUE_B']);
          expect(parsedData.enums['_jzWEcCGOEeW-sfm-95cxKg']).not.to.be.null;
          expect(parsedData.enums['_jzWEcCGOEeW-sfm-95cxKg'].name).to.eq('MyEnumeration2');
          expect(parsedData.enums['_jzWEcCGOEeW-sfm-95cxKg'].values).to.deep.eq(['VALUE_A']);
        });
      });
      describe('without values', () => {
        var parsedData = UMLDesignerParser.parse({
          root: getRootElement(readFileContent('./test/xmi/umldesigner_enum_no_value_test.uml')),
          databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
        });

        it('parses it', () => {
          expect(parsedData).not.to.be.null;
        });
        it('still adds the enum', () => {
          expect(parsedData.enums['_iYeo8CGOEeW-sfm-95cxKg']).not.to.be.null;
        });
      });
    });
  });
  describe('when passing an invalid diagram', () => {
    describe('as a class has no name', () => {
      it('fails', () => {
        try {
          UMLDesignerParser.parse({
            root: getRootElement(readFileContent('./test/xmi/umldesigner_no_class_name_test.uml')),
            databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('as a field has no name', () => {
      it('fails', () => {
        try {
          UMLDesignerParser.parse({
            root: getRootElement(readFileContent('./test/xmi/umldesigner_no_attribute_name_test.uml')),
            databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe("as an enum's value as no name", () => {
      it('fails', () => {
        try {
          UMLDesignerParser.parse({
            root: getRootElement(readFileContent('./test/xmi/umldesigner_enum_no_attribute_name_test.uml')),
            databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('as an enum has no name', () => {
      it('fails', () => {
        try {
          UMLDesignerParser.parse({
            root: getRootElement(readFileContent('./test/xmi/umldesigner_enum_no_name_test.uml')),
            databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('as a class name is a reserved word', () => {
      it('fails', () => {
        try {
          UMLDesignerParser.parse({
            root: getRootElement(readFileContent('./test/xmi/umldesigner_reserved_class_name_test.uml')),
            databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalNameException');
        }
      });
    });
    describe('as a field name is a reserved word', () => {
      it('fails', () => {
        try {
          UMLDesignerParser.parse({
            root: getRootElement(readFileContent('./test/xmi/umldesigner_reserved_field_name_test.uml')),
            databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalNameException');
        }
      });
    });
    describe('as a table name is a reserved word', () => {
      it('fails', () => {
        try {
          UMLDesignerParser.parse({
            root: getRootElement(readFileContent('./test/xmi/umldesigner_reserved_table_name_test.uml')),
            databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('IllegalNameException');
        }
      });
    });
    describe('as an invalid type is used', () => {
      it('fails', () => {
        try {
          UMLDesignerParser.parse({
            root: getRootElement(readFileContent('./test/xmi/umldesigner_wrong_typename.uml')),
            databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
          });
          fail();
        } catch (error) {
          expect(error.name).to.eq('WrongTypeException');
        }
      });
    });
    describe('with a user package', () => {
      var parsedData = UMLDesignerParser.parse({
        root: getRootElement(readFileContent('./test/xmi/umldesigner_package.uml')),
        databaseTypes: initDatabaseTypeHolder(DatabaseTypes.sql)
      });

      it('parses it', () => {
        expect(parsedData).not.to.be.null;
      });
      it('includes classes in package', () => {
        expect(parsedData.classes['_wx0Db4PVEeaFY_lPQPbINQ']).not.to.be.null;
        expect(parsedData.classes['_wx0DdoPVEeaFY_lPQPbINQ']).not.to.be.null;
        expect(parsedData.classNames).to.deep.eq(['B','A']);
        expect(parsedData.enums['_dRpdIKFLEeaWHdu8QjKipg']).not.to.be.null;
        expect(parsedData.associations['_vB6ZwKFLEeaWHdu8QjKipg']).not.to.be.null;
        expect(parsedData.associations['_9ZrJgKFLEeaWHdu8QjKipg']).not.to.be.null;
      });
    });
  });
});

// external functions

function readFileContent(file) {
  try {
    fs.statSync(file).isFile();
  } catch (error) {
    throw new buildException(
        exceptions.WrongFile,
        `The passed file '${file}' must exist and must not be a directory.`);
  }
  return fs.readFileSync(file, 'utf-8');
}

function getRootElement(content) {
  var root;
  var parser = new xml2js.Parser();
  parser.parseString(content, function (err, result) {
    if (result.hasOwnProperty('uml:Model')) {
      root = result['uml:Model'];
    } else if (result.hasOwnProperty('xmi:XMI')) {
      root = result['xmi:XMI']['uml:Model'][0];
    } else {
      throw new buildException(
          exceptions.NoRoot,
          'The passed document has no immediate root element.');
    }
  });
  return root;
}

function initDatabaseTypeHolder(databaseTypeName) {
  switch (databaseTypeName) {
  case DatabaseTypes.sql:
    return new SQLTypes();
  case DatabaseTypes.mongodb:
    return new MongoDBTypes();
  case DatabaseTypes.cassandra:
    return new CassandraTypes();
  default:
    throw new buildException(exceptions.WrongDatabaseType,
        'The passed database type is incorrect. '
        + "It must either be 'sql', 'mongodb', or 'cassandra'. "
        + `Got '${databaseTypeName}'.`);
  }
}
