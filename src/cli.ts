#!/usr/bin/env node
import { inspect } from 'util';

import { createProcessorConfig, ProcessorConfig } from './lib/ProcessorConfig';
import { RooibosProcessor } from './lib/RooibosProcessor';
const program = require('commander');
const pkg = require('../package.json');
const path = require('path');

program
  .version(pkg.version)
  .description('Rooibos Preprocessor');

program
.option('-c, --config [path]', 'Specify a config file to use.')
.option('-p, --projectPath [path]', 'Root path of project/build folder (e.g. roku-deploy staging folder)')
.option('-t, --testsFilePattern [value]', 'Array of globs corresponding to test files to include. Relative to projectPath')
.option('-v, --isRecordingCodeCoverage [value]', 'Indicates that we want to generate code coverage')
.option('-s, --sourceFilePattern [value]', 'Array of globs corresponding to files to include in code coverage. Relative to projectPath')
.option('-o, --outputPath [path]', 'Path to package output directory. This is where generated files, required for execution will be copied to. Relative to projectPath, defaults to source')
.option('-f, --showFailuresOnly', 'Show results for failed tests, if any. If none fail, then all results are shown')
.option('-F, --failFast', 'Test execution will stop at the first failure')
.option('-l, --legacySupport', 'legacy tests are included in the rooibos run, when this flag is set - see the rooibos docs for more info')
.description(`
  processes a brightscript SceneGraph project and creates json data structures
  which can be used by the rooibos unit testing framework, or vsCode IDE
  HAPPY TESTING :)
`)
.action((options) => {
  console.log(`Processing....`);
  console.time('Finished in:');
  let configJson = {};

  if (options.config) {
    try {
      configJson = require(path.resolve(process.cwd(), options.config));
    } catch (e) {
      console.log(e.message);
      process.exit(1);
    }
  } else {
    configJson = {
      projectPath: options.projectPath,
      testsFilePattern: options.testsFilePattern,
      isRecordingCodeCoverage: options.isRecordingCodeCoverage,
      sourceFilePattern: options.sourceFilePattern,
      outputPath: options.outputPath,
      showFailuresOnly: options.showFailuresOnly,
      failFast: options.failFast,
      legacySupport: options.legacySupport
    };
  }

  let processorConfig = createProcessorConfig(configJson);
  let processor = new RooibosProcessor(processorConfig);
  processor.processFiles();

  console.timeEnd('Finished in:');
});

program.parse(process.argv);
