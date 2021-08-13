"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItGroup = void 0;
const Feedback_1 = require("./Feedback");
class ItGroup {
    constructor(name, isSolo, isIgnore, filename, isLegacy = false) {
        this.testCaseNames = new Set();
        this.name = name;
        this.isSolo = isSolo;
        this.hasSoloTests = false;
        this.isIncluded = false;
        this.isIgnored = isIgnore;
        this.filename = filename;
        this.testCases = [];
        this.ignoredTestCases = [];
        this.soloTestCases = [];
        this.isLegacy = isLegacy;
    }
    asJson() {
        return {
            testCases: this.testCases.filter((testCase) => testCase.isIncluded)
                .map((testCase) => testCase.asJson()),
            ignoredTestCases: this.ignoredTestCases.filter((testCase) => testCase.isIncluded)
                .map((testCase) => testCase.asJson()),
            soloTestCases: this.soloTestCases.filter((testCase) => testCase.isIncluded)
                .map((testCase) => testCase.asJson()),
            filename: this.filename,
            setupFunctionName: this.setupFunctionName,
            tearDownFunctionName: this.tearDownFunctionName,
            beforeEachFunctionName: this.beforeEachFunctionName,
            afterEachFunctionName: this.afterEachFunctionName,
            isSolo: this.isSolo,
            isIgnored: this.isIgnored,
            hasSoloTests: this.hasSoloTests,
            name: this.name
        };
    }
    asText() {
        let testCases = this.testCases.filter((testCase) => testCase.isIncluded)
            .map((testCase) => testCase.asText());
        let ignoredTestCases = this.ignoredTestCases.filter((testCase) => testCase.isIncluded)
            .map((testCase) => testCase.asText());
        let soloTestCases = this.soloTestCases.filter((testCase) => testCase.isIncluded)
            .map((testCase) => testCase.asText());
        return `
      {
        testCases: [${testCases}]
        ignoredTestCases: [${ignoredTestCases}]
        soloTestCases: [${soloTestCases}]
        filename: "${this.filename}"
        setupFunctionName: "${this.setupFunctionName || ''}"
        tearDownFunctionName: "${this.tearDownFunctionName || ''}"
        beforeEachFunctionName: "${this.beforeEachFunctionName || ''}"
        afterEachFunctionName: "${this.afterEachFunctionName || ''}"
        isSolo: ${this.isSolo}
        isLegacy: ${this.isLegacy}
        isIgnored: ${this.isIgnored}
        hasSoloTests: ${this.hasSoloTests}
        name: "${this.name || ''}"
      }`;
    }
    addTestCase(testCase) {
        if (this.testCaseNames.has(testCase.name)) {
            Feedback_1.feedbackError(this.file, `\ntestCase with name '${testCase.name}' already declared in group '${this.name}'`);
        }
        this.testCaseNames.add(testCase.name);
        if (testCase.isSolo) {
            this.soloTestCases.push(testCase);
            this.hasSoloTests = true;
        }
        else if (testCase.isIgnored) {
            this.ignoredTestCases.push(testCase);
        }
        else {
            this.testCases.push(testCase);
        }
    }
}
exports.ItGroup = ItGroup;
