import { marked } from "../deps.ts";
import type { Resource } from "../types.ts";
import { createResource } from "../entities.ts";

const URLS = [
	"https://raw.githubusercontent.com/rockerBOO/awesome-neovim/main/README.md",
];

Promise.all(URLS.map((url) => fetchMarkdown(url).then(processMarkdown)))
	.then((resources) => {
		const flatten = resources.reduce((acc, r) => {
			acc.push(...r);
			return acc;
		}, []);
		return flatten;
	})
	.then(saveScrapeData)
	.catch(console.error);

async function fetchMarkdown(url: string) {
	const response = await fetch(url);
	const text = await response.text();
	return text;
}

function sanitizeTag(tag: string) {
	if (tag === "(requires neovim 0.5)") return "neovim-0.5";
	if (tag === "tree-sitter supported colorscheme") {
		return "treesitter-colorschemes";
	}
	return tag.toLocaleLowerCase().replace(/\s/g, "-");
}

function processMarkdown(text: string) {
	const resources: Resource[] = [];
	const tree = marked.lexer(text);
	let headings: string[] = [];
	tree.forEach((token: any) => {
		if (token.type === "heading" && token.depth > 1) {
			headings = headings.slice(0, token.depth - 2);
			headings.push(token.text.toLocaleLowerCase());
		}

		if (token.type === "list") {
			token.items.forEach((t: any) => {
				(t as any).tokens.forEach((tt: any) => {
					if (!tt.tokens) return;

					// hardcoded deny-list for headings
					for (let i = 0; i < headings.length; i += 1) {
						const heading = headings[i];
						if (
							["contents", "vim", "ui", "wishlist", "resource"].includes(
								heading,
							)
						)
							return;
					}

					const tags = headings.map(sanitizeTag);
					const resource = createResource({
						tags,
					});
					let link = "";

					// first token is always a link
					const token = tt.tokens[0];
					if (!token) return;
					if (!token.href) return;

					link = token.href;
					// skip non-github links
					if (!link.includes("github.com")) return;

					const href = link
						.replace("https://github.com/", "")
						.replace("http://github.com", "");
					const d = href.split("/");
					resource.username = d[0];
					resource.repo = d[1].replace(/#.+/, "");
					resources.push(resource);
				});
			});
		}
	});

	return resources;
}

async function saveScrapeData(resources: Resource[]) {
	const newResources = resources.sort((a, b) => {
		if (a.username === b.username) {
			return a.repo.localeCompare(b.repo);
		}
		return a.username.localeCompare(b.username);
	});
	const data = { resources: newResources };
	const json = JSON.stringify(data, null, 2);
	await Bun.write("./data/scrape.json", json);
}
