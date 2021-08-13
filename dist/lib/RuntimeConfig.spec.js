"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const fs = require("fs-extra");
const chai_1 = require("chai");
const FunctionMap_1 = require("./FunctionMap");
const RuntimeConfig_1 = require("./RuntimeConfig");
const chaiSubset = require('chai-subset');
let config = require('../test/testProcessorConfig.json');
chai.use(chaiSubset);
let runtimeConfig;
let sourcePathBunchOfFiles = 'src/test/stubProject';
let sourcePathOneFile = 'src/test/stubProjectOnlyTests_oneFile';
let sourcePathSoloTests = 'src/test/stubProjectOnlyTests';
let sourcePathSoloGroup = 'src/test/stubProjectOnlyItGroup';
let sourcePathSoloSuites = 'src/test/stubProjectOnlySuite';
let sourcePathNoSolos = 'src/test/stubProjectNoSolos';
let targetPath = 'build';
function clearFiles() {
    fs.removeSync(targetPath);
}
function copyFiles(sourcePath) {
    try {
        fs.copySync(sourcePath, targetPath);
    }
    catch (err) {
        console.error(err);
    }
}
describe('RuntimeConfig tests ', function () {
    beforeEach(() => {
        let functionMap = new FunctionMap_1.default();
        runtimeConfig = new RuntimeConfig_1.RuntimeConfig(functionMap, config);
    });
    describe('oneFile', function () {
        beforeEach(() => {
            clearFiles();
        });
        it('processes valid test file', () => {
            copyFiles(sourcePathOneFile);
            runtimeConfig.process();
            let suites = runtimeConfig.testSuites;
            chai_1.expect(suites).to.not.be.null;
        });
        it('processes bunch of files', () => {
            copyFiles(sourcePathBunchOfFiles);
            runtimeConfig.process();
            let suites = runtimeConfig.testSuites;
            chai_1.expect(suites).to.not.be.null;
        });
        it('processes files with solo suite', () => {
            copyFiles(sourcePathSoloSuites);
            runtimeConfig.process();
            let suites = runtimeConfig.testSuites;
            chai_1.expect(suites).to.not.be.null;
        });
        it('processes files with solo group', () => {
            copyFiles(sourcePathSoloGroup);
            runtimeConfig.process();
            let suites = runtimeConfig.testSuites;
            chai_1.expect(suites).to.not.be.null;
        });
        it('processes files with solo tests', () => {
            copyFiles(sourcePathSoloTests);
            runtimeConfig.process();
            let suites = runtimeConfig.testSuites;
            chai_1.expect(suites).to.not.be.null;
        });
        it('processes files with no solo tests', () => {
            copyFiles(sourcePathNoSolos);
            runtimeConfig.process();
            let suites = runtimeConfig.testSuites;
            chai_1.expect(suites).to.not.be.null;
            let json = runtimeConfig.asJson(); //TODO test these return values
        });
    });
});
