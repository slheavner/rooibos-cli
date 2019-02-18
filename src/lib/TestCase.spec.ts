import * as chai from 'chai';
import * as fs from 'fs-extra';
import * as path from 'path';

import { expect } from 'chai';

import FileDescriptor from './FileDescriptor';
import RooibosProcessor from './RooibosProcessor';
import { TestCase } from './TestCase';

const chaiSubset = require('chai-subset');

chai.use(chaiSubset);
let sourcePath = path.resolve(__dirname, '../test/stubProjectNoSolos');
let targetPath = path.resolve(__dirname, '../../build');
let processor: RooibosProcessor;

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

describe('TestCase tests ', function() {
  beforeEach(() => {
    processor = new RooibosProcessor(targetPath);
    processor.processFiles();
  });

  describe('asJson', function() {
    beforeEach(() => {
      clearFiles();
      copyFiles();
    });

    it('processes valid test file', () => {
      let testSuite = processor.runtimeConfig.testSuites[1];
      expect(testSuite).to.not.be.null;
      expect(testSuite.isValid).to.be.true;
      let json: any = testSuite.asJson();
      expect(json).to.not.be.null;
      expect(json.itGroups['1'].testCases['1'].isParamsValid).to.be.true;
      expect(json.itGroups['1'].testCases['1'].isParamTest).to.be.true;
      expect(json.itGroups['1'].testCases['1'].expectedNumberOfParams).to.equal(3);
      expect(json.itGroups['1'].testCases['1'].rawParams).to.equal('[2,"mpg",["video_0","video_1"]]');
    });

    it('rawParams value for non params test', () => {
      let testCase = new TestCase('test', 'testFunc', true, false, 10);
      let json: any = testCase.asJson();
      expect(json).to.not.be.null;
      expect(json.isParamTest).to.be.false;
      expect(json.isParamsValid).to.be.true;
      expect(json.expectedNumberOfParams).to.equal(0);
      expect(json.rawParams).to.equal('');
    });
  });
});
