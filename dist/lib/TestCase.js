"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCase = void 0;
class TestCase {
    constructor(name, funcName, isSolo, isIgnored, lineNumber, params = null, paramTestIndex = 0, paramLineNumber = 0, expectedNumberOfParams = 0) {
        this.isSolo = isSolo;
        this.funcName = funcName;
        this.isIgnored = isIgnored;
        this.name = name;
        this.lineNumber = lineNumber;
        this.paramLineNumber = paramLineNumber;
        this.assertIndex = 0;
        this.assertLineNumberMap = {};
        this.rawParams = params;
        this.expectedNumberOfParams = expectedNumberOfParams;
        this.paramTestIndex = paramTestIndex;
        this.isParamTest = false;
        if (params) {
            this.name += this.paramTestIndex.toString().trim();
        }
    }
    asJson() {
        return {
            isSolo: this.isSolo,
            funcName: this.funcName,
            isIgnored: this.isIgnored,
            isParamTest: this.isParamTest,
            name: this.name,
            lineNumber: this.lineNumber,
            paramLineNumber: this.paramLineNumber,
            assertIndex: this.assertIndex,
            assertLineNumberMap: this.assertLineNumberMap,
            rawParams: this.rawParams ? JSON.stringify(this.rawParams).replace(/null/g, 'invalid') : '',
            paramTestIndex: this.paramTestIndex,
            expectedNumberOfParams: this.expectedNumberOfParams,
            isParamsValid: (this.rawParams || []).length === this.expectedNumberOfParams
        };
    }
    asText() {
        return `
        {
          isSolo: ${this.isSolo}
          funcName: "${this.funcName || ''}"
          isIgnored: ${this.isIgnored}
          isParamTest: ${this.isParamTest}
          name: "${this.name || ''}"
          lineNumber: ${this.lineNumber}
          paramLineNumber: ${this.paramLineNumber}
          assertIndex: ${this.assertIndex}
          assertLineNumberMap: ${JSON.stringify(this.assertLineNumberMap)}
          rawParams: ${this.rawParams ? JSON.stringify(this.rawParams).replace(/null/g, 'invalid') : '[]'}
          paramTestIndex: ${this.paramTestIndex}
          expectedNumberOfParams: ${this.expectedNumberOfParams}
          isParamsValid: ${(this.rawParams || []).length === this.expectedNumberOfParams}
        }`;
    }
    addAssertLine(lineNumber) {
        this.assertLineNumberMap[this.assertIndex.toString().trim()] = lineNumber;
        this.assertIndex++;
    }
}
exports.TestCase = TestCase;
