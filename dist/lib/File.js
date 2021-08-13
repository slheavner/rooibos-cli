"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const FileType_1 = require("./FileType");
/**
 * describes a file in our project.
 */
class File {
    constructor(fsPath, projectPath, filename, extension) {
        this.filename = filename;
        this._fsPath = fsPath;
        this._fullPath = path.join(fsPath, filename);
        this._pkgPath = path.join(projectPath, filename);
        this._pkgUri = `pkg:/${path.join(projectPath, filename)}`;
        this.projectPath = projectPath;
        this.extension = extension;
        this._importedNamespaceNames = new Set();
        this.componentIds = new Set();
        this.associatedFile = null;
        this.parentFile = null;
        this._fileContents = null;
        this.hasProcessedImports = false;
    }
    get fileType() {
        switch (this.extension.toLowerCase()) {
            case '.brs':
                return this.associatedFile ? FileType_1.FileType.CodeBehind : FileType_1.FileType.Brs;
            case '.bs':
                return this.associatedFile ? FileType_1.FileType.CodeBehind : FileType_1.FileType.Bs;
            case '.xml':
                return this.associatedFile ? FileType_1.FileType.ViewXml : FileType_1.FileType.Xml;
            default:
                return FileType_1.FileType.Other;
        }
    }
    get fsPath() {
        return this._fsPath;
    }
    get importedNamespaceNames() {
        return this._importedNamespaceNames;
    }
    get fullPath() {
        return this._fullPath;
    }
    get pkgPath() {
        return this._pkgPath;
    }
    get pkgUri() {
        return this._pkgUri;
    }
    get normalizedFileName() {
        return this.filename.replace('.brs', '').replace('-', '_').replace('.', '_');
    }
    get normalizedFullFileName() {
        return this.fullPath.replace('/', '_') + this.normalizedFileName;
    }
    getFileContents() {
        if (this._fileContents === null) {
            this._fileContents = fs.readFileSync(this.fullPath, 'utf8');
        }
        return this._fileContents;
    }
    setFileContents(fileContents) {
        this._fileContents = fileContents;
    }
    saveFileContents() {
        fs.writeFileSync(this.fullPath, this._fileContents, 'utf8');
    }
    unloadContents() {
        this._fileContents = null;
    }
    toString() {
        return `DESCRIPTOR: ${this.filename} TYPE ${this.fileType} PATH ${this.fullPath}`;
    }
}
exports.default = File;
