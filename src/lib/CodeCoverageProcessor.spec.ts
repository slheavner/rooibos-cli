import * as chai from 'chai';
import * as fs from 'fs-extra';

import { expect } from 'chai';

import * as path from 'path';

import { CodeCoverageProcessor } from './CodeCoverageProcessor';
import { ProcessorConfig } from './ProcessorConfig';

const chaiSubset = require('chai-subset');

chai.use(chaiSubset);
let processor: CodeCoverageProcessor;
let sourcePath = 'src/test/stubProject';
let targetPath = 'build';

let config: ProcessorConfig = require('../test/testProcessorConfig.json');

function clearFiles() {
  fs.removeSync(targetPath);
}

function copyFiles() {
  try {
    fs.copySync(sourcePath, targetPath);
  } catch (err) {
    console.error(err);
  }
}

describe('RooibosProcessor tests', function() {
  beforeEach(() => {
    clearFiles();
    copyFiles();
    processor = new CodeCoverageProcessor(config);
  });

  describe('Initialization', function() {
    it('correctly sets source paths and config', function() {
      expect(processor.config).to.equal(config);
    });
  });

  describe('Process files valid test', function() {
    it('tests processor runs', async () => {
      await processor.process();
    });
    it('tests creates CodeCoverageSupport file', async () => {
      await processor.process();
      let filePath = path.resolve(path.join(targetPath, 'source', 'CodeCoverageSupport.brs'));
      expect(fs.existsSync(filePath)).to.be.true;
    });
    it('tests creates coverage component', async () => {
      await processor.process();
      let filePath = path.resolve(path.join(targetPath, 'components', 'CodeCoverage.xml'));
      expect(fs.existsSync(filePath)).to.be.true;
      filePath = path.resolve(path.join(targetPath, 'components', 'CodeCoverage.brs'));
      expect(fs.existsSync(filePath)).to.be.true;
    });
  });
});
