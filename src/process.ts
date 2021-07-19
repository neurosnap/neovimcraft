import fs from 'fs';
import util from 'util';

import type { Plugin, Resource } from './lib/types';
import { createPlugin } from './lib/entities';
import * as resourceFile from './lib/resources.json';

const writeFile = util.promisify(fs.writeFile);
const accessToken = process.env.GITHUB_ACCESS_TOKEN || '';
const accessUsername = process.env.GITHUB_USERNAME || '';

interface Props {
  username: string;
  repo: string;
}

async function fetchReadme({
  username,
  repo,
  branch,
}: Props & { branch: string }): Promise<Resp<string>> {
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

async function processResources(resources: Resource[]) {
  const plugins: { [key: string]: Plugin } = {};
  const markdown: { [key: string]: string } = {};
  for (let i = 0; i < resources.length; i += 1) {
    const d = resources[i];

    if (d.type === 'github') {
      const result = await fetchGithubData(d);
      if (result.ok) {
        const resp = result.data;
        const id = `${d.username}/${d.repo}`;

        markdown[id] = resp.readme;
        plugins[id] = createPlugin({
          id,
          username: d.username,
          repo: d.repo,
          tags: d.tags,
          name: resp.repo.name,
          link: resp.repo.html_url,
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
  }

  return { plugins, markdown };
}

async function saveData({
  plugins,
  markdown,
}: {
  plugins: { [key: string]: Plugin };
  markdown: { [key: string]: string };
  resources: Resource[];
}) {
  await writeFile('./src/lib/db.json', JSON.stringify({ plugins }));
  await writeFile('./src/lib/markdown.json', JSON.stringify({ markdown }));
}

processResources(resourceFile.resources).then(saveData).catch(console.error);
