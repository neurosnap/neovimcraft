import fs from 'fs';
import util from 'util';
import marked from 'marked';
import prettier from 'prettier';

import type { Plugin } from '../src/lib/types';

const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

clean().catch(console.error);

async function clean() {
  const file = await readFile('./src/lib/db.json', 'utf-8');
  const db = JSON.parse(file.toString());
  const markdownFile = await readFile('./src/lib/markdown.json', 'utf-8');
  const markdownDb = JSON.parse(markdownFile.toString());

  const plugins = Object.values(db.plugins);
  const nextDb = {};
  plugins.forEach((plugin: Plugin) => {
    console.log(`processing ${plugin.id}`);
    marked.use({
      walkTokens: (token) => {
        const domain = 'https://github.com';
        const pre = `${domain}/${plugin.username}/${plugin.repo}/blob/${plugin.branch}`;

        if (token.type === 'link' || token.type === 'image') {
          if (token.href && !token.href.startsWith('http') && !token.href.startsWith('#')) {
            token.href = `${pre}/${token.href.replace('./', ``)}`;
          }
        } else if (token.type === 'html') {
          token.text = '';
          // token.text = token.text.replace(/\.\//g, `${pre}/`);
        }
      },
    });

    const markdown = markdownDb.markdown[plugin.id];
    if (!markdown) return;
    const html = marked(markdown);
    nextDb[plugin.id] = html;
  });

  try {
    const json = prettier.format(JSON.stringify({ html: nextDb }), {
      parser: 'json',
      printWidth: 100,
    });
    await writeFile('./src/lib/html.json', JSON.stringify(json));
  } catch (err) {
    console.error(err);
  }
}
