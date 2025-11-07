import { fetchTopics, ghToken } from "../github.ts";
import { createResource, getResourceId } from "../entities.ts";
import type { ResourceMap } from "../types.ts";
import { denyRepos } from "../filter.ts";

init().catch(console.error);

async function init() {
	const topics = [
		"neovim-config",
		"neovim-configs",
		"neovim-dotfiles",
		"neovim-setup",
		"neovim-configuration",
	];
	const resources: ResourceMap = {};
	for (const topic of topics) {
		await dl(resources, topic);
	}
	console.log(`Found ${Object.values(resources).length} repos`);
	await save(resources);
}

async function save(resources: ResourceMap) {
	const data = { resources: Object.values(resources) };
	const json = JSON.stringify(data, null, 2);

	await Bun.write("./data/scrape-config.json", json);
}

async function dl(resources: ResourceMap, topic: string) {
	const repos = await fetchTopics(topic, ghToken);
	console.log(`${topic} found ${repos.length} repos`);
	const resourceList = repos
		.map((repo) => {
			const [username, repoName] = repo.full_name.split("/");
			return createResource({
				username,
				repo: repoName,
				tags: repo.topics,
			});
		})
		.filter((repo) => !denyRepos.includes(getResourceId(repo)));
	const newResources = resourceList.reduce<ResourceMap>((acc, repo) => {
		acc[getResourceId(repo)] = repo;
		return acc;
	}, resources);

	return newResources;
}
