#!/usr/bin/env node
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
  let conf;

  if (options.config) {
    try {
      conf = require(path.resolve(process.cwd(), options.config));
    } catch (e) {
      console.log(e.message);
      process.exit(1);
    }

    if (!conf.testPath) {
      console.log(`The config file you specified does not define the required "testPath" key.
Please read the docs for usage details https://github.com/georgejecook/rooibos/blob/master/docs/index.md#rooibosc`);
    }
  } else if (options.testPath) {
    conf = {
      testPath: options.testPath,
      rootPath: options.rootPath || '',
      outputPath: options.outputPath || options.testPath
    };
  } else {
    console.warn('You must specify either a config file or a test spec directory');
  }

  let processor = new RooibosProcessor(conf.testPath, conf.rootPath, conf.outputPath);
  processor.processFiles();

  console.timeEnd('Finished in:');
});

program.parse(process.argv);
