import * as fs from 'fs';
import * as path from 'path';

const request = require('request-promise');

export class InstallFrameworkCommand {

  public async execute(targetPath: string, version: string = null): Promise<boolean> {
    if (!version) {
      console.log('No release number specified, retrieving latest release');
      version = await this.getLatestVersionNumber();
    }
    console.log(`Retrieving rooibos release ${version}`);
    let fileUrl = `https://github.com/georgejecook/rooibos/releases/download/${version}/rooibosDist.brs`;
    try {
      console.log(`Downloading from ${fileUrl}`);
      const result = await request.get({url: fileUrl, encoding: 'utf8'});
      const filePath = path.resolve(path.join(targetPath, 'rooibosDist.brs'));
      console.log(`Done`);
      console.log(`Writing file to ${filePath}`);
      fs.writeFileSync(filePath, result, 'utf8');

    } catch (e) {
      console.error(`Could not download or install rooibos framework!
      release: ${version}
      url: ${fileUrl}
      targetPath: ${targetPath}
      error ${e.message.substring(0, 300)}`);
      return false;
    }

    return true;
  }

  public async getLatestVersionNumber(): Promise<string> {
    let options = {
      uri: 'https://api.github.com/repos/georgejecook/rooibos/releases/latest',
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true // Automatically parses the JSON string in the response
    };
    const result = await request.get(options);
    return result.tag_name;
  }
}
