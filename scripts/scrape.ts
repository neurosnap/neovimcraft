import fs from 'fs';
import util from 'util';

import prettier from 'prettier';
import fetch from 'node-fetch';
import marked from 'marked';

import type { Resource } from '../src/lib/types';
import { createResource } from '../src/lib/entities';

const writeFile = util.promisify(fs.writeFile);

const URLS = ['https://raw.githubusercontent.com/rockerBOO/awesome-neovim/main/README.md'];

Promise.all(URLS.map((url) => fetchMarkdown(url).then(processMarkdown)))
  .then((resources) => {
    const flatten = resources.reduce((acc, r) => {
      acc.push(...r);
      return acc;
    }, []);
    return flatten;
  })
  .then(saveScrapeData)
  .catch(console.error);

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

          // hardcoded deny-list for headings
          if (['contents', 'vim'].includes(heading)) return;
          const resource = createResource({ tags: [sanitizeTag(heading)] });
          let link = '';

          // first token is always a link
          const token = tt.tokens[0];
          if (!token) return;

          link = token.href;
          // skip non-github links
          if (!link.includes('github.com')) return;

          const href = link.replace('https://github.com/', '').replace('http://github.com', '');
          const d = href.split('/');
          resource.username = d[0];
          resource.repo = d[1].replace(/#.+/, '');
          resources.push(resource);
        });
      });
    }
  });

  return resources;
}

async function saveScrapeData(resources: Resource[]) {
  const newResources = resources.sort((a, b) => {
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
  await writeFile('./src/lib/scrape.json', json);
}
