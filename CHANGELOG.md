#### 1.4.0 (2020-06-22)

##### New Features

* **core:**  Adds support for bs files: note - sourcemapping is not currenlty supported, so line numbers will only appear correctly in an IDE that supports sourcemaps. I'll add a flag to map the numbers automatically in future, for non-IDE builds (db876399)

#### 1.3.1 (2020-06-19)

##### Bug Fixes

* **core:**  Fixes error that prevents correct version number parsing in generated code (2271bd6d)

#### 1.3.0 (2020-05-05)

##### New Features

* **coverage:**  adds lcov report support (200098b3)

#### 1.2.0 (2020-01-24)

##### New Features

* **logging:**  more verbose error logging, and parsing fails when any errors are present (a54cfcc0)
* **parser:**  reports errors for duplicate suite, group and testCase names (669acdfa)

#### 1.1.0 (2020-01-24)

##### New Features

* **parser:**  reports errors for duplicate suite, group and testCase names (669acdfa)
* **logging**  adds option to not print test times

