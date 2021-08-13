"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const fs = require("fs-extra");
const chai_1 = require("chai");
const path = require("path");
const CodeCoverageProcessor_1 = require("./CodeCoverageProcessor");
const chaiSubset = require('chai-subset');
chai.use(chaiSubset);
let processor;
let sourcePath = 'src/test/stubProject';
let targetPath = 'build';
let config = require('../test/testProcessorConfig_coverage.json');
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
describe('CodeCoverageProcessor tests', function () {
    beforeEach(() => {
        clearFiles();
        copyFiles();
        processor = new CodeCoverageProcessor_1.CodeCoverageProcessor(config);
    });
    describe('Initialization', function () {
        it('correctly sets source paths and config', function () {
            chai_1.expect(processor.config).to.equal(config);
        });
    });
    describe('Process files valid test', function () {
        it('tests processor runs', () => __awaiter(this, void 0, void 0, function* () {
            yield processor.process();
        }));
        it('tests creates CodeCoverageSupport file', () => __awaiter(this, void 0, void 0, function* () {
            yield processor.process();
            let filePath = path.resolve(path.join(targetPath, 'source', 'CodeCoverageSupport.brs'));
            chai_1.expect(fs.existsSync(filePath)).to.be.true;
        }));
        it('tests creates coverage component', () => __awaiter(this, void 0, void 0, function* () {
            yield processor.process();
            let filePath = path.resolve(path.join(targetPath, 'components', 'CodeCoverage.xml'));
            chai_1.expect(fs.existsSync(filePath)).to.be.true;
            filePath = path.resolve(path.join(targetPath, 'components', 'CodeCoverage.brs'));
            chai_1.expect(fs.existsSync(filePath)).to.be.true;
        }));
    });
    describe('specific file with lots of code use cases in it', function () {
        it('tests processor runs', () => __awaiter(this, void 0, void 0, function* () {
            config.sourceFilePattern = ['**/main.brs'];
            yield processor.process();
            console.log('TODO - write tests - currently manually validating!!');
        }));
    });
});
