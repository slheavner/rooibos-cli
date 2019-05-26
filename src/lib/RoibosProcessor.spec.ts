import * as chai from 'chai';
import * as fs from 'fs-extra';

import { expect } from 'chai';

import * as path from 'path';

import { createProcessorConfig, ProcessorConfig } from './ProcessorConfig';
import { RooibosProcessor } from './RooibosProcessor';

const chaiSubset = require('chai-subset');

chai.use(chaiSubset);
let processor: RooibosProcessor;
let sourcePath = 'src/test/stubProject';
let targetPath = 'build';

let config: ProcessorConfig = createProcessorConfig(require('../test/testProcessorConfig.json'));

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
    processor = new RooibosProcessor(config);
  });

  describe('Initialization', function() {
    it('correctly sets source paths and config', function() {
      expect(processor.config).to.equal(config);
    });
  });

  describe('Process files valid test', function() {
    it('processor runs ', () => {
      processor.processFiles();
    });
    it('tests creates map file', () => {
      processor.processFiles();
      let filePath = path.resolve(path.join(config.projectPath, config.outputPath, 'rooibosFunctionMap.brs'));
      expect(fs.existsSync(filePath)).to.be.true;
    });
  });
});
