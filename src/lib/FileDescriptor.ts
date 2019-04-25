import * as Debug from 'debug';
import * as fs from 'fs';
import * as path from 'path';

const debug = Debug('FileDescriptor');
import { FileType } from './FileType';

export default class FileDescriptor {

  constructor(directory, filename, extension) {
    this.filename = filename;
    this.directory = directory;
    this.extension = extension;
  }

  public filename: string;
  public directory: string;
  public extension: string;
  private _fileContents?: string = null;

  get fileType(): FileType {
    switch (this.extension.toLowerCase()) {
      case '.brs':
        return FileType.Brs;
      default:
        return FileType.Other;
    }
  }

  public get fullPath() {
    return path.join(this.directory, this.filename);
  }

  public getPackagePath(projectRoot: string) {
    let pkgPath = `pkg:/${this.fullPath.replace(projectRoot, '')}`;
    //ugly hack while I find a better way of dealing with the projcet root
    pkgPath = pkgPath.replace('pkg:///', 'pkg:/').replace('pkg://', 'pkg:/');
    debug(`getPackagePath - projectRoot IS ${projectRoot} : ${this.fullPath} >>> ${pkgPath}`);
    return pkgPath;
  }

  public get normalizedFileName() {
    return this.filename.replace('.brs', '').replace('-', '_').replace('.', '_');
  }

  public get normalizedFullFileName() {
    return this.fullPath.replace('/', '_') + this.normalizedFileName;
  }

  public get fileContents() {
    if (this._fileContents === null) {
      this._fileContents = fs.readFileSync(this.fullPath, 'utf8');
    }
    return this._fileContents;
  }

  public setFileContents(newContents: string) {
    this._fileContents = newContents;
  }

  public saveFileContents() {
    fs.writeFileSync(this.fullPath, this._fileContents, 'utf8');
  }

  public unloadContents() {
    this._fileContents = null;
  }

  public toString() {
    return `DESCRIPTOR: ${this.filename} TYPE ${this.fileType} PATH ${this.fullPath}`;
  }
}
