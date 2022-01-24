import fs from 'fs';
import util from 'util';
import prettier from 'prettier';

import scrapeData from '../src/lib/scrape.json';
import manualData from '../src/lib/manual.json';

import type { Resource, ResourceMap } from '../src/lib/types';

const writeFile = util.promisify(fs.writeFile);

patch().then(console.log).catch(console.error);

async function patch() {
  const db: ResourceMap = {};
  const getId = (r: Resource) => `${r.username}/${r.repo}`;
  scrapeData.resources.forEach((r: Resource) => {
    db[getId(r)] = r;
  });
  // resource file trumps what we scrape so we can make changes to things like the tags
  manualData.resources.forEach((r: Resource) => {
    db[getId(r)] = r;
  });

  const newResources = Object.values(db).sort((a, b) => {
    if (a.username === b.username) {
      return a.repo.localeCompare(b.repo);
    }
    return a.username.localeCompare(b.username);
  });
  const data = { resources: newResources };
  const json = prettier.format(JSON.stringify(data), {
    parser: 'json',
    printWidth: 100,
  });

  await writeFile('./src/lib/resources.json', json);
}
