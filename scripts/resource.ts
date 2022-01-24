import fs from 'fs';
import util from 'util';
import readline from 'readline';
import prettier from 'prettier';

import resourceFile from '../src/lib/resources.json';
import manualFile from '../src/lib/manual.json';
import type { Resource } from '../src/lib/types';
import { createResource } from '../src/lib/entities';

const writeFile = util.promisify(fs.writeFile);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on('close', function () {
  process.exit(0);
});

const question = (inp: string) =>
  new Promise<string>((resolve) => {
    rl.question(inp, resolve);
  });

async function init() {
  const name = await question('name (username/repo): ');
  const [username, repo] = name.split('/');
  const tagsRes = await question('tags (comma separated): ');
  const tags = tagsRes.split(',');
  const foundResource = (resourceFile.resources as Resource[]).find(
    (r) => `${r.username}/${r.repo}` === name,
  );
  if (foundResource) {
    console.log(`${name} aleady found in resources, not adding`);
    rl.close();
    return;
  }

  manualFile.resources.push(
    createResource({
      type: 'github',
      username,
      repo,
      tags,
    }),
  );

  const json = prettier.format(JSON.stringify(resourceFile), {
    parser: 'json',
    printWidth: 100,
  });

  await writeFile('./src/lib/manual.json', json);

  rl.close();
}

init().catch(console.error);
