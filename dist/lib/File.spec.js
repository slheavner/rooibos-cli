"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const File_1 = require("./File");
const FileType_1 = require("./FileType");
describe('File File', function () {
    describe('Initialization', function () {
        it('correctly sets directory', function () {
            const file = new File_1.default('/fsPath', '/source', 'test.xml', '.xml');
            chai_1.expect(file.filename).to.equal('test.xml');
        });
        it('correctly sets directory', function () {
            const file = new File_1.default('/fsPath', '/source', 'test.xml', '.xml');
            chai_1.expect(file.projectPath).to.equal('/source');
        });
        it('correctly sets extension', function () {
            const file = new File_1.default('/fsPath', '/source', 'test.xml', '.xml');
            chai_1.expect(file.extension).to.equal('.xml');
        });
        it('correctly gets fullpath', function () {
            const file = new File_1.default('/fsPath', '/source', 'test.xml', '.xml');
            chai_1.expect(file.fullPath).to.equal('/fsPath/test.xml');
        });
    });
    describe('file types', function () {
        it('correctly identifies type other', function () {
            const file = new File_1.default('/fsPath', '/source', 'test.json', '.json');
            chai_1.expect(file.fileType).to.equal(FileType_1.FileType.Other);
        });
        it('correctly identifies type xml', function () {
            const file = new File_1.default('/fsPath', '/source', 'test.xml', '.xml');
            chai_1.expect(file.fileType).to.equal(FileType_1.FileType.Xml);
        });
        it('correctly identifies type brs', function () {
            const file = new File_1.default('/fsPath', '/source', 'test.brs', '.brs');
            chai_1.expect(file.fileType).to.equal(FileType_1.FileType.Brs);
        });
        it('correctly identifies type viewxml', function () {
            const file = new File_1.default('/fsPath', '/source', 'test.xml', '.xml');
            file.associatedFile = new File_1.default('/fsPath', '/source', 'test.brs', '.brs');
            chai_1.expect(file.fileType).to.equal(FileType_1.FileType.ViewXml);
        });
        it('correctly  identifies type codebehind', function () {
            const file = new File_1.default('/fsPath', '/sourcehttps://github.com/georgejecook/brsxmlc', 'test.brs', '.brs');
            file.associatedFile = new File_1.default('/fsPath', '/source', 'test.xml', '.xml');
            chai_1.expect(file.fileType).to.equal(FileType_1.FileType.CodeBehind);
        });
        it('correctly identifies type other - no extension', function () {
            const file = new File_1.default('/fsPath', '/source', 'test', '');
            chai_1.expect(file.fileType).to.equal(FileType_1.FileType.Other);
        });
    });
});
