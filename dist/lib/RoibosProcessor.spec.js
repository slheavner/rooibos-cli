"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const fs = require("fs-extra");
const chai_1 = require("chai");
const path = require("path");
const ProcessorConfig_1 = require("./ProcessorConfig");
const RooibosProcessor_1 = require("./RooibosProcessor");
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);
let processor;
let sourcePath = 'src/test/stubProject';
let targetPath = 'build';
let config = ProcessorConfig_1.createProcessorConfig(require('../test/testProcessorConfig.json'));
function clearFiles() {
    fs.removeSync(targetPath);
}
function copyFiles() {
    try {
        fs.copySync(sourcePath, targetPath);
    }
    catch (err) {
        console.error(err);
    }
}
describe('RooibosProcessor tests', function () {
    beforeEach(() => {
        clearFiles();
        copyFiles();
        processor = new RooibosProcessor_1.RooibosProcessor(config);
    });
    describe('Initialization', function () {
        it('correctly sets source paths and config', function () {
            chai_1.expect(processor.config).to.equal(config);
        });
    });
    describe('Process files valid test', function () {
        it('processor runs ', () => {
            processor.processFiles();
        });
        it('tests creates map file', () => {
            processor.processFiles();
            let filePath = path.resolve(path.join(config.projectPath, config.outputPath, 'rooibosFunctionMap.brs'));
            chai_1.expect(fs.existsSync(filePath)).to.be.true;
        });
    });
});
