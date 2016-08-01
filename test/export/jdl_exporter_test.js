'use strict';

const expect = require('chai').expect,
    fail = expect.fail,
    ParserFactory = require('../../lib/editors/parser_factory'),
    toJDL = require('../../lib/export/jdl_exporter').toJDL,
    toJDLString = require('../../lib/export/jdl_exporter').toJDLString;

describe('JDLExporter', function() {
  describe('::toJDL', function() {
    describe('when passing nil parsed data', function() {
      it('fails', function() {
        try {
          toJDL();
        } catch (error) {
          expect(error.name).to.eq('NullPointerException');
        }
      });
    });
    describe('when passing a valid parsed data', function() {
      describe('with no option', function() {
        it('creates the corresponding JDL', function() {
          var parser = ParserFactory.createParser({
            file: './test/xmi/modelio.xmi',
            databaseType: 'sql'
          });
          var parsedData = parser.parse();
          var jdl = toJDL(parsedData);
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
    });
  });
});
