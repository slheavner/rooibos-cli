#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ProcessorConfig_1 = require("./lib/ProcessorConfig");
const InstallFrameworkCommand_1 = require("./lib/projectCommands/InstallFrameworkCommand");
const RooibosProcessor_1 = require("./lib/RooibosProcessor");
const program = require('commander');
const pkg = require('../package.json');
const path = require('path');
program
    .version(pkg.version)
    .description('Rooibos Preprocessor');
program
    .command('run [config]')
    .alias('r')
    .option('-p, --projectPath [path]', 'Root path of project/build folder (e.g. roku-deploy staging folder)')
    .option('-t, --testsFilePattern [value]', 'Array of globs corresponding to test files to include. Relative to projectPath')
    .option('-v, --isRecordingCodeCoverage [value]', 'Indicates that we want to generate code coverage')
    .option('-s, --sourceFilePattern [value]', 'Array of globs corresponding to files to include in code coverage. Relative to projectPath')
    .option('-o, --outputPath [path]', 'Path to package output directory. This is where generated files, required for execution will be copied to. Relative to projectPath, defaults to source')
    .option('-f, --showFailuresOnly', 'Show results for failed tests, if any. If none fail, then all results are shown')
    .option('-F, --failFast', 'Test execution will stop at the first failure')
    .option('-l, --legacySupport', 'legacy tests are included in the rooibos run, when this flag is set - see the rooibos docs for more info')
    .option('-t, --printTestTimes', 'prints test times in output')
    .option('-n, --port', 'Send test results down socket on port')
    .option('-l, --printLcov', 'True, if lcov results will be printed to log')
    .description(`
  processes a brightscript SceneGraph project and creates json data structures
  which can be used by the rooibos unit testing framework, or vsCode IDE
  HAPPY TESTING :)
`)
    .action((config, options) => {
    console.log(`Processing....`);
    console.time('Finished in:');
    let configJson = {};
    if (config) {
        try {
            configJson = require(path.resolve(process.cwd(), config));
        }
        catch (e) {
            console.log(e.message);
            process.exit(1);
        }
    }
    else {
        configJson = {
            projectPath: options.projectPath,
            testsFilePattern: options.testsFilePattern,
            isRecordingCodeCoverage: options.isRecordingCodeCoverage,
            sourceFilePattern: options.sourceFilePattern,
            outputPath: options.outputPath,
            showFailuresOnly: options.showFailuresOnly,
            failFast: options.failFast,
            legacySupport: options.legacySupport,
            printTestTimes: options.printTestTimes,
            port: options.port,
            printLcov: options.printLcov
        };
    }
    let processorConfig = ProcessorConfig_1.createProcessorConfig(configJson);
    let processor = new RooibosProcessor_1.RooibosProcessor(processorConfig);
    processor.processFiles();
    console.timeEnd('Finished in:');
});
//install framework
program
    .command('install <targetPath>')
    .alias('i')
    .option('-r, --release [version]', `Allows you to specify the desired release`)
    .description(`
  Installs the rooibos framework (i.e. rooibosDist.brs in the specified path.
`)
    .action((targetPath, options) => {
    const release = options.release || null;
    new InstallFrameworkCommand_1.InstallFrameworkCommand().execute(targetPath, release);
});
program.parse(process.argv);
