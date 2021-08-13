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
exports.InstallFrameworkCommand = void 0;
const fs = require("fs");
const path = require("path");
const request = require('request-promise');
class InstallFrameworkCommand {
    execute(targetPath, version = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!version) {
                console.log('No release number specified, retrieving latest release');
                version = yield this.getLatestVersionNumber();
            }
            console.log(`Retrieving rooibos release ${version}`);
            let fileUrl = `https://github.com/georgejecook/rooibos/releases/download/${version}/rooibosDist.brs`;
            try {
                console.log(`Downloading from ${fileUrl}`);
                const result = yield request.get({ url: fileUrl, encoding: 'utf8' });
                const filePath = path.resolve(path.join(targetPath, 'rooibosDist.brs'));
                console.log(`Done`);
                console.log(`Writing file to ${filePath}`);
                fs.writeFileSync(filePath, result, 'utf8');
            }
            catch (e) {
                console.error(`Could not download or install rooibos framework!
      release: ${version}
      url: ${fileUrl}
      targetPath: ${targetPath}
      error ${e.message.substring(0, 300)}`);
                return false;
            }
            return true;
        });
    }
    getLatestVersionNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                uri: 'https://raw.githubusercontent.com/georgejecook/rooibos/master/docs/version.txt',
                headers: {
                    'User-Agent': 'Request-Promise'
                },
                json: true // Automatically parses the JSON string in the response
            };
            const result = yield request.get(options);
            return result;
        });
    }
}
exports.InstallFrameworkCommand = InstallFrameworkCommand;
