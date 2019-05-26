import * as Debug from 'debug';
import * as path from 'path';

import File from './File';
import FunctionMap from './FunctionMap';
import { ProcessorConfig } from './ProcessorConfig';
import { TestSuite } from './TestSuite';
import { TestSuiteBuilder } from './TestSuiteBuilder';

const debug = Debug('RooibosProcessor');

export class RuntimeConfig {

  constructor(functionMap: FunctionMap, config: ProcessorConfig) {
    this._testSuites = [];
    this.ignoredTestNames = [];
    this._functionMap = functionMap;
    this._config = config;
  }

  private _config: ProcessorConfig;
  private ignoredCount: number = 0;
  private ignoredTestNames: string[];
  private _testSuites: TestSuite[];
  private _hasSoloSuites: boolean = false;
  private _hasSoloGroups: boolean = false;
  private _hasSoloTests: boolean = false;
  private _functionMap: FunctionMap;

  get testSuites(): TestSuite[] {
    return this._testSuites;
  }

  /**
   * Process all of the tests files in the given folder,
   * Create TestSuites, and functionMaps
   * @function processSourceFolder
   */
  public process() {
    //TODO - make async.
    //TODO - cachetimestamps for files - for performance
    let testSuiteBuilder = new TestSuiteBuilder(50);
    const glob = require('glob-all');
    let targetPath = path.resolve(this._config.projectPath);
    debug(`processing files at path ${targetPath} with pattern ${this._config.testsFilePattern}`);
    let files = glob.sync(this._config.testsFilePattern, { cwd: targetPath });
    for (const filePath of files) {
      debug(`processing file: ${filePath}`);
      const extension = path.extname(filePath).toLowerCase();
      if (extension === '.brs') {
        const projectPath = path.dirname(filePath);
        const fullPath = path.join(targetPath, projectPath);
        const filename = path.basename(filePath);

        const file = new File(fullPath, projectPath, filename, path.extname(filename));
        this._functionMap.processFile(file);
        let testSuite = testSuiteBuilder.processFile(file);
        if (testSuite.isValid) {
          this.testSuites.push(testSuite);
          if (testSuite.isSolo) {
            this._hasSoloSuites = true;
          }
          if (testSuite.hasSoloTests) {
            this._hasSoloTests = true;
          }
          if (testSuite.hasSoloGroups) {
            this._hasSoloGroups = true;
          }
        } else {
          debug(`ignoring invalid suite`);
        }
      }
    }

    this.updateIncludedFlags();
  }

  public createTestSuiteLookupFunction(): string {
    let text = `
    function RBSFM_getTestSuitesForProject()
        return [
        `;
    this.testSuites.forEach((testSuite) => {
      if (testSuite.isIncluded) {
        text += `\n${testSuite.asText()},\n`;
      }
    });
    text += `
      ]
    end function\n`;
    return text;
  }

  /**
   * Once we know what's ignored/solo/etc, we can ascertain if we're going
   * to include it in the final json payload
   */
  private updateIncludedFlags() {
    this.testSuites.forEach((testSuite) => {
      if (this._hasSoloTests && !testSuite.hasSoloTests) {
        testSuite.isIncluded = false;
      } else if (this._hasSoloSuites && !testSuite.isSolo) {
        testSuite.isIncluded = false;
      } else if (testSuite.isIgnored) {
        testSuite.isIncluded = false;
        this.ignoredTestNames.push('|-' + testSuite.name + ' [WHOLE SUITE]');
        this.ignoredCount++;
      } else {
        testSuite.isIncluded = true;
      }
      // debug('testSuite  ' + testSuite.name);
      testSuite.itGroups.forEach((itGroup) => {
        // debug('GROUP  ' + itGroup.name);
        if (itGroup.isIgnored) {
          this.ignoredCount += itGroup.testCases.length;
          this.ignoredTestNames.push('  |-' + itGroup.name + ' [WHOLE GROUP]');
        } else {
          if (itGroup.ignoredTestCases.length > 0) {
            this.ignoredTestNames.push('  |-' + itGroup.name);
            this.ignoredCount += itGroup.ignoredTestCases.length;
            itGroup.ignoredTestCases.forEach((ignoredTestCase) => {
              if (!ignoredTestCase.isParamTest) {
                this.ignoredTestNames.push('  | |--' + ignoredTestCase.name);
              } else if (ignoredTestCase.paramTestIndex === 0) {
                let testCaseName = ignoredTestCase.name;
                if (testCaseName.length > 1 && testCaseName.substr(testCaseName.length - 1) === '0') {
                  testCaseName = testCaseName.substr(0, testCaseName.length - 1);
                }
                this.ignoredTestNames.push('  | |--' + testCaseName);
              }
            });
          }
          if (this._hasSoloTests && !itGroup.hasSoloTests && !itGroup.isSolo) {
            itGroup.isIncluded = false;
          } else if (itGroup.testCases.length === 0 && itGroup.soloTestCases.length === 0) {
            itGroup.isIncluded = false;
          } else {
            itGroup.isIncluded = testSuite.isIncluded;
          }
          itGroup.testCases.forEach((testCase) => {
            // debug(testCase.name + ' this._hasSoloTests ' + this._hasSoloTests + ' testCase.isSolo ' + testCase.isSolo);
            if (this._hasSoloTests && !testCase.isSolo) {
              testCase.isIncluded = false;
            } else {
              testCase.isIncluded = itGroup.isIncluded || testCase.isSolo;
            }
          });
          itGroup.soloTestCases.forEach((testCase) => {
            // debug(testCase.name + ' this._hasSoloTests ' + this._hasSoloTests + ' testCase.isSolo ' + testCase.isSolo);
            testCase.isIncluded = true;
          });
        }
      });
    });
  }

  public asJson(): object[] {
    return this.testSuites.filter((testSuite) => testSuite.isIncluded)
      .map((testSuite) => testSuite.asJson());
  }
}
