"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const fs = require("fs-extra");
const path = require("path");
const chai_1 = require("chai");
const RooibosProcessor_1 = require("./RooibosProcessor");
const TestCase_1 = require("./TestCase");
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);
let sourcePath = path.resolve(__dirname, '../test/stubProjectNoSolos');
let targetPath = path.resolve(__dirname, '../../build');
let processor;
let config = require('../test/testProcessorConfig.json');
function clearFiles() {
    fs.removeSync(targetPath);
}
function copyFiles() {
    try {
        fs.copySync(sourcePath, targetPath);
    }
    catch (err) {
        console.error(err);
    }
}
describe('TestCase tests ', function () {
    beforeEach(() => {
        processor = new RooibosProcessor_1.RooibosProcessor(config);
        processor.processFiles();
    });
    describe('asJson', function () {
        beforeEach(() => {
            clearFiles();
            copyFiles();
        });
        it('processes valid test file', () => {
            let testSuite = processor.runtimeConfig.testSuites[3];
            chai_1.expect(testSuite).to.not.be.null;
            chai_1.expect(testSuite.isValid).to.be.true;
            let json = testSuite.asJson();
            chai_1.expect(json).to.not.be.null;
            chai_1.expect(json.itGroups['1'].testCases['1'].isParamsValid).to.be.true;
            chai_1.expect(json.itGroups['1'].testCases['1'].isParamTest).to.be.true;
            chai_1.expect(json.itGroups['1'].testCases['1'].expectedNumberOfParams).to.equal(3);
            chai_1.expect(json.itGroups['1'].testCases['1'].rawParams).to.equal('[2,"mpg",["video_0","video_1"]]');
        });
        it('rawParams value for non params test', () => {
            let testCase = new TestCase_1.TestCase('test', 'testFunc', true, false, 10);
            let json = testCase.asJson();
            chai_1.expect(json).to.not.be.null;
            chai_1.expect(json.isParamTest).to.be.false;
            chai_1.expect(json.isParamsValid).to.be.true;
            chai_1.expect(json.expectedNumberOfParams).to.equal(0);
            chai_1.expect(json.rawParams).to.equal('');
        });
    });
});
