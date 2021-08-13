"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProcessorConfig = exports.ProcessorLogLevel = void 0;
const util_1 = require("util");
const getJsonFromString = require('./getJsonFromString');
var ProcessorLogLevel;
(function (ProcessorLogLevel) {
    ProcessorLogLevel[ProcessorLogLevel["error"] = 0] = "error";
    ProcessorLogLevel[ProcessorLogLevel["warning"] = 1] = "warning";
    ProcessorLogLevel[ProcessorLogLevel["info"] = 2] = "info";
    ProcessorLogLevel[ProcessorLogLevel["verbose"] = 3] = "verbose";
})(ProcessorLogLevel = exports.ProcessorLogLevel || (exports.ProcessorLogLevel = {}));
function createProcessorConfig(config) {
    let processorConfig = config;
    let docsLink = `\nPlease read the docs for usage details https://github.com/georgejecook/rooibos/blob/master/docs/index.md#rooibosc`;
    console.log('parsing config ' + util_1.inspect(processorConfig));
    config.isRecordingCodeCoverage = config.isRecordingCodeCoverage === true;
    config.showFailuresOnly = config.showFailuresOnly === true;
    config.failFast = config.failFast === true;
    config.printLcov = config.printLcov === true;
    config.legacySupport = config.legacySupport === true;
    config.printTestTimes = config.printTestTimes === true;
    config.outputPath = config.outputPath || 'source';
    config.logLevel = config.logLevel || ProcessorLogLevel.info;
    config.port = config.port || null;
    if (!config.projectPath) {
        throw new Error('Config does not contain projectPath property' + docsLink);
    }
    config.sourceFilePattern = getStringArrayFromString(config.sourceFilePattern);
    if (!config.sourceFilePattern && config.isRecordingCodeCoverage) {
        throw new Error('Config does not contain sourceFilePattern regex\'s, ' +
            'which are required when recording code coverage' + docsLink);
    }
    config.testsFilePattern = getStringArrayFromString(config.testsFilePattern);
    if (!config.testsFilePattern) {
        let defaultTestsRegex = [
            '**/tests/**/*.brs',
            '!**/rooibosDist.brs',
            '!**/rooibosFunctionMap.brs',
            '!**/TestsScene.brs'
        ];
        console.log('config does not specify regex to lookup test files, using default value ' + util_1.inspect(defaultTestsRegex)
            + docsLink);
        config.testsFilePattern = defaultTestsRegex;
    }
    return processorConfig;
}
exports.createProcessorConfig = createProcessorConfig;
function getStringArrayFromString(text) {
    if (text) {
        if (Array.isArray(text)) {
            return text;
        }
        try {
            let arrayValue = text.split(',');
            return arrayValue;
        }
        catch (e) {
            console.log('could not parse glob array - please be sure to use glob1,glob2,... format - no spaces!');
            return null;
        }
    }
    else {
        return null;
    }
}
