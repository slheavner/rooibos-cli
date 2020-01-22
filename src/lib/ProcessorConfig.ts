import { inspect } from 'util';

const getJsonFromString = require('./getJsonFromString');

export enum ProcessorLogLevel {
  error = 0,
  warning = 1,
  info = 2,
  verbose = 3
}

export interface ProcessorConfig {
  projectPath: string;
  outputPath: string;
  sourceFilePattern: string[];
  testsFilePattern: string[];
  isRecordingCodeCoverage: boolean;
  logLevel: ProcessorLogLevel;
  showFailuresOnly: boolean;
  failFast: boolean;
  legacySupport: boolean;
  printTestTimes: boolean;
  port: number;
}

export function createProcessorConfig(config: any): ProcessorConfig {
  let processorConfig = config;
  let docsLink = `\nPlease read the docs for usage details https://github.com/georgejecook/rooibos/blob/master/docs/index.md#rooibosc`;

  console.log('parsing config ' + inspect(processorConfig));

  config.isRecordingCodeCoverage = config.isRecordingCodeCoverage === true;
  config.showFailuresOnly = config.showFailuresOnly === true;
  config.failFast = config.failFast === true;
  config.legacySupport = config.legacySupport === true;
  config.printTestTimes = config.printTestTimes === true;
  config.outputPath = config.outputPath || 'source';
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
    console.log('config does not specify regex to lookup test files, using default value ' + inspect(defaultTestsRegex)
      + docsLink);
    config.testsFilePattern = defaultTestsRegex;
  }
  return processorConfig;
}

function getStringArrayFromString(text): string[] | null {
  if (text) {
    if (Array.isArray(text)) {
      return text;
    }
    try {
      let arrayValue = text.split(',');
      return arrayValue;
    } catch (e) {
      console.log('could not parse glob array - please be sure to use glob1,glob2,... format - no spaces!');
      return null;
    }
  } else {
    return null;
  }
}
