import { marked } from "../deps.ts";
import type { Plugin } from "../types.ts";

await init().catch(console.error);

async function init() {
	const db = {};
	await clean({
		htmlDb: db,
		dbFile: "./data/db.json",
		mdFile: "./data/markdown.json",
	});
	await clean({
		htmlDb: db,
		dbFile: "./data/db-config.json",
		mdFile: "./data/markdown-config.json",
	});
	await save(db);
}

async function clean({
	htmlDb,
	dbFile,
	mdFile,
}: {
	htmlDb: { [key: string]: string };
	dbFile: string;
	mdFile: string;
}) {
	const file = await Bun.file(dbFile).text();
	const db = JSON.parse(file.toString());
	const markdownFile = await Bun.file(mdFile).text();
	const markdownDb = JSON.parse(markdownFile.toString());

	const plugins = Object.values(db.plugins) as Plugin[];
	plugins.forEach((plugin) => {
		console.log(`processing ${plugin.id}`);
		marked.use({
			walkTokens: (token: any) => {
				const domain = "https://github.com";
				const pre = `${domain}/${plugin.username}/${plugin.repo}/blob/${plugin.branch}`;

				if (token.type === "link" || token.type === "image") {
					if (
						token.href &&
						!token.href.startsWith("http") &&
						!token.href.startsWith("#")
					) {
						token.href = `${pre}/${token.href.replace("./", ``)}`;
					}
				} else if (token.type === "html") {
					token.text = "";
				}
			},
		});

		const markdown = markdownDb.markdown[plugin.id];
		if (!markdown) return;
		const html = marked(markdown);
		htmlDb[plugin.id] = html;
	});
}

async function save(nextDb: { [key: string]: string }) {
	try {
		const json = JSON.stringify({ html: nextDb }, null, 2);
		await Bun.write("./data/html.json", json);
	} catch (err) {
		console.error(err);
	}
}
