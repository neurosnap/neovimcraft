import fs from 'fs';
import util from 'util';

import fetch from 'node-fetch';
import marked from 'marked';

import type { Resource, ResourceMap } from './lib/types';
import { createResource } from './lib/entities';
import * as resourceFile from './lib/resources.json';

const writeFile = util.promisify(fs.writeFile);

async function fetchMarkdown(url: string) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

function sanitizeTag(tag: string) {
  if (tag === '(requires neovim 0.5)') return 'neovim-0.5';
  if (tag === 'treesitter supported colorschemes') return 'treesitter-colorschemes';
  return tag.toLocaleLowerCase().replace(/\s/g, '-');
}

async function processMarkdown(text: string) {
  const resources: Resource[] = [];
  const tree = marked.lexer(text);
  let heading = '';
  tree.forEach((token) => {
    if (token.type === 'heading') {
      heading = token.text.toLocaleLowerCase();
    }

    if (token.type === 'list') {
      token.items.forEach((t) => {
        (t as any).tokens.forEach((tt: any) => {
          if (!tt.tokens) return;
          if (heading === 'contents') return;
          const resource = createResource({ tags: [sanitizeTag(heading)] });
          let link = '';
          tt.tokens.forEach((a: any) => {
            if (a.type === 'link') {
              link = a.href;
              const href = a.href
                .replace('https://github.com/', '')
                .replace('http://github.com', '');
              const d = href.split('/');
              resource.username = d[0];
              resource.repo = d[1];
            }
          });
          if (!link.includes('github.com')) return;
          resources.push(resource);
        });
      });
    }
  });

  return resources;
}

async function updateResources(resources: Resource[]) {
  const db: ResourceMap = {};
  const getId = (r: Resource) => `${r.username}/${r.repo}`;
  resourceFile.resources.forEach((r) => {
    db[getId(r)] = r;
  });
  resources.forEach((r) => {
    db[getId(r)] = r;
  });

  await writeFile('./src/lib/resources.json', JSON.stringify({ resources: Object.values(db) }));
}

const urls = ['https://raw.githubusercontent.com/rockerBOO/awesome-neovim/main/README.md'];
Promise.all(urls.map((url) => fetchMarkdown(url).then(processMarkdown)))
  .then((resources) => {
    const flatten = resources.reduce((acc, r) => {
      acc.push(...r);
      return acc;
    }, []);
    return flatten;
  })
  .then(updateResources)
  .catch(console.error);
