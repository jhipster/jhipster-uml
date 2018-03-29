/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;

const fail = expect.fail;
const ParserFactory = require('../../lib/editors/parser_factory');
const JDLExporter = require('../../lib/export/jdl_exporter');

const toJDL = JDLExporter.toJDL;
const toJDLString = JDLExporter.toJDLString;

describe('JDLExporter', () => {
  describe('::toJDL', () => {
    context('when passing nil parsed data', () => {
      it('fails', () => {
        try {
          toJDL();
          fail();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    context('when passing a valid parsed data', () => {
      context('with no option', () => {
        const parserData = ParserFactory.createParser({
          file: './test/xmi/modelio.xmi',
          databaseType: 'sql'
        });
        const parser = parserData.parser;
        const parsedData = parser.parse(parserData.data);
        const jdl = toJDL(parsedData);

        it('creates the corresponding JDL', () => {
          expect(jdl.toString()).to.eq(
            `entity JobHistory (job_history) {
  startDate ZonedDateTime required,
  endDate ZonedDateTime
}
entity Job (job) {
  jobId Long,
  jobTitle String,
  minSalary Long,
  maxSalary Long
}
entity Department (department) {
  departmentId Long,
  departmentName String
}
entity Employee (employee) {
  employeeId Long,
  firstName String,
  lastName String,
  email String,
  phoneNumber String,
  hireDate ZonedDateTime,
  salary Long,
  commissionPct Long
}
entity Location (location) {
  locationId Long,
  streetAddress String,
  postalCode String,
  city String,
  stateProvince String
}
entity Country (country) {
  countryId Long,
  countryName String
}
entity Region (region) {
  regionId Long,
  regionName String
}
entity Task (task) {
  taskId Long,
  title String,
  description String
}
relationship OneToOne {
  JobHistory{job} to Job,
  JobHistory{department} to Department,
  JobHistory{employee} to Employee,
  Department{location} to Location,
  Location{country} to Country,
  Country{region} to Region
}
relationship OneToMany {
  Department{employee} to Employee,
  Employee{job} to Job
}
relationship ManyToOne {
  Employee{manager} to Employee
}
relationship ManyToMany {
  Job{task} to Task{job}
}

`);
        });
      });
      context('with options', () => {
        const parserData = ParserFactory.createParser({
          file: './test/xmi/modelio.xmi',
          databaseType: 'sql'
        });
        const parser = parserData.parser;
        const parsedData = parser.parse(parserData.data);
        const jdl = toJDL(parsedData, {
          listDTO: ['JobHistory', 'Job', 'Department', 'Employee', 'Location', 'Country', 'Region', 'Task'],
          listPagination: { Employee: 'pager', Job: 'pager' },
          listService: {
            JobHistory: 'serviceClass',
            Job: 'serviceClass',
            Employee: 'serviceImpl'
          },
          listOfNoClient: ['Employee'],
          listOfNoServer: ['Region'],
          microserviceNames: { Employee: 'MySuperMicroservice' },
          angularSuffixes: { Employee: 'ahah' },
          searchEngines: ['Employee']
        });

        it('adds them', () => {
          expect(jdl.toString().includes('dto * with mapstruct')).to.be.true;
          expect(jdl.toString().includes('service JobHistory, Job with serviceClass')).to.be.true;
          expect(jdl.toString().includes('service Employee with serviceImpl')).to.be.true;
          expect(jdl.toString().includes('angularSuffix Employee with ahah')).to.be.true;
          expect(jdl.toString().includes('search Employee with elasticsearch')).to.be.true;
        });
      });
      context('with an enum', () => {
        const parserData = ParserFactory.createParser({
          file: './test/xmi/modelio_enum_test.xmi',
          databaseType: 'sql'
        });
        const parser = parserData.parser;
        const parsedData = parser.parse(parserData.data);
        const jdl = toJDL(parsedData);

        it('converts it', () => {
          expect(jdl.toString()).to.equal(
            `entity MyClass (my_class) {
  myAttribute String,
  mySecondAttribute MyEnumeration,
  myThirdAttribute MySecondEnumeration,
  myFourthAttribute MyEnumeration
}

enum MyEnumeration {
  VALUE_A,
  VALUE_B
}

enum MySecondEnumeration {
  VALUE_A
}

`);
        });
      });
    });
  });
  describe('::toJDLString', () => {
    const parserData = ParserFactory.createParser({
      file: './test/xmi/modelio.xmi',
      databaseType: 'sql'
    });
    const parser = parserData.parser;
    const parsedData = parser.parse(parserData.data);
    const jdlString = toJDLString(parsedData, {
      listDTO: ['JobHistory', 'Job', 'Department', 'Employee', 'Location', 'Country', 'Region', 'Task'],
      listPagination: { Employee: 'pager', Job: 'pager' },
      listService: {
        JobHistory: 'serviceClass',
        Job: 'serviceClass',
        Employee: 'serviceImpl'
      },
      listOfNoClient: ['Employee'],
      listOfNoServer: ['Region'],
      microserviceNames: { Employee: 'MySuperMicroservice' }
    });

    it('is a stringified version of ::toJDL', () => {
      expect(jdlString.includes('dto * with mapstruct')).to.be.true;
      expect(jdlString.includes('service JobHistory, Job with serviceClass')).to.be.true;
      expect(jdlString.includes('service Employee with serviceImpl')).to.be.true;
    });
  });
});
