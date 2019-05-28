# rooibos-preprocessor CHANGELOG

## 3.0.4-beta

### Added
  - additional code coverage lines - now tracks functions defined in var, array, associated array and argument assignments

### Changed

### Deprecated

### Removed

### Fixed

 - added glob-all to dependencies

## 3.0.3-beta - package publishing woes

## 3.0.2-beta - package publishing woes

## 3.0.1-beta

### Added

### Changed


### Deprecated

### Removed

### Fixed

 - problem that stopped code coverage working from gulp builds


## 3.0.0-beta

### Added

 - code coverage

### Changed

 - API - now create a config object, and pass that in from js use
 - command line args

### Deprecated

### Removed

### Fixed

 - issues with params parsing - now much more resilient

## 2.1.1

### Added

### Changed

### Deprecated

### Removed

### Fixed

 - runtime error due to bad naming of RuntimeConfig vs RunTimeConfig on Linux operating systems.

## 2.1.0

### Added

### Changed

 - Use debug instead of console.log
 - Separates index exports and CLI, exposing RooibosProcessor, so we can process test files inside of other js/ts tool-chains (like gulp) for non cli test processing

### Deprecated

### Removed

### Fixed

