import { encode } from "https://deno.land/std/encoding/base64.ts";

import resourceFile from "../data/resources.json" assert { type: "json" };

import type { Plugin, Resource } from "../src/types.ts";
import { createPlugin } from "../src/entities.ts";

const accessToken = Deno.env.get("GITHUB_ACCESS_TOKEN") || "";
const accessUsername = Deno.env.get("GITHUB_USERNAME") || "";

const option = Deno.args[0];
if (option === "missing") {
  console.log("PROCESSING MISSING RESOURCES");
  processMissingResources().then(saveData).catch(console.error);
} else {
  console.log("PROCESSING ALL RESOURCES");
  processResources(resourceFile.resources as Resource[])
    .then(saveData)
    .catch(console.error);
}

interface Props {
  username: string;
  repo: string;
}

async function processMissingResources() {
  const dbFile = await Deno.readTextFile("./data/db.json");
  const db = JSON.parse(dbFile.toString());
  const missing: Resource[] = [];
  const resources = resourceFile.resources as Resource[];
  resources.forEach((r) => {
    if (db.plugins[`${r.username}/${r.repo}`]) {
      return;
    }

    missing.push(r);
  });
  console.log(`Missing ${missing.length} resources`);

  const results = await processResources(missing);
  const markdownFile = await Deno.readTextFile("./data/markdown.json");
  const markdownJson = JSON.parse(markdownFile.toString());
  const plugins = { ...db.plugins, ...results.plugins };
  const markdown = { ...markdownJson.markdown, ...results.markdown };
  return { plugins, markdown };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

async function githubApi(
  endpoint: string,
): Promise<Resp<{ [key: string]: any }>> {
  const url = `https://api.github.com${endpoint}`;
  console.log(`Fetching ${url}`);
  const token = encode(`${accessUsername}:${accessToken}`);
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${token}` },
  });

  const rateLimitRemaining = parseInt(
    res.headers.get("X-RateLimit-Remaining") || "0",
  );
  const rateLimitReset = parseInt(res.headers.get("X-RateLimit-Reset") || "0");
  console.log(`rate limit remaining: ${rateLimitRemaining}`);
  if (rateLimitRemaining === 1) {
    const now = Date.now();
    const RESET_BUFFER = 500;
    const wait = rateLimitReset + RESET_BUFFER - now;
    console.log(
      `About to hit github rate limit, waiting ${wait * 1000} seconds`,
    );
    await delay(wait);
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    return {
      ok: false,
      data: {
        status: res.status,
        error: new Error(`JSON parsing error [${url}]`),
      },
    };
  }

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
      error: new Error(`Could not load [${url}]`),
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

async function fetchRepo(
  { username, repo }: Props,
): Promise<Resp<{ [key: string]: any }>> {
  const result = await githubApi(`/repos/${username}/${repo}`);
  return result;
}

async function fetchBranch({
  username,
  repo,
  branch,
}: Props & { branch: string }): Promise<Resp<{ [key: string]: any }>> {
  const result = await githubApi(
    `/repos/${username}/${repo}/branches/${branch}`,
  );
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

  const branch = await fetchBranch({
    ...props,
    branch: repo.data.default_branch,
  });
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
      readme: readme.ok ? readme.data : "",
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

    if (d.type === "github") {
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
  const pluginJson = JSON.stringify({ plugins }, null, 2);
  const markdownJson = JSON.stringify({ markdown });
  await Deno.writeTextFile("./data/db.json", pluginJson);
  await Deno.writeTextFile("./data/markdown.json", markdownJson);
}
