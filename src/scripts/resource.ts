import manualFile from "../../data/manual.json";
import manualConfigFile from "../../data/manual-config.json";
import type { Resource } from "../types.ts";
import { createResource } from "../entities.ts";

type Option = "plugin" | "config";

const forges = ["github", "srht"];
const forgesStr = forges.join(",");

let option = process.argv[2];
if (!option) {
	option = "plugin";
}
if (option !== "config" && option !== "plugin") {
	throw new Error('"config" and "plugin" are the only two choices');
}

const resource = await cli(option as Option);
save(resource).catch(console.error);

async function save(resource: Resource | undefined) {
	if (!resource) return;
	if (option === "plugin") {
		manualFile.resources.push(resource);
		const json = JSON.stringify(manualFile, null, 2);
		await Bun.write("./data/manual.json", json);
	} else {
		manualConfigFile.resources.push(resource);
		const json = JSON.stringify(manualConfigFile, null, 2);
		await Bun.write("./data/manual-config.json", json);
	}
}

async function cli(opt: "config" | "plugin") {
	const type =
		(await readInput(`code forge [${forgesStr}] (default: github):`)) ||
		"github";
	if (!forges.includes(type)) {
		throw new Error(`${type} is not a valid code forge, choose ${forgesStr}`);
	}

	const name = (await readInput("name (username/repo):")) || "";
	const [username, repo] = name.split("/");
	let tags: string[] = [];
	if (opt === "plugin") {
		console.log(
			"\nNOTICE: Please review all current tags and see if any fit, only add new tags if absolutely necessary\n",
		);
		const tagsRes = (await readInput("tags (comma separated):")) || "";
		tags = tagsRes.split(",");
	}

	return createResource({
		type: type as any,
		username,
		repo,
		tags,
	});
}

async function readInput(prompt: string): Promise<string> {
	console.log(prompt);
	for await (const line of console) {
		return line.trim();
	}
	return "";
}
