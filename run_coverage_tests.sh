#!/usr/bin/env bash 
rm -rf coverage
rm -rf lib-cov
 
mkdir coverage
 
node_modules/.bin/jscover lib lib-cov
mv lib lib-orig
mv lib-cov lib
JS_COV=1 ./node_modules/.bin/mocha -R mocha-lcov-reporter > coverage/coverage_temp.lcov
sed 's,SF:,SF:lib/,' coverage/coverage_temp.lcov > coverage/coverage.lcov
rm -rf lib
mv lib-orig lib
