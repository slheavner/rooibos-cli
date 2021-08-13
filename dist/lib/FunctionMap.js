"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Debug = require("debug");
const debug = Debug('FunctionMap');
class FunctionMap {
    constructor() {
        this.functionRegex = '^(function|sub)\\s+(.*[^\\(])\\(';
        this.functionMaps = {};
    }
    /**
     * get the function map text for the given file
     * @param directory
     * @param filename
     * @param assoicatedFile
     */
    processFile(file) {
        debug(`processing file `, file.fullPath);
        //brute force, get EVERY function declaration!
        const matches = this.getFunctionsMatchesValues(file.getFileContents(), this.functionRegex, 2);
        this.functionMaps[file.normalizedFileName] = matches;
        return matches;
    }
    getFunctionsMatchesValues(input, pattern, groupIndex) {
        let values = [];
        let matches;
        const regex = new RegExp(pattern, 'gim');
        while (matches = regex.exec(input)) {
            values.push(matches[groupIndex]);
        }
        return values;
    }
    /**
     * getFunctionMapText
     * after processing of all the files, returns the block of code that contains all of the mapping functions
     * rooibos will later use.
     * @returns {string} text that contains the function maps, which rooibos needs for looking things up
     */
    getFunctionMapText() {
        let text = this.createHeaderText();
        text += this.createGetFunctionsForFile();
        for (let filename in this.functionMaps) {
            text += this.createGetFunctionsMethod(filename, this.functionMaps[filename]);
        }
        text += this.createGetFilenames();
        return text;
    }
    createGetFunctionsForFile() {
        let text = 'function RBSFM_getFunctionsForFile(filename)\n' +
            '  map = {\n';
        for (let filename in this.functionMaps) {
            text += `    "${filename}":RBSFM_getFunctions_${filename} \n`;
        }
        text += '  } \n' +
            '  return map[filename]\n' +
            'end function\n\n';
        return text;
    }
    createGetFilenames() {
        let text = 'function RBSFM_getFilenames()\n' +
            '  return [\n';
        for (let filename in this.functionMaps) {
            text += `    "${filename}", \n`;
        }
        text += '  ] \n' +
            'end function\n\n';
        return text;
    }
    createGetFunctionsMethod(filename, functionNames) {
        let text = `function RBSFM_getFunctions_${filename}()\n` +
            '  return {\n';
        functionNames.forEach((functionName) => {
            text += `    "${functionName}":${functionName} \n`;
        });
        text += '  } \n\n' +
            'end function\n\n';
        return text;
    }
    createHeaderText() {
        return `
    '***************************************************
    'Function maps
    '***************************************************
    `;
    }
}
exports.default = FunctionMap;
