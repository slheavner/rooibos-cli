import * as Debug from 'debug';

import { BrsConfig } from 'brightscript-language/dist/BrsConfig';

import FunctionMap from './FunctionMap';
import { ProcessorConfig } from './ProcessorConfig';

const debug = Debug('CodeCoverageProcessor');

export class CodeCoverageProcessor {

  constructor(functionMap: FunctionMap, config: ProcessorConfig) {
    this._functionMap = functionMap;
    this._config = config;

    this._builderConfig = {
      cwd: config.projectPath,
      files: config.sourceFilePattern,
      rootDir: config.projectPath
    };
  }

  private readonly _builderConfig: BrsConfig;
  private _config: ProcessorConfig;
  private _functionMap: FunctionMap;
}
