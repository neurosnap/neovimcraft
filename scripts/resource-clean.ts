import fs from 'fs';
import util from 'util';
import prettier from 'prettier';

import json from '../src/lib/resources.json';

const writeFile = util.promisify(fs.writeFile);

async function init() {
  const resources = json.resources.map((resource) => {
    if (resource.tags.includes('plugin')) {
      return { ...resource };
    }

    return { ...resource, tags: [...resource.tags, 'plugin'] };
  });

  const resourceJson = prettier.format(JSON.stringify({ resources }), {
    parser: 'json',
    printWidth: 100,
  });

  await writeFile('./src/lib/resources.json', resourceJson);
}

init().catch(console.error);
