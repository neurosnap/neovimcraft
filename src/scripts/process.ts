import resourceFile from "../../data/resources.json";
import resourceConfigFile from "../../data/resources-config.json";

import type { Plugin, Resource } from "../types.ts";
import { createPlugin, getResourceId } from "../entities.ts";
import { fetchGithubData, ghToken } from "../github.ts";

const option = process.argv[2];
if (option === "missing") {
	console.log("PROCESSING MISSING RESOURCES");
	processMissingResources().then(saveData).catch(console.error);
} else {
	console.log("PROCESSING ALL RESOURCES");
	processResources(resourceFile.resources as Resource[])
		.then(saveData)
		.catch(console.error);

	console.log("PROCESSING CONFIG RESOURCES");
	processResources(Object.values(resourceConfigFile.resources) as Resource[])
		.then(saveConfigData)
		.catch(console.error);
}

async function processMissingResources() {
	const dbFile = await Bun.file("./data/db.json").text();
	const db = JSON.parse(dbFile.toString());
	const missing: Resource[] = [];
	const resources = resourceFile.resources as Resource[];
	resources.forEach((r) => {
		if (db.plugins[getResourceId(r)]) {
			return;
		}

		missing.push(r);
	});
	console.log(`Missing ${missing.length} resources`);

	const results = await processResources(missing);
	const markdownFile = await Bun.file("./data/markdown.json").text();
	const markdownJson = JSON.parse(markdownFile.toString());
	const plugins = { ...db.plugins, ...results.plugins };
	const markdown = { ...markdownJson.markdown, ...results.markdown };
	return { plugins, markdown };
}

async function processResources(resources: Resource[]) {
	const plugins: { [key: string]: Plugin } = {};
	const markdown: { [key: string]: string } = {};

	console.log(`Fetching ${resources.length} resources`);

	for (let i = 0; i < resources.length; i += 1) {
		const d = resources[i];

		if (d.type === "github") {
			const result = await fetchGithubData({ ...d, token: ghToken });
			if (!result.ok) {
				console.error(result);
				continue;
			}

			const resp = result.data;
			const id = getResourceId(d);

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
	console.log("SAVING DATA");
	const pluginJson = JSON.stringify({ plugins }, null, 2);
	const markdownJson = JSON.stringify({ markdown });
	await Bun.write("./data/db.json", pluginJson);
	await Bun.write("./data/markdown.json", markdownJson);
}

async function saveConfigData({
	plugins,
	markdown,
}: {
	plugins: { [key: string]: Plugin };
	markdown: { [key: string]: string };
}) {
	console.log("SAVING CONFIG DATA");
	const pluginJson = JSON.stringify({ plugins }, null, 2);
	const markdownJson = JSON.stringify({ markdown });
	console.log("MADE IT");
	try {
		await Bun.write("./data/db-config.json", pluginJson);
		await Bun.write("./data/markdown-config.json", markdownJson);
	} catch (err) {
		console.error(err);
	}
}
