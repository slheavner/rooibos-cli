export enum ProcessorLogLevel {
  error = 0,
  warning = 1,
  info = 2,
  verbose = 3
}

export interface ProcessorConfig {
  projectPath: string;
  sourceFilePattern: string[];
  testsFilePattern: string[];
  isRecordingCodeCoverage: boolean;
  logLevel: ProcessorLogLevel;
  rooibosMetadataMapFilename: string;
}
