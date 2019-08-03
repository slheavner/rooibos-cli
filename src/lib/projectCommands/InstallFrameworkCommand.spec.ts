import * as chai from 'chai';
import * as fs from 'fs-extra';

import { expect } from 'chai';

import * as path from 'path';

import { ProcessorConfig } from '../ProcessorConfig';
import { InstallFrameworkCommand } from './InstallFrameworkCommand';

const chaiSubset = require('chai-subset');

chai.use(chaiSubset);
let sourcePath = 'src/test/stubProject';
let targetPath = 'build/source/tests';

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

describe('InstallFrameworkCommand', function() {
  beforeEach(() => {
    clearFiles();
    copyFiles();
  });

  describe('install', function() {
    it('download and install version 3.1.0', async function() {
      this.timeout(10000);
      const result = await new InstallFrameworkCommand().execute('build/source/tests', '3.1.0');
      expect(result).to.be.true;
    });

    it('overwrites with no error', async function() {
      this.timeout(10000);
      const result = await new InstallFrameworkCommand().execute('build/source/tests', '3.1.0');
      expect(result).to.be.true;
    });

    it('reports error for wrong version', async function() {
      this.timeout(10000);
      const result = await new InstallFrameworkCommand().execute('build/source/tests', 'NOT_THERE');
      expect(result).to.be.false;
    });
  });

  describe('install latest version', function() {
    it('install latest', async function() {
      this.timeout(10000);
      const result = await new InstallFrameworkCommand().execute('build/source/tests');
      expect(result).to.be.true;
    });
  });

  describe('getLatestVersion', function() {
    it('reports latest version', async function() {
      this.timeout(10000);
      const result = await new InstallFrameworkCommand().getLatestVersionNumber();
      //we don't confirm it, as it'll keep changing :) - just to kick tyres
      expect(result).to.not.be.empty;
    });
  });
});
