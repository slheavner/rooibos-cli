import { inspect } from 'util';

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
}

export function createProcessorConfig(config: any): ProcessorConfig {
  let processorConfig = config;
  let docsLink = `\nPlease read the docs for usage details https://github.com/georgejecook/rooibos/blob/master/docs/index.md#rooibosc`;
  config.isRecordingCodeCoverage = config.isRecordingCodeCoverage === true;
  config.outputPath = config.outputPath || 'source';

  if (!config.projectPath) {
    throw new Error('Config does not contain projectPath property' + docsLink);
  }
  if (!config.sourceFilePattern && config.isRecordingCodeCoverage) {
    throw new Error('Config does not contain sourceFilePattern regex\'s, ' +
      'which are required when recording code coverage' + docsLink);
  }
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
