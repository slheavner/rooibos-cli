import * as path from 'path';

import File from './File';

export function makeFile(specPath, filename): File {
  return new File(path.dirname(path.join(specPath, filename)), specPath, filename, path.extname(filename));
}
