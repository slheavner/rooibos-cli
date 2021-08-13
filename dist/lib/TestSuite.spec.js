"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const fs = require("fs-extra");
const chai_1 = require("chai");
const TestSuiteBuilder_1 = require("./TestSuiteBuilder");
const TestUtils_1 = require("./TestUtils");
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);
let builder;
let sourcePath = 'src/test/stubProject';
let targetPath = 'build';
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
describe('TestSuite tests ', function () {
    beforeEach(() => {
        builder = new TestSuiteBuilder_1.TestSuiteBuilder(50, false);
    });
    describe('asJson', function () {
        beforeEach(() => {
            clearFiles();
            copyFiles();
        });
        it('processes valid test file', () => {
            let file = TestUtils_1.makeFile(`build/source/tests/specs`, `VideoModuleTests.brs`);
            let testSuite = builder.processFile(file);
            chai_1.expect(testSuite).to.not.be.null;
            chai_1.expect(testSuite.isValid).to.be.true;
            let json = testSuite.asJson();
            chai_1.expect(json).to.not.be.null;
        });
    });
});
