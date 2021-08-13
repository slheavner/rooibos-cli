"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const fs = require("fs-extra");
const chai_1 = require("chai");
const Feedback_1 = require("./Feedback");
const Tag_1 = require("./Tag");
const TestSuiteBuilder_1 = require("./TestSuiteBuilder");
const TestUtils_1 = require("./TestUtils");
const __1 = require("..");
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);
let builder;
let sourcePath = 'src/test/stubProject';
let targetPath = 'build';
let specDir = 'build/source/tests/specs';
function clearFiles() {
    fs.removeSync(targetPath);
}
function copyFiles(alternatePath = null) {
    try {
        fs.copySync(alternatePath || sourcePath, targetPath);
    }
    catch (err) {
        console.error(err);
    }
}
describe('TestSuiteBuilder tests ', function () {
    beforeEach(() => {
        builder = new TestSuiteBuilder_1.TestSuiteBuilder(50, false);
    });
    describe('Initialization', function () {
        it('correctly sets source paths and config', function () {
            chai_1.expect(builder.maxLinesWithoutSuiteDirective).to.equal(50);
        });
    });
    describe('getFunctionFromLine', function () {
        it('checks non function lines', () => {
            chai_1.expect(builder.getFunctionFromLine('')).to.be.null;
            chai_1.expect(builder.getFunctionFromLine('    ')).to.be.null;
            chai_1.expect(builder.getFunctionFromLine(' m.this  = "someValue')).to.be.null;
            chai_1.expect(builder.getFunctionFromLine(`'   function long_word_Different1(with Args) as void`)).to.be.null;
            chai_1.expect(builder.getFunctionFromLine(`'function foo() as void`)).to.be.null;
        });
        it('checks function lines', () => {
            chai_1.expect(builder.getFunctionFromLine('function foo() as void')).to.equal('foo');
            chai_1.expect(builder.getFunctionFromLine('sub foo() as void')).to.equal('foo');
            chai_1.expect(builder.getFunctionFromLine('   sub foo() as void')).to.equal('foo');
            chai_1.expect(builder.getFunctionFromLine('   function foo() as void')).to.equal('foo');
            chai_1.expect(builder.getFunctionFromLine('   function long_word_Different1() as void')).to.equal('long_word_Different1');
            chai_1.expect(builder.getFunctionFromLine('   function long_word_Different1(with Args) as void')).to.equal('long_word_Different1');
        });
    });
    describe('getTagText', function () {
        it('no text/not a tag', () => {
            chai_1.expect(builder.getTagText(`@TestSuite`, Tag_1.Tag.TEST_SUITE)).to.be.empty;
            chai_1.expect(builder.getTagText(`NOT`, Tag_1.Tag.TEST_SUITE)).to.be.empty;
        });
        it('has text and has tag', () => {
            chai_1.expect(builder.getTagText(`@TestSuite someText`, Tag_1.Tag.TEST_SUITE)).to.equal(`someText`);
            chai_1.expect(builder.getTagText(`@TestSuite someText here`, Tag_1.Tag.TEST_SUITE)).to.equal(`someText here`);
            chai_1.expect(builder.getTagText(`@TestSuite     someText here2`, Tag_1.Tag.TEST_SUITE)).to.equal(`someText here2`);
        });
    });
    describe('processFile', function () {
        beforeEach(() => {
            clearFiles();
            copyFiles();
        });
        it('ignores null file descriptor', () => {
            let testSuite = builder.processFile(null);
            chai_1.expect(testSuite).to.not.be.null;
            chai_1.expect(testSuite.isValid).to.be.false;
        });
        it('ignores empty file contents', () => {
            let file = TestUtils_1.makeFile(`source`, `test.brs`);
            file.setFileContents('');
            let testSuite = builder.processFile(file);
            chai_1.expect(testSuite).to.not.be.null;
            chai_1.expect(testSuite.isValid).to.be.false;
        });
        it('processes valid test file', () => {
            let file = TestUtils_1.makeFile(specDir, `VideoModuleTests.brs`);
            let testSuite = builder.processFile(file);
            chai_1.expect(testSuite).to.not.be.null;
            chai_1.expect(testSuite.isValid).to.be.true;
        });
        it('processes solo test suite', () => {
            let file = TestUtils_1.makeFile(specDir, `soloSuite.brs`);
            let testSuite = builder.processFile(file);
            chai_1.expect(testSuite).to.not.be.null;
            chai_1.expect(testSuite.isValid).to.be.true;
            chai_1.expect(testSuite.isSolo).to.be.true;
        });
        it('processes solo group', () => {
            let file = TestUtils_1.makeFile(specDir, `soloGroup.brs`);
            let testSuite = builder.processFile(file);
            chai_1.expect(testSuite).to.not.be.null;
            chai_1.expect(testSuite.isValid).to.be.true;
            chai_1.expect(testSuite.hasSoloGroups).to.be.true;
        });
        it('processes solo test', () => {
            let file = TestUtils_1.makeFile(specDir, `soloTest.brs`);
            let testSuite = builder.processFile(file);
            chai_1.expect(testSuite).to.not.be.null;
            chai_1.expect(testSuite.isValid).to.be.true;
            chai_1.expect(testSuite.hasSoloTests).to.be.true;
        });
        it('simple params', () => {
            let file = TestUtils_1.makeFile(specDir, `paramsTest.brs`);
            let testSuite = builder.processFile(file);
            chai_1.expect(testSuite).to.not.be.null;
            chai_1.expect(testSuite.isValid).to.be.true;
            chai_1.expect(testSuite.itGroups[0].testCases[0].expectedNumberOfParams).to.equal(2);
            chai_1.expect(testSuite.itGroups[0].testCases[0].rawParams.length).to.equal(2);
            chai_1.expect(testSuite.itGroups[0].filename).to.equal('paramsTest');
            chai_1.expect(testSuite.itGroups[0].testCases[1].expectedNumberOfParams).to.equal(2);
            chai_1.expect(testSuite.itGroups[0].testCases[1].rawParams.length).to.equal(2);
        });
        it('complex params', () => {
            let file = TestUtils_1.makeFile(specDir, `complexParamsTests.brs`);
            let testSuite = builder.processFile(file);
            chai_1.expect(testSuite).to.not.be.null;
            chai_1.expect(testSuite.isValid).to.be.true;
            chai_1.expect(testSuite.itGroups[0].soloTestCases[0].expectedNumberOfParams).to.equal(3);
            chai_1.expect(testSuite.itGroups[0].soloTestCases[0].rawParams.length).to.equal(3);
            chai_1.expect(testSuite.itGroups[0].soloTestCases[1].expectedNumberOfParams).to.equal(3);
            chai_1.expect(testSuite.itGroups[0].soloTestCases[1].rawParams.length).to.equal(3);
        });
        it('url params bug #40', () => {
            let file = TestUtils_1.makeFile(specDir, `urlParams.brs`);
            let testSuite = builder.processFile(file);
            chai_1.expect(testSuite).to.not.be.null;
            chai_1.expect(testSuite.isValid).to.be.true;
            chai_1.expect(testSuite.itGroups[0].testCases[0].expectedNumberOfParams).to.equal(3);
            chai_1.expect(testSuite.itGroups[0].testCases[0].rawParams.length).to.equal(3);
            chai_1.expect(testSuite.itGroups[0].testCases[0].rawParams[1].type).to.equal('http://101.rooibos.com');
        });
        describe('legacy support', function () {
            beforeEach(() => {
                builder = new TestSuiteBuilder_1.TestSuiteBuilder(50, true);
            });
            it('parsing of tests and asserts', () => {
                let file = TestUtils_1.makeFile(specDir, `legacyFrameworkTests.brs`);
                let testSuite = builder.processFile(file);
                chai_1.expect(testSuite).to.not.be.null;
                chai_1.expect(testSuite.isValid).to.be.true;
                chai_1.expect(testSuite.hasSoloTests).to.be.false;
                chai_1.expect(testSuite.isSolo).to.be.false;
                chai_1.expect(testSuite.hasIgnoredTests).to.be.false;
                chai_1.expect(testSuite.isIgnored).to.be.false;
                chai_1.expect(testSuite.name).to.equal('MainTestSuite');
                chai_1.expect(testSuite.itGroups[0].filename).to.equal('legacyFrameworkTests');
                chai_1.expect(testSuite.itGroups[0].testCases.length).to.equal(7);
                chai_1.expect(testSuite.itGroups[0].testCases[2].funcName).to.equal('testcase__main_checkstreamformattype');
                chai_1.expect(testSuite.itGroups[0].testCases[2].name).to.equal('CheckStreamFormatType');
                chai_1.expect(testSuite.itGroups[0].testCases[2].lineNumber).to.equal(79);
                chai_1.expect(testSuite.itGroups[0].testCases[2].assertLineNumberMap['0']).to.equal(81);
                chai_1.expect(testSuite.itGroups[0].testCases[2].assertLineNumberMap['1']).to.equal(82);
                chai_1.expect(testSuite.itGroups[0].testCases[2].assertLineNumberMap['2']).to.equal(83);
            });
            it('parsing of ignored test', () => {
                let file = TestUtils_1.makeFile(specDir, `legacyFrameworkTests_isIgnored.brs`);
                let testSuite = builder.processFile(file);
                chai_1.expect(testSuite).to.not.be.null;
                chai_1.expect(testSuite.isValid).to.be.true;
                chai_1.expect(testSuite.hasSoloTests).to.be.false;
                chai_1.expect(testSuite.isSolo).to.be.false;
                chai_1.expect(testSuite.hasIgnoredTests).to.be.false;
                chai_1.expect(testSuite.isIgnored).to.be.true;
                chai_1.expect(testSuite.name).to.equal('MainTestSuite');
                chai_1.expect(testSuite.itGroups[0].testCases.length).to.equal(7);
            });
            it('parsing of solo', () => {
                let file = TestUtils_1.makeFile(specDir, `legacyFrameworkTests_isSolo.brs`);
                let testSuite = builder.processFile(file);
                chai_1.expect(testSuite).to.not.be.null;
                chai_1.expect(testSuite.isValid).to.be.true;
                chai_1.expect(testSuite.hasSoloTests).to.be.false;
                chai_1.expect(testSuite.isSolo).to.be.true;
                chai_1.expect(testSuite.hasIgnoredTests).to.be.false;
                chai_1.expect(testSuite.isIgnored).to.be.false;
                chai_1.expect(testSuite.name).to.equal('MainTestSuite');
                chai_1.expect(testSuite.itGroups[0].testCases.length).to.equal(7);
            });
            it('parsing of solo tests', () => {
                let file = TestUtils_1.makeFile(specDir, `legacyFrameworkTests_solos.brs`);
                let testSuite = builder.processFile(file);
                chai_1.expect(testSuite).to.not.be.null;
                chai_1.expect(testSuite.isValid).to.be.true;
                chai_1.expect(testSuite.hasSoloTests).to.be.true;
                chai_1.expect(testSuite.isSolo).to.be.true;
                chai_1.expect(testSuite.hasIgnoredTests).to.be.false;
                chai_1.expect(testSuite.isIgnored).to.be.false;
                chai_1.expect(testSuite.name).to.equal('MainTestSuite');
                chai_1.expect(testSuite.itGroups[0].testCases.length).to.equal(5);
                chai_1.expect(testSuite.itGroups[0].soloTestCases.length).to.equal(2);
                chai_1.expect(testSuite.itGroups[0].soloTestCases[1].funcName).to.equal('testcase__main_checkstreamformattype');
                chai_1.expect(testSuite.itGroups[0].soloTestCases[1].name).to.equal('CheckStreamFormatType');
                chai_1.expect(testSuite.itGroups[0].soloTestCases[1].lineNumber).to.equal(103);
            });
            it('parsing of ignored tests', () => {
                let file = TestUtils_1.makeFile(specDir, `legacyFrameworkTests_ignoredTests.brs`);
                let testSuite = builder.processFile(file);
                chai_1.expect(testSuite).to.not.be.null;
                chai_1.expect(testSuite.isValid).to.be.true;
                chai_1.expect(testSuite.hasSoloTests).to.be.false;
                chai_1.expect(testSuite.isSolo).to.be.false;
                chai_1.expect(testSuite.hasIgnoredTests).to.be.true;
                chai_1.expect(testSuite.isIgnored).to.be.false;
                chai_1.expect(testSuite.name).to.equal('MainTestSuite');
                chai_1.expect(testSuite.itGroups[0].testCases.length).to.equal(5);
                chai_1.expect(testSuite.itGroups[0].soloTestCases.length).to.equal(0);
                chai_1.expect(testSuite.itGroups[0].ignoredTestCases.length).to.equal(2);
                chai_1.expect(testSuite.itGroups[0].ignoredTestCases[0].funcName).to.equal('testcase__main_checkdatacount');
                chai_1.expect(testSuite.itGroups[0].ignoredTestCases[0].name).to.equal('CheckDataCount');
                chai_1.expect(testSuite.itGroups[0].ignoredTestCases[1].funcName).to.equal('testcase__main_checkstreamformattype');
                chai_1.expect(testSuite.itGroups[0].ignoredTestCases[1].name).to.equal('CheckStreamFormatType');
            });
            it('parsing of setup and teardown', () => {
                let file = TestUtils_1.makeFile(specDir, `legacyFrameworkTests_setupAndTearDown.brs`);
                let testSuite = builder.processFile(file);
                chai_1.expect(testSuite).to.not.be.null;
                chai_1.expect(testSuite.isValid).to.be.true;
                chai_1.expect(testSuite.name).to.equal('MainTestSuite');
                chai_1.expect(testSuite.setupFunctionName).to.equal('MainTestSuite__SetUp');
                chai_1.expect(testSuite.tearDownFunctionName).to.equal('MainTestSuite__TearDown');
                chai_1.expect(testSuite.itGroups[0].testCases.length).to.equal(7);
            });
        });
        describe('duplicates', function () {
            beforeEach(() => {
                clearFiles();
                copyFiles('src/test/stubProjectDuplicateTestCases');
                Feedback_1.resetFeedback();
            });
            it('errors on duplicate testCase name', () => {
                let file = TestUtils_1.makeFile(specDir, `soloGroup.brs`);
                file.getFileContents();
                let testSuite = builder.processFile(file);
                let errors = Feedback_1.getFeedbackErrors();
                chai_1.expect(errors).to.not.be.empty;
            });
            it('errors on duplicate itGroup name', () => {
                let file = TestUtils_1.makeFile(specDir, `soloSuite.brs`);
                file.getFileContents();
                let testSuite = builder.processFile(file);
                let errors = Feedback_1.getFeedbackErrors();
                chai_1.expect(errors).to.not.be.empty;
            });
            it('errors on duplicate suite name', () => {
                builder = new TestSuiteBuilder_1.TestSuiteBuilder(50, false);
                let file = TestUtils_1.makeFile(specDir, `urlParams.brs`);
                builder.processFile(file);
                let errors = Feedback_1.getFeedbackErrors();
                chai_1.expect(errors).to.be.empty;
                file = TestUtils_1.makeFile(specDir, `urlParams.brs`);
                builder.processFile(file);
                errors = Feedback_1.getFeedbackErrors();
                chai_1.expect(errors).to.not.be.empty;
            });
        });
    });
    describe('isTag', function () {
        beforeEach(() => {
            builder = new TestSuiteBuilder_1.TestSuiteBuilder(50, false);
        });
        it('identifies only tag', function () {
            chai_1.expect(builder.isTag(`'@Only`, Tag_1.Tag.SOLO)).to.be.true;
            chai_1.expect(builder.isTag(`'@only`, Tag_1.Tag.SOLO)).to.be.true;
            chai_1.expect(builder.isTag(`   '@only`, Tag_1.Tag.SOLO)).to.be.true;
        });
    });
    describe('getTagText with spaces', function () {
        beforeEach(() => {
            builder = new TestSuiteBuilder_1.TestSuiteBuilder(50, false);
        });
        it('identifies only tag', function () {
            chai_1.expect(builder.getTagText(`'@Only some values`, Tag_1.Tag.SOLO)).to.equal('some values');
            chai_1.expect(builder.getTagText(`'@only some values`, Tag_1.Tag.SOLO)).to.equal('some values');
            chai_1.expect(builder.getTagText(`   '@Only some values`, Tag_1.Tag.SOLO)).to.equal('some values');
            chai_1.expect(builder.getTagText(`   '@only some values`, Tag_1.Tag.SOLO)).to.equal('some values');
        });
    });
    describe('test local projects:  - skip these in ci', function () {
        beforeEach(() => {
            builder = new TestSuiteBuilder_1.TestSuiteBuilder(50, false);
        });
        it('smc', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let testFiles = [];
                if (process.env.TEST_FILES_PATTERN) {
                    console.log('using overridden test files');
                    testFiles = JSON.parse(process.env.TEST_FILES_PATTERN);
                }
                else {
                    testFiles = [
                        '**/tests/**/*.bs',
                        '**/tests/**/*.brs',
                        '!**/rooibosDist.brs',
                        '!**/rooibosFunctionMap.brs',
                        '!**/TestsScene.brs'
                    ];
                }
                let config = __1.createProcessorConfig({
                    projectPath: '/home/george/hope/smc/pot-smithsonian-channel-roku-xm/build',
                    showFailuresOnly: true,
                    testsFilePattern: testFiles
                });
                let processor = new __1.RooibosProcessor(config);
                yield processor.processFiles();
                console.log('done');
            });
        });
    });
});
