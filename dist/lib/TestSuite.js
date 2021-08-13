"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestSuite = void 0;
class TestSuite {
    constructor() {
        this.name = '';
        this.isValid = false;
        this.hasFailures = false;
        this.hasSoloTests = false;
        this.hasIgnoredTests = false;
        this.hasSoloGroups = false;
        this.isSolo = false;
        this.isIgnored = false;
        this.itGroups = [];
        this.setupFunctionName = '';
        this.tearDownFunctionName = '';
        this.isNodeTest = false;
        this.nodeTestFileName = '';
        this.isLegacy = false;
    }
    asJson() {
        return {
            name: this.name,
            filePath: this.filePath,
            valid: this.isValid,
            hasFailures: this.hasFailures,
            hasSoloTests: this.hasSoloTests,
            hasIgnoredTests: this.hasIgnoredTests,
            hasSoloGroups: this.hasSoloGroups,
            isSolo: this.isSolo,
            isIgnored: this.isIgnored,
            itGroups: this.itGroups.filter((itGroup) => itGroup.isIncluded)
                .map((itGroup) => itGroup.asJson()),
            setupFunctionName: this.setupFunctionName,
            tearDownFunctionName: this.tearDownFunctionName,
            isNodeTest: this.isNodeTest,
            nodeTestFileName: this.nodeTestFileName,
            beforeEachFunctionName: this.beforeEachFunctionName,
            afterEachFunctionName: this.afterEachFunctionName,
        };
    }
    asText() {
        let itGroups = this.itGroups.filter((itGroup) => itGroup.isIncluded)
            .map((itGroup) => itGroup.asText());
        return `{
      name: "${this.name}"
      filePath: "${this.filePath}"
      valid: ${this.isValid}
      hasFailures: ${this.hasFailures}
      hasSoloTests: ${this.hasSoloTests}
      hasIgnoredTests: ${this.hasIgnoredTests}
      hasSoloGroups: ${this.hasSoloGroups}
      isSolo: ${this.isSolo}
      isIgnored: ${this.isIgnored}
      itGroups: [${itGroups}]
      setupFunctionName: "${this.setupFunctionName || ''}"
      tearDownFunctionName: "${this.tearDownFunctionName || ''}"
      isNodeTest: ${this.isNodeTest}
      isLegacy: ${this.isLegacy}
      nodeTestFileName: "${this.nodeTestFileName || ''}"
      beforeEachFunctionName: "${this.beforeEachFunctionName || ''}"
      afterEachFunctionName: "${this.afterEachFunctionName || ''}"
    }`;
    }
}
exports.TestSuite = TestSuite;
