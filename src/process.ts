import fetch from 'node-fetch';
import marked from 'marked';
import fs from 'fs';
import util from 'util';

import type { Plugin } from './lib/types';

const writeFile = util.promisify(fs.writeFile);
const accessToken = process.env.GITHUB_ACCESS_TOKEN || '';
const accessUsername = process.env.GITHUB_USERNAME || '';

interface Props {
  username: string;
  repo: string;
  branch: string;
}

async function fetchReadme({ username, repo, branch }: Props): Promise<Resp<string>> {
  const url = `https://raw.githubusercontent.com/${username}/${repo}/${branch}/README.md`;
  console.log(`Fetching ${url}`);
  const res = await fetch(url);
  if (res.ok) {
    const data = await res.text();
    return { ok: true, data };
  }

  return {
    ok: false,
    data: {
      status: res.status,
      error: new Error(`Could not load ${url}`),
    },
  };
}

async function fetchRepo({ username, repo }: Props): Promise<Resp<{ [key: string]: any }>> {
  const url = `https://api.github.com/repos/${username}/${repo}`;
  console.log(`Fetching ${url}`);
  const token = Buffer.from(`${accessUsername}:${accessToken}`).toString('base64');
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${token}` },
  });
  const data = await res.json();
  if (res.ok) {
    return {
      ok: true,
      data,
    };
  }

  return {
    ok: false,
    data: {
      status: res.status,
      error: new Error(`Could not load ${url}`),
    },
  };
}

interface ApiSuccess<D = any> {
  ok: true;
  data: D;
}

interface ApiFailure {
  ok: false;
  data: { status: number; error: Error };
}

type Resp<D> = ApiSuccess<D> | ApiFailure;

async function fetchGithubData(props: Props): Promise<Resp<any>> {
  const repo = await fetchRepo(props);
  if (!repo.ok) return repo;

  const readme = await fetchReadme({
    username: props.username,
    repo: props.repo,
    branch: repo.data.default_branch,
  });
  if (!readme.ok) return readme;

  return {
    ok: true,
    data: {
      readme: readme.data,
      repo: repo.data,
    },
  };
}

async function fetchMarkdown() {
  const response = await fetch(
    'https://raw.githubusercontent.com/rockerBOO/awesome-neovim/main/README.md',
  );
  const text = await response.text();
  return text;
}

const createPlugin = (p: Partial<Plugin> = {}): Plugin => {
  return {
    id: '',
    name: '',
    username: '',
    repo: '',
    link: '',
    tags: [],
    homepage: '',
    description: '',
    branch: 'main',
    openIssues: 0,
    watchers: 0,
    forks: 0,
    stars: 0,
    subscribers: 0,
    network: 0,
    ...p,
  };
};

function sanitizeTag(tag: string) {
  if (tag === '(requires neovim 0.5)') return 'neovim-0.5';
  if (tag === 'treesitter supported colorschemes') return 'treesitter-colorschemes';
  return tag.toLocaleLowerCase().replace(/\s/g, '-');
}

async function processMarkdown(text: string) {
  const data: Plugin[] = [];
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
          const plugin = createPlugin({ tags: [sanitizeTag(heading)] });
          tt.tokens.forEach((a: any) => {
            if (a.type === 'link') {
              plugin.link = a.href;
              const href = a.href
                .replace('https://github.com/', '')
                .replace('http://github.com', '');
              const d = href.split('/');
              plugin.username = d[0];
              plugin.repo = d[1];
              plugin.id = `${d[0]}/${d[1]}`;
            }
          });
          if (!plugin.link.includes('github.com')) return;
          data.push(plugin);
        });
      });
    }
  });

  const plugins: { [key: string]: Plugin } = {};
  const markdown: { [key: string]: string } = {};
  for (let i = 0; i < data.length; i += 1) {
    const d = data[i];
    const result = await fetchGithubData(d);
    if (result.ok) {
      const resp = result.data;
      const id = `${d.username}/${d.repo}`;

      markdown[id] = resp.readme;
      plugins[id] = createPlugin({
        id,
        username: d.username,
        repo: d.repo,
        name: d.name,
        link: d.link,
        tags: d.tags,
        homepage: resp.repo.homepage,
        branch: resp.repo.default_branch,
        openIssues: resp.repo.open_issues_count,
        watchers: resp.repo.watchers_count,
        forks: resp.repo.forks,
        stars: resp.repo.stargazers_count,
        subscribers: resp.repo.subscribers_count,
        network: resp.repo.network_count,
        description: resp.repo.description,
      });
    }
  }

  await writeFile('./src/lib/db.json', JSON.stringify({ plugins }));
  await writeFile('./src/lib/markdown.json', JSON.stringify({ markdown }));
}

fetchMarkdown().then(processMarkdown).catch(console.error);
