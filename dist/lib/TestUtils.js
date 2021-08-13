"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFile = void 0;
const path = require("path");
const File_1 = require("./File");
function makeFile(specPath, filename) {
    return new File_1.default(path.dirname(path.join(specPath, filename)), specPath, filename, path.extname(filename));
}
exports.makeFile = makeFile;
