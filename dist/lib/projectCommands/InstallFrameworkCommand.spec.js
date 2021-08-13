"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
const fs = require("fs-extra");
const chai_1 = require("chai");
const InstallFrameworkCommand_1 = require("./InstallFrameworkCommand");
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
    }
    catch (err) {
        console.error(err);
    }
}
describe('InstallFrameworkCommand', function () {
    beforeEach(() => {
        clearFiles();
        copyFiles();
    });
    describe('install', function () {
        it('download and install version 3.1.0', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const result = yield new InstallFrameworkCommand_1.InstallFrameworkCommand().execute('build/source/tests', '3.1.0');
                chai_1.expect(result).to.be.true;
            });
        });
        it('overwrites with no error', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const result = yield new InstallFrameworkCommand_1.InstallFrameworkCommand().execute('build/source/tests', '3.1.0');
                chai_1.expect(result).to.be.true;
            });
        });
        it('reports error for wrong version', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const result = yield new InstallFrameworkCommand_1.InstallFrameworkCommand().execute('build/source/tests', 'NOT_THERE');
                chai_1.expect(result).to.be.false;
            });
        });
    });
    describe('install latest version', function () {
        it('install latest', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const result = yield new InstallFrameworkCommand_1.InstallFrameworkCommand().execute('build/source/tests');
                chai_1.expect(result).to.be.true;
            });
        });
    });
    describe('getLatestVersion', function () {
        it('reports latest version', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(10000);
                const result = yield new InstallFrameworkCommand_1.InstallFrameworkCommand().getLatestVersionNumber();
                //we don't confirm it, as it'll keep changing :) - just to kick tyres
                chai_1.expect(result).to.not.be.empty;
            });
        });
    });
});
