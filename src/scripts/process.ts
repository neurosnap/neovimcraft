import resourceFile from "../../data/resources.json" assert { type: "json" };

import { encode } from "../deps.ts";
import type { Plugin, Resource } from "../types.ts";
import { createPlugin } from "../entities.ts";
import { fetchGithubData } from "../github.ts";
import { fetchSrhtData } from "../stht.ts";

const accessToken = Deno.env.get("GITHUB_ACCESS_TOKEN") || "";
const accessUsername = Deno.env.get("GITHUB_USERNAME") || "";
const srhtToken = Deno.env.get("SRHT_ACCESS_TOKEN") || "";

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

async function processResources(resources: Resource[]) {
  const plugins: { [key: string]: Plugin } = {};
  const markdown: { [key: string]: string } = {};

  const ghToken = encode(`${accessUsername}:${accessToken}`);

  console.log(`Fetching ${resources.length} resources`);

  for (let i = 0; i < resources.length; i += 1) {
    const d = resources[i];

    if (d.type === "srht") {
      const result = await fetchSrhtData({ ...d, token: srhtToken });
      const id = `${d.username}/${d.repo}`;
      if (!result.ok) {
        console.log(result);
        continue;
      }

      const repo = result.data.repo;
      markdown[id] = result.data.readme;
      plugins[id] = createPlugin({
        type: "srht",
        id,
        username: d.username,
        repo: d.repo,
        tags: d.tags,
        link: `https://git.sr.ht/~${id}`,
        name: repo.name,
        description: repo.description,
        createdAt: repo.created,
        updatedAt: repo.updated,
        branch: result.data.branch,
      });
    } else if (d.type === "github") {
      const result = await fetchGithubData({ ...d, token: ghToken });
      if (!result.ok) {
        continue;
      }

      const resp = result.data;
      const id = `${d.username}/${d.repo}`;

      let updatedAt = "";
      if (result.data.branch.ok) {
        updatedAt = result.data.branch.data.commit.commit.committer.date;
      }

      markdown[id] = resp.readme;
      plugins[id] = createPlugin({
        type: "github",
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
        updatedAt: updatedAt,
      });
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
