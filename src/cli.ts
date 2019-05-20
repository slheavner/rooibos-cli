#!/usr/bin/env node
import { inspect } from 'util';

import { ProcessorConfig } from './lib/ProcessorConfig';
import { RooibosProcessor } from './lib/RooibosProcessor';
const program = require('commander');
const pkg = require('../package.json');
const path = require('path');

program
  .version(pkg.version)
  .description('Rooibos Preprocessor');

program
.option('-c, --config [path]', 'Specify a config file to use.')
.option('-t, --testPath [path]', 'Path to test spec directory.')
.option('-r, --rootPath [path]', 'Path to root directory.')
.option('-o, --outputPath [path]', 'Path to output directory. This is where the test map file will be written to.')
.description(`
  processes a brightscript SceneGraph project and creates json data structures
  which can be used by the rooibos unit testing framework, or vsCode IDE
  HAPPY TESTING :)
`)
.action((options) => {
  console.log(`Processing....`);
  console.time('Finished in:');
  let config: ProcessorConfig;
  let configJson = {};

  if (options.config) {
    try {
      configJson = require(path.resolve(process.cwd(), options.config));
    } catch (e) {
      console.log(e.message);
      process.exit(1);
    }
  } else if (options.testPath) {
    configJson = {
      projectPath: options.projectPath,
    };
  } else {
    console.warn('You must specify either a config file or a test spec directory');
  }

  validateConfig(configJson);
  let processor = new RooibosProcessor(config);
  processor.processFiles();

  console.timeEnd('Finished in:');
});

program.parse(process.argv);

function validateConfig(config: any): ProcessorConfig {
  let processorConfig = config;
  let docsLink = `\nPlease read the docs for usage details https://github.com/georgejecook/rooibos/blob/master/docs/index.md#rooibosc`;
  config.isRecordingCodeCoverage = config.isRecordingCodeCoverage === true;
  config.rooibosMetadataMapFilename = config.rooibosMetadataMapFilename || 'source/tests/rooibosFunctionMap.brs';

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
