"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestSuiteBuilder = void 0;
const Debug = require("debug");
const Feedback_1 = require("./Feedback");
const ItGroup_1 = require("./ItGroup");
const Tag_1 = require("./Tag");
const TestCase_1 = require("./TestCase");
const TestSuite_1 = require("./TestSuite");
const debug = Debug("RooibosProcessor");
const getJsonFromString = require("./getJsonFromString");
class TestSuiteBuilder {
    constructor(maxLinesWithoutSuiteDirective, isLegacyTestsSupported) {
        this.testSuiteNames = new Set();
        this._maxLinesWithoutSuiteDirective = maxLinesWithoutSuiteDirective;
        this.functionNameRegex = new RegExp("^\\s*(function|sub)\\s*([0-9a-z_]*)s*\\(", "i");
        this.functionSignatureRegex = new RegExp("^\\s*(function|sub)\\s*[0-9a-z_]*s*\\((.*)\\)", "i");
        this.assertInvocationRegex = new RegExp("^\\s*(m\\.fail|m\\.assert)(.*)\\(", "i");
        this.functionEndRegex = new RegExp("^s*(end sub|end function)", "i");
        this.paramsInvalidToNullRegex = /(,|\:|\[)(\s*)(invalid)/g;
        this._warnings = [];
        this._errors = [];
        this._isLegacyTestsSupported = isLegacyTestsSupported;
    }
    get errors() {
        return this._errors;
    }
    get warnings() {
        return this._warnings;
    }
    get maxLinesWithoutSuiteDirective() {
        return this._maxLinesWithoutSuiteDirective;
    }
    processFile(file) {
        let code = file ? file.getFileContents() : null;
        let testSuite = new TestSuite_1.TestSuite();
        if (!code || !code.trim()) {
            debug(`no code for current descriptor`);
            this.errors.push("No code for file" + (file ? file.fullPath : `unknown file`));
            return testSuite;
        }
        let isTokenItGroup = false;
        let isNextTokenIgnore = false;
        let isNextTokenSolo = false;
        let isNextTokenTest = false;
        let isTestSuite = false;
        let isNextTokenSetup = false;
        let isNextTokenTearDown = false;
        let isNextTokenBeforeEach = false;
        let isNextTokenAfterEach = false;
        let isNextTokenNodeTest = false;
        let isNextTokenTestCaseParam = false;
        let nodeTestFileName = "";
        let nextName = "";
        let name = file.normalizedFileName;
        let filename = file.normalizedFileName;
        let currentLocation = "";
        let lines = code.split(/\r?\n/);
        let filePath = file.fullPath;
        testSuite.filePath = file.pkgPath;
        this.currentGroup = null;
        this.reset();
        let itGroupNames = new Set();
        for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
            currentLocation = filePath + ":" + lineNumber.toString();
            let line = lines[lineNumber - 1];
            // debug(line);
            if (lineNumber > this._maxLinesWithoutSuiteDirective && !isTestSuite) {
                debug("NO TESTSUITE DIRECTIVE : " + currentLocation);
                break;
            }
            if (this.isTag(line, Tag_1.Tag.TEST_SUITE)) {
                if (isTestSuite) {
                    debug(`Multiple suites per file are !supported - use '@It tag`);
                    this.warnings.push("Multiple suites per file are !supported - use '@It tag" +
                        currentLocation);
                }
                name = this.getTagText(line, Tag_1.Tag.TEST_SUITE);
                if (name) {
                    if (this.testSuiteNames.has(name)) {
                        Feedback_1.feedbackError(file, `\nTest suite with name '${name}' has already been defined!`);
                    }
                    testSuite.name = name;
                    this.testSuiteNames.add(name);
                }
                if (isNextTokenSolo) {
                    testSuite.isSolo = true;
                    testSuite.name += ` [ONLY]`;
                }
                isTestSuite = true;
                testSuite.isValid = true;
                if (isNextTokenNodeTest) {
                    testSuite.nodeTestFileName = nodeTestFileName;
                    testSuite.isNodeTest = true;
                }
                if (isNextTokenIgnore) {
                    testSuite.isIgnored = true;
                    break;
                }
                isNextTokenSolo = false;
                isNextTokenIgnore = false;
                isNextTokenNodeTest = false;
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.IT)) {
                if (!isTestSuite) {
                    debug(`File !identified as testsuite!`);
                }
                name = this.getTagText(line, Tag_1.Tag.IT);
                if (name === ``) {
                    name = `UNNAMED Tag.TEST GROUP - name this group for better readability - e.g. 'Tests the Load method... '`;
                }
                if (itGroupNames.has(name)) {
                    Feedback_1.feedbackError(file, `\nIt group with name '${name}' has already been defined in this test suite`);
                }
                itGroupNames.add(name);
                this.currentGroup = new ItGroup_1.ItGroup(name, isNextTokenSolo, isNextTokenIgnore, filename);
                this.currentGroup.file = file;
                // 'inherit all suite functions that were set up to no';
                this.currentGroup.setupFunctionName = testSuite.setupFunctionName;
                this.currentGroup.tearDownFunctionName = testSuite.tearDownFunctionName;
                this.currentGroup.beforeEachFunctionName =
                    testSuite.beforeEachFunctionName;
                this.currentGroup.afterEachFunctionName =
                    testSuite.afterEachFunctionName;
                testSuite.itGroups.push(this.currentGroup);
                if (isNextTokenSolo) {
                    testSuite.hasSoloGroups = true;
                    testSuite.isSolo = true;
                }
                isTokenItGroup = true;
            }
            else if (this.isTag(line, Tag_1.Tag.SOLO) &&
                !this.isTag(line, Tag_1.Tag.TEST_SOLO_PARAMS)) {
                if (isNextTokenSolo) {
                    debug(`Tag.TEST MARKED FOR Tag.IGNORE AND Tag.SOLO`);
                    this.warnings.push(`Tag.TEST MARKED FOR Tag.IGNORE AND Tag.SOLO ${currentLocation}`);
                }
                else {
                    isNextTokenSolo = true;
                    // debug('isNextTokenSolo is true!! ' + line + ' ' + currentLocation);
                }
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.IGNORE) &&
                !this.isTag(line, Tag_1.Tag.TEST_IGNORE_PARAMS)) {
                isNextTokenIgnore = true;
                testSuite.hasIgnoredTests = true;
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.NODE_TEST)) {
                if (isTestSuite) {
                    debug(`FOUND ` +
                        Tag_1.Tag.NODE_TEST +
                        ` AFTER '@TestSuite annotation - This test will subsequently !run as a node test. `);
                    debug(`If you wish to run this suite of tests on a node, then make sure the ` +
                        Tag_1.Tag.NODE_TEST +
                        ` annotation appeares before the ` +
                        Tag_1.Tag.TEST_SUITE +
                        ` Annotation`);
                    this.warnings.push(`FOUND ` +
                        Tag_1.Tag.NODE_TEST +
                        ` AFTER '@TestSuite annotation - This test will subsequently !run as a node test. ${currentLocation}`);
                    this.warnings.push(`If you wish to run this suite of tests on a node, then make sure the ` +
                        Tag_1.Tag.NODE_TEST +
                        ` annotation appeares before the ` +
                        Tag_1.Tag.TEST_SUITE +
                        ` Annotation`);
                }
                nodeTestFileName = this.getTagText(line, Tag_1.Tag.NODE_TEST);
                isNextTokenNodeTest = true;
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.TEST)) {
                if (!isTestSuite) {
                    debug(`FOUND ` +
                        Tag_1.Tag.TEST +
                        ` BEFORE '@TestSuite declaration - skipping test file! ` +
                        currentLocation);
                    this.warnings.push(`FOUND ` +
                        Tag_1.Tag.TEST +
                        ` BEFORE '@TestSuite declaration - skipping test file! ` +
                        currentLocation);
                    break;
                }
                if (!this.currentGroup) {
                    debug(`FOUND ` +
                        Tag_1.Tag.TEST +
                        ` BEFORE '@It declaration - skipping test file!` +
                        currentLocation);
                    this.warnings.push(`FOUND ` +
                        Tag_1.Tag.TEST +
                        ` BEFORE '@It declaration - skipping test file!` +
                        currentLocation);
                    break;
                }
                this.reset();
                isNextTokenTest = true;
                nextName = this.getTagText(line, Tag_1.Tag.TEST);
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.SETUP)) {
                if (!isTestSuite) {
                    debug(`FOUND ` +
                        Tag_1.Tag.SETUP +
                        ` BEFORE '@TestSuite declaration - skipping test file!` +
                        currentLocation);
                    this.errors.push(`FOUND ` +
                        Tag_1.Tag.SETUP +
                        ` BEFORE '@TestSuite declaration - skipping test file!` +
                        currentLocation);
                    break;
                }
                isNextTokenSetup = true;
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.TEAR_DOWN)) {
                if (!isTestSuite) {
                    debug(`FOUND ` +
                        Tag_1.Tag.TEAR_DOWN +
                        ` BEFORE '@TestSuite declaration - skipping test file!` +
                        currentLocation);
                    this.errors.push(`FOUND ` +
                        Tag_1.Tag.TEAR_DOWN +
                        ` BEFORE '@TestSuite declaration - skipping test file!` +
                        currentLocation);
                    break;
                }
                isNextTokenTearDown = true;
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.BEFORE_EACH)) {
                if (!isTestSuite) {
                    debug(`FOUND ` +
                        Tag_1.Tag.BEFORE_EACH +
                        ` BEFORE '@TestSuite declaration - skipping test file!` +
                        currentLocation);
                    this.errors.push(`FOUND ` +
                        Tag_1.Tag.BEFORE_EACH +
                        ` BEFORE '@TestSuite declaration - skipping test file!` +
                        currentLocation);
                    break;
                }
                isNextTokenBeforeEach = true;
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.AFTER_EACH)) {
                if (!isTestSuite) {
                    debug(`FOUND ` +
                        Tag_1.Tag.AFTER_EACH +
                        ` BEFORE '@TestSuite declaration - skipping test file!` +
                        currentLocation);
                    this.errors.push(`FOUND ` +
                        Tag_1.Tag.AFTER_EACH +
                        ` BEFORE '@TestSuite declaration - skipping test file!` +
                        currentLocation);
                    break;
                }
                isNextTokenAfterEach = true;
                continue;
            }
            else if (line.match(this.assertInvocationRegex)) {
                if (!this.hasCurrentTestCase) {
                    debug(`Found assert before test case was declared! ` + currentLocation);
                    this.warnings.push(`Found assert before test case was declared! ` + currentLocation);
                }
                else {
                    this.currentTestCases.forEach((tc) => tc.addAssertLine(lineNumber));
                }
                continue;
            }
            else if (isNextTokenTest && line.match(this.functionEndRegex)) {
                this.reset();
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.TEST_IGNORE_PARAMS)) {
                isNextTokenTestCaseParam = true; //this keeps the processing going down to the function
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.TEST_PARAMS)) {
                if (!isNextTokenTest) {
                    debug(`FOUND ` +
                        Tag_1.Tag.TEST +
                        ` PARAM WITHOUT @Test declaration ` +
                        currentLocation);
                    this.warnings.push(`FOUND ` +
                        Tag_1.Tag.TEST +
                        ` PARAM WITHOUT @Test declaration ` +
                        currentLocation);
                }
                else {
                    isNextTokenTestCaseParam = true;
                    this.addParamsForLine(file, line, Tag_1.Tag.TEST_PARAMS, lineNumber, this.testCaseParamLines, this.testCaseParams, currentLocation);
                }
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.TEST_SOLO_PARAMS)) {
                if (!isNextTokenTest) {
                    debug(`FOUND ` +
                        Tag_1.Tag.TEST_SOLO_PARAMS +
                        ` PARAM WITHOUT @Test declaration ` +
                        currentLocation);
                    this.warnings.push(`FOUND ` +
                        Tag_1.Tag.TEST_SOLO_PARAMS +
                        ` PARAM WITHOUT @Test declaration ` +
                        currentLocation);
                }
                else {
                    isNextTokenSolo = true;
                    isNextTokenTestCaseParam = true;
                    this.addParamsForLine(file, line, Tag_1.Tag.TEST_SOLO_PARAMS, lineNumber, this.testCaseOnlyParamLines, this.testCaseOnlyParams, currentLocation);
                }
                continue;
            }
            if (isTokenItGroup ||
                isNextTokenTest ||
                isNextTokenSetup ||
                isNextTokenBeforeEach ||
                isNextTokenAfterEach ||
                isNextTokenTearDown) {
                //have to find a function definition here - if it's !then this i {
                let functionName = this.getFunctionFromLine(line);
                if (functionName) {
                    let numberOfExpectedParams = this.getNumberOfExpectedParamsFromLine(line);
                    if (isNextTokenTest) {
                        let testName = nextName || functionName;
                        nodeTestFileName = nodeTestFileName || testSuite.nodeTestFileName;
                        if (this.testCaseParams.length > 0 ||
                            this.testCaseOnlyParams.length > 0) {
                            let paramsToUse = [];
                            let paramLineNumbersToUse = [];
                            if (this.testCaseOnlyParams.length > 0) {
                                paramsToUse = this.testCaseOnlyParams;
                                paramLineNumbersToUse = this.testCaseOnlyParamLines;
                            }
                            else {
                                paramsToUse = this.testCaseParams;
                                paramLineNumbersToUse = this.testCaseParamLines;
                            }
                            for (let index = 0; index < paramsToUse.length; index++) {
                                let params = paramsToUse[index];
                                let paramLineNumber = paramLineNumbersToUse[index];
                                let testCase = new TestCase_1.TestCase(testName, functionName, isNextTokenSolo, isNextTokenIgnore, lineNumber, params, index, paramLineNumber, numberOfExpectedParams);
                                testCase.isParamTest = true;
                                if (testCase) {
                                    this.currentTestCases.push(testCase);
                                }
                                else {
                                    debug(`Skipping unparseable params for testcase ` +
                                        params +
                                        ` @` +
                                        currentLocation);
                                    this.warnings.push(`Skipping unparseable params for testcase ` +
                                        params +
                                        ` @` +
                                        currentLocation);
                                }
                            }
                        }
                        else {
                            let testCase = new TestCase_1.TestCase(testName, functionName, isNextTokenSolo, isNextTokenIgnore, lineNumber);
                            testCase.expectedNumberOfParams = numberOfExpectedParams;
                            this.currentTestCases.push(testCase);
                        }
                        if (this.currentGroup) {
                            this.currentTestCases.forEach((aTestCase) => {
                                this.currentGroup.addTestCase(aTestCase);
                                if (aTestCase.isSolo) {
                                    // debug('>>> ' + aTestCase.name + ' IS SOLO!');
                                    testSuite.hasSoloTests = true;
                                }
                            });
                            this.hasCurrentTestCase = true;
                            if (isNextTokenSolo) {
                                this.currentGroup.hasSoloTests = true;
                                testSuite.hasSoloTests = true;
                                testSuite.isSolo = true;
                            }
                        }
                        else {
                            debug(`There is no currentGroup! - ignoring test`);
                            this.warnings.push(`There is no currentGroup! - ignoring test ${currentLocation}`);
                            continue;
                        }
                        isNextTokenSolo = false;
                        isNextTokenIgnore = false;
                        isNextTokenTestCaseParam = false;
                        isNextTokenTest = false;
                    }
                    else if (isNextTokenSetup) {
                        if (!this.currentGroup) {
                            testSuite.setupFunctionName = functionName;
                        }
                        else {
                            this.currentGroup.setupFunctionName = functionName;
                        }
                        isNextTokenSetup = false;
                    }
                    else if (isNextTokenTearDown) {
                        if (!this.currentGroup) {
                            testSuite.tearDownFunctionName = functionName;
                        }
                        else {
                            this.currentGroup.tearDownFunctionName = functionName;
                        }
                        isNextTokenTearDown = false;
                    }
                    else if (isNextTokenBeforeEach) {
                        if (!this.currentGroup) {
                            testSuite.beforeEachFunctionName = functionName;
                        }
                        else {
                            this.currentGroup.beforeEachFunctionName = functionName;
                        }
                        isNextTokenBeforeEach = false;
                    }
                    else if (isNextTokenAfterEach) {
                        if (!this.currentGroup) {
                            testSuite.afterEachFunctionName = functionName;
                        }
                        else {
                            this.currentGroup.afterEachFunctionName = functionName;
                        }
                        isNextTokenAfterEach = false;
                    }
                    else {
                        debug(` could !get function pointer for ` + functionName + ` ignoring`);
                        this.errors.push(` could !get function pointer for ` +
                            functionName +
                            ` ignoring: ${currentLocation}`);
                    }
                }
                else if (isNextTokenSetup) {
                    debug(`could not find function directly after '@Setup - ignoring`);
                    this.warnings.push(`could not find function directly after '@Setup - ignoring: ${currentLocation}`);
                    isNextTokenSetup = false;
                }
                else if (isNextTokenTearDown) {
                    debug(`could not find function directly after '@TearDown - ignoring`);
                    this.warnings.push(`could not find function directly after '@TearDown - ignoring: ${currentLocation}`);
                    isNextTokenTearDown = false;
                }
                else if (isNextTokenBeforeEach) {
                    debug(`could not find function directly after '@BeforeEach - ignoring`);
                    this.warnings.push(`could not find function directly after '@BeforeEach - ignoring: ${currentLocation}`);
                    isNextTokenBeforeEach = false;
                }
                else if (isNextTokenAfterEach) {
                    debug(`could not find function directly after '@AfterEach - ignoring`);
                    this.warnings.push(`could not find function directly after '@AfterEach - ignoring: ${currentLocation}`);
                    isNextTokenAfterEach = false;
                }
                else if (isNextTokenSetup) {
                    debug(`could not find setup function - ignoring '@Setup`);
                    this.warnings.push(`could not find setup function - ignoring '@Setup: ${currentLocation}`);
                    isNextTokenSetup = false;
                }
                else if (isTokenItGroup) {
                    isTokenItGroup = false;
                    isNextTokenSolo = false;
                    isNextTokenIgnore = false;
                }
                nodeTestFileName = ``;
                nextName = ``;
            }
        }
        // exitProcessing:
        this.testCaseOnlyParams = null;
        this.testCaseParams = null;
        this.currentTestCases = null;
        this.hasCurrentTestCase = null;
        if (!isTestSuite) {
            this.warnings.push("no test suite directive for file " + file.fullPath);
            if (this._isLegacyTestsSupported) {
                debug("legacy tests are supported - checking if this file contains legacy tests");
                testSuite = new TestSuite_1.TestSuite();
                testSuite.filePath = file.pkgPath;
                isTestSuite = this.processLegacyFile(file, testSuite);
            }
        }
        if (!isTestSuite) {
            this.errors.push("Ignoring non test file " + file.fullPath);
            debug("Ignoring non test file " + file.fullPath);
        }
        return testSuite;
    }
    getFunctionFromLine(line) {
        let matches = line.match(this.functionNameRegex);
        return matches ? matches[2] : null;
    }
    getNumberOfExpectedParamsFromLine(line) {
        let matches = line.match(this.functionSignatureRegex);
        let text = matches ? matches[2] : null;
        return text ? text.split(",").length : 0;
    }
    isTag(text, tag) {
        return new RegExp(`^\\s*${tag}`, "i").test(text);
    }
    getTagText(text, tag) {
        const regexp = new RegExp(`^\\s*${tag}\\s*(.*)`, "i");
        const matches = text.match(regexp);
        return matches && matches.length === 2 ? matches[1] : "";
    }
    reset() {
        this.testCaseParams = [];
        this.testCaseParamLines = [];
        this.testCaseOnlyParams = [];
        this.testCaseOnlyParamLines = [];
        this.currentTestCases = [];
        (" we can have multiple test cases based on our para");
        this.hasCurrentTestCase = false;
    }
    addParamsForLine(file, line, tag, lineNumber, targetParamLinesArray, targetParamsArray, currentLocation) {
        let rawParams = this.getTagText(line, tag);
        try {
            let jsonText = rawParams.replace(this.paramsInvalidToNullRegex, "$1$2null");
            let jsonParams = getJsonFromString(jsonText);
            if (jsonParams) {
                targetParamsArray.push(jsonParams);
                targetParamLinesArray.push(lineNumber);
            }
            else {
                Feedback_1.feedbackError(file, `illegal params found. Not adding test - params were : ${line}`, false, lineNumber);
            }
        }
        catch (e) {
            Feedback_1.feedbackError(file, `illegal params found. Not adding test - params were : ${line}`, false, lineNumber);
        }
    }
    processLegacyFile(file, testSuite) {
        let code = file ? file.getFileContents() : null;
        this.reset();
        let currentLocation = "";
        let lines = code.split(/\r?\n/);
        let filePath = file.fullPath;
        testSuite.filePath = file.pkgPath;
        this.currentGroup = null;
        this.reset();
        this.currentTestCases = [];
        let testSuiteFunctionNameRegex = new RegExp("^\\s*(function|sub)\\s*testSuite_([0-9a-z\\_]*)\\s*\\(", "i");
        let testCaseFunctionNameRegex = new RegExp("^\\s*(function|sub)\\s*testCase_([0-9a-z\\_]*)\\s*\\(", "i");
        let assertInvocationRegex = new RegExp("^.*(m.fail|m.Fail|m.assert|m.Assert)(.*)", "i");
        let functionEndRegex = new RegExp("^\\s*(end sub|end function)", "i");
        let testSuiteNameRegex = new RegExp('^\\s*this\\.name\\s*=\\s*"([0-9a-z_]*)"', "i");
        let setupRegex = new RegExp("^\\s*this\\.setup\\s*=\\s*([a-z_0-9]*)", "i");
        let teardownRegex = new RegExp("^\\s*this\\.tearDown\\s*=\\s*([a-z_0-9]*)", "i");
        let addTestregex = new RegExp('^\\s*this\\.addTest\\s*\\(\\s*"([0-9a-z_]*)"\\s*,\\s*([0-9a-z_]*)s*', "i");
        let isTestSuite = false;
        let isInInitFunction = false;
        let isSolo = false;
        let isIgnore = false;
        let testCaseMap = new Map();
        for (let lineNumber = 1; lineNumber <= lines.length; lineNumber++) {
            currentLocation = filePath + ":" + lineNumber.toString();
            let line = lines[lineNumber - 1];
            // debug(line);
            if (lineNumber > this._maxLinesWithoutSuiteDirective && !isTestSuite) {
                debug("IGNORING FILE WITH NO LEGACY TESTS AVAILABLE : " + currentLocation);
                this.warnings.push("Ignoring file with no legacy tests" + file.fullPath);
                break;
            }
            if (line.match(testSuiteFunctionNameRegex)) {
                isTestSuite = true;
                isInInitFunction = true;
                testSuite.isLegacy = true;
                testSuite.isValid = true;
                if (isIgnore) {
                    testSuite.isIgnored = true;
                }
                if (isSolo) {
                    testSuite.isSolo = true;
                }
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.SOLO)) {
                isSolo = true;
                continue;
            }
            else if (this.isTag(line, Tag_1.Tag.IGNORE)) {
                isIgnore = true;
                continue;
            }
            else if (line.match(setupRegex)) {
                let match = line.match(setupRegex);
                testSuite.setupFunctionName = match[1];
            }
            else if (line.match(teardownRegex)) {
                let match = line.match(teardownRegex);
                testSuite.tearDownFunctionName = match[1];
            }
            else if (line.match(functionEndRegex)) {
                if (isInInitFunction) {
                    this.currentGroup = new ItGroup_1.ItGroup("LEGACY TESTS", false, false, file.normalizedFileName);
                    this.currentGroup.file = file;
                    this.currentGroup.setupFunctionName = testSuite.setupFunctionName;
                    this.currentGroup.isLegacy = true;
                    testSuite.itGroups.push(this.currentGroup);
                    isInInitFunction = false;
                    isIgnore = false;
                    isSolo = false;
                }
            }
            else if (line.match(testSuiteNameRegex)) {
                testSuite.name = line.match(testSuiteNameRegex)[1];
            }
            else if (line.match(addTestregex)) {
                if (!isInInitFunction) {
                    debug("Found addTestCase, when not in a legacy test suite init function. Ignoring");
                    continue;
                }
                let match = line.match(addTestregex);
                let testCaseName = match[1];
                let testCaseFunctionName = match[2];
                if (testCaseName !== "" && testCaseFunctionName !== "") {
                    testCaseMap[testCaseFunctionName.toLowerCase()] = testCaseName;
                }
                else {
                    debug(" found badly formed addTestCase function call in test suite init function. Ignoring");
                }
                continue;
            }
            else if (line.match(testCaseFunctionNameRegex)) {
                let functionName = line.match(testCaseFunctionNameRegex)[2];
                functionName = "testcase_" + functionName.toLowerCase();
                if (!functionName) {
                    debug("found badly formed test function name. Ignoring");
                    isIgnore = false;
                    isSolo = false;
                    continue;
                }
                let testName = testCaseMap[functionName];
                if (!testName) {
                    debug("Encountered test function " +
                        functionName +
                        "but found no matching AddTestCase invocation");
                    isIgnore = false;
                    isSolo = false;
                    continue;
                }
                let testCase = new TestCase_1.TestCase(testName, functionName, isSolo, isIgnore, lineNumber);
                if (isIgnore) {
                    testSuite.hasIgnoredTests = true;
                }
                this.currentTestCases = [testCase];
                this.currentGroup.addTestCase(testCase);
                if (isSolo) {
                    // debug('>>> ' + aTestCase.name + ' IS SOLO!');
                    this.currentGroup.hasSoloTests = true;
                    testSuite.hasSoloTests = true;
                    testSuite.isSolo = true;
                }
                isIgnore = false;
                isSolo = false;
                continue;
            }
            else if (line.match(assertInvocationRegex)) {
                if (this.currentTestCases.length === 0) {
                    this.errors.push(`Found assert before test case was declared! ${currentLocation}`);
                }
                else {
                    this.currentTestCases[0].addAssertLine(lineNumber);
                }
            }
        }
        return isTestSuite;
    }
}
exports.TestSuiteBuilder = TestSuiteBuilder;
