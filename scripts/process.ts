import fs from 'fs';
import util from 'util';
import fetch from 'node-fetch';
import prettier from 'prettier';

import type { Plugin, Resource } from '../src/lib/types';
import { createPlugin } from '../src/lib/entities';
import resourceFile from '../src/lib/resources.json';

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const accessToken = process.env.GITHUB_ACCESS_TOKEN || '';
const accessUsername = process.env.GITHUB_USERNAME || '';

const args = process.argv;
const option = args[2];
if (option === 'missing') {
  console.log('PROCESSING MISSING RESOURCES');
  processMissingResources().then(saveData).catch(console.error);
} else {
  console.log('PROCESSING ALL RESOURCES');
  processResources(resourceFile.resources as Resource[])
    .then(saveData)
    .catch(console.error);
}

interface Props {
  username: string;
  repo: string;
}

async function processMissingResources() {
  const dbFile = await readFile('./src/lib/db.json');
  const db = JSON.parse(dbFile.toString());
  const missing: Resource[] = [];
  resourceFile.resources.forEach((r: Resource) => {
    if (db.plugins[`${r.username}/${r.repo}`]) {
      return;
    }

    missing.push(r);
  });
  console.log(`Missing ${missing.length} resources`);

  const results = await processResources(missing);
  const markdownFile = await readFile('./src/lib/markdown.json');
  const markdownJson = JSON.parse(markdownFile.toString());
  const plugins = { ...db.plugins, ...results.plugins };
  const markdown = { ...markdownJson.markdown, ...results.markdown };
  return { plugins, markdown };
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

async function githubApi(endpoint: string): Promise<Resp<{ [key: string]: any }>> {
  const url = `https://api.github.com${endpoint}`;
  console.log(`Fetching ${url}`);
  const token = Buffer.from(`${accessUsername}:${accessToken}`).toString('base64');
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${token}` },
  });

  const rateLimitRemaining = parseInt(res.headers.get('X-RateLimit-Remaining'));
  const rateLimitReset = parseInt(res.headers.get('X-RateLimit-Reset'));
  console.log(`rate limit remaining: ${rateLimitRemaining}`);
  if (rateLimitRemaining === 1) {
    const now = Date.now();
    const RESET_BUFFER = 500;
    const wait = rateLimitReset + RESET_BUFFER - now;
    console.log(`About to hit github rate limit, waiting ${wait * 1000} seconds`);
    await delay(wait);
  }

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

async function fetchReadme({ username, repo }: Props): Promise<Resp<string>> {
  const result = await githubApi(`/repos/${username}/${repo}/readme`);
  if (!result.ok) {
    return {
      ok: false,
      data: result.data as any,
    };
  }

  const url = result.data.download_url;
  console.log(`Fetching ${url}`);
  const readme = await fetch(url);
  const data = await readme.text();
  return {
    ok: true,
    data,
  };
}

async function fetchRepo({ username, repo }: Props): Promise<Resp<{ [key: string]: any }>> {
  const result = await githubApi(`/repos/${username}/${repo}`);
  return result;
}

async function fetchBranch({
  username,
  repo,
  branch,
}: Props & { branch: string }): Promise<Resp<{ [key: string]: any }>> {
  const result = await githubApi(`/repos/${username}/${repo}/branches/${branch}`);
  return result;
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
  if (repo.ok === false) {
    console.log(`${repo.data.status}: ${repo.data.error.message}`);
    return repo;
  }

  const branch = await fetchBranch({ ...props, branch: repo.data.default_branch });
  if (branch.ok === false) {
    console.log(`${branch.data.status}: ${branch.data.error.message}`);
  }

  const readme = await fetchReadme({
    username: props.username,
    repo: props.repo,
  });
  if (readme.ok === false) {
    console.log(`${readme.data.status}: ${readme.data.error.message}`);
  }

  return {
    ok: true,
    data: {
      readme: readme.ok ? readme.data : '',
      repo: repo.data,
      branch: branch.data,
    },
  };
}

async function processResources(resources: Resource[]) {
  const plugins: { [key: string]: Plugin } = {};
  const markdown: { [key: string]: string } = {};

  console.log(`Fetching ${resources.length} resources`);

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
          createdAt: resp.repo.created_at,
          updatedAt: resp.branch.commit.commit.committer.date,
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
}) {
  const pluginJson = prettier.format(JSON.stringify({ plugins }), {
    parser: 'json',
    printWidth: 100,
  });
  const markdownJson = prettier.format(JSON.stringify({ markdown }), {
    parser: 'json',
    printWidth: 100,
  });
  await writeFile('./src/lib/db.json', pluginJson);
  await writeFile('./src/lib/markdown.json', markdownJson);
}
