import htmlFile from "../../data/html.json";
import dbFile from "../../data/db.json";
import configDbFile from "../../data/db-config.json";
import { dirname } from "../deps.ts";
import { derivePluginData } from "../plugin-data.ts";
import type { Plugin, PluginData, PluginMap, Tag, TagMap } from "../types.ts";
import { getResourceId } from "../entities.ts";

const OUTDIR = "./public";

const zero = (num: number) => (num < 10 ? `0${num}` : `${num}`);
export const format = (date: Date) => {
	return `${date.getFullYear()}-${zero(date.getMonth() + 1)}-${zero(
		date.getDate(),
	)}`;
};

async function createFile(fname: string, data: string) {
	console.log(`Creating file ${fname}`);
	await import("node:fs/promises").then((fs) =>
		fs.mkdir(dirname(fname), { recursive: true }),
	);
	await Bun.write(fname, data);
}

const sortNum = (a: number, b: number) => b - a;
const sortDateStr = (a: string, b: string) => {
	const dateA = new Date(a).getTime();
	const dateB = new Date(b).getTime();
	return dateB - dateA;
};

function onSort(by: keyof Plugin) {
	if (by === "createdAt") {
		return (a: Plugin, b: Plugin) => sortDateStr(a.createdAt, b.createdAt);
	}
	if (by === "updatedAt") {
		return (a: Plugin, b: Plugin) => sortDateStr(a.updatedAt, b.updatedAt);
	}
	return (a: Plugin, b: Plugin) => sortNum(a.stars, b.stars);
}

const createAds = () => {
	return `
<div class="ad">
  <div><a href="https://nvim.sh">nvim.sh</a></div>
  <div>Search for plugins in the terminal</div>
</div>

<div class="ad">
  <div><a href="https://pgs.sh">pgs.sh</a></div>
  <div>Host static sites on our global platform using SSH</div>
</div>

<div class="ad">
  <div><a href="https://tuns.sh">tuns.sh</a></div>
  <div>Host public web services on localhost using SSH</div>
</div>

<div class="ad">
  <div><a href="https://prose.sh">prose.sh</a></div>
  <div>Serve your blog using SSH</div>
</div>

<div class="ad">
  <div><a href="https://bower.sh">bower.sh</a></div>
  <div>My personal blog</div>
</div>
`;
};

const createHtmlFile = ({ head, body }: { head: string; body: string }) => {
	return `
<!DOCTYPE html>
<html lang="en" data-theme="theme-dark">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" type="text/css" href="/reset.css" />
    <link rel="stylesheet" type="text/css" href="/main.css" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="600" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta property="og:url" content="https://neovimcraft.com" />
    <meta property="og:image" content="https://neovimcraft.com/neovimcraft.png" />
    <meta
      name="description"
      content="Search through our curated neovim plugin directory."
    />
    <meta property="og:title" content="neovimcraft" />
    <meta
      property="og:description"
      content="Search through our curated neovim plugin directory."
    />
    <meta name="twitter:image:src" content="https://neovimcraft.com/neovimcraft.png" />

    ${head}
  </head>
  <body>
    <div id="app">
      <div id="app_content">${body}</div>
    </div>
  </body>
</html>`;
};

const createNav = () => {
	const links = [
		["/", "plugins"],
		["/c/", "configs"],
		["/about/", "about"],
	];

	const linksStr = links.reduce((acc, link) => {
		acc += `<a href="${link[0]}" class="link">${link[1]}</a>\n`;
		return acc;
	}, "");

	return `
<div class="nav">
  <h1 class="logo">
    <a href="/" class="logo-header">neovimcraft</a>
    <a href="https://github.com/neurosnap/neovimcraft" class="flex">
      ${createIcon("github", "github")}
    </a>
  </h1>
  <div class="links">
    ${linksStr}
  </div>
  <div class="menu-btn" id="menu-btn"><img src="/menu.svg" alt="menu" /></div>

  <div class="menu-container hidden" id="menu">
    <div class="menu-overlay menu-close"></div>
    <div class="menu">
      <div class="menu-header">
        <h1 class="logo">
          <a href="/" class="logo-header">neovimcraft</a>
          <a href="https://github.com/neurosnap/neovimcraft" class="flex">
            ${createIcon("github", "github")}
          </a>
        </h1>
        <div class="menu-btn menu-close"><img src="/menu.svg" alt="menu" /></div>
      </div>
      <div class="menu-body">
        ${linksStr}
        ${createAds()}
      </div>
    </div>
  </div>
</div>`;
};

const createIcon = (icon: string, text: string) => {
	return `<img class="icon" src="/${icon}.svg" alt=${text} title=${text} />`;
};

function findColor(tag: Tag) {
	if (tag.count === 1) return "pink";
	if (tag.count > 1 && tag.count <= 3) return "yellow";
	if (tag.count > 3 && tag.count <= 10) return "orange";
	if (tag.count > 10 && tag.count <= 15) return "green";
	return "purple";
}

const createTag = (tag: Tag, showCount = true) => {
	const countStr = showCount ? `&nbsp;x&nbsp;${tag.count}` : "";
	const color = findColor(tag);
	return `<span class="tag ${color}" data-id="${tag.id}">${tag.id}${countStr}</span>`;
};

const createPluginItem = (plugin: Plugin, tags: Tag[]) => {
	const tagsStr = tags.reduce((acc, tag) => {
		acc += createTag(tag, false);
		return acc;
	}, "");
	const dataUsername = plugin.username.toLocaleLowerCase();
	const dataRepo = plugin.repo.toLocaleLowerCase();
	const dataDesc = (plugin.description || "").toLocaleLowerCase();
	const dataTags = tags
		.map((t) => t.id)
		.join(",")
		.toLocaleLowerCase();
	const nf = new Intl.NumberFormat("en-US");

	let repoLink = `
    <a href=${plugin.link} class="flex">${createIcon("github", "github")}</a>
    <div class="metric-item">${createIcon("star", "stars")} <span>${nf.format(
			plugin.stars,
		)}</span></div>
    <div class="metric-item">
      ${createIcon("alert-circle", "issues")} <span>${nf.format(
				plugin.openIssues,
			)}</span>
    </div>`;
	if (plugin.type === "srht") {
		repoLink = `<a href=${plugin.link} class="flex">${createIcon(
			"srht",
			"srht",
		)}</a>`;
	}

	return `
<div class="container plugin" data-username="${dataUsername}" data-repo="${dataRepo}" data-desc="${dataDesc}" data-tags="${dataTags}">
  <div class="header">
    <h2 class="item_header">
      <a href="/plugin/${plugin.username}/${plugin.repo}/">${plugin.username}/${plugin.repo}</a>
    </h2>
    <div class="metrics">
      ${repoLink}
    </div>
  </div>
  <div class="date">
    <span>created <time datetime="${plugin.createdAt}">${format(new Date(plugin.createdAt))}</time> / </span>
    <span>updated <time datetime="${plugin.updatedAt}">${format(new Date(plugin.updatedAt))}</time></span>
  </div>
  <div class="desc">
    ${plugin.description}
  </div>
  <div class="tags">
    ${tagsStr}
  </div>
</div>`;
};

const createConfigItem = (plugin: Plugin, tags: Tag[]) => {
	const tagsStr = tags.reduce((acc, tag) => {
		acc += createTag(tag, false);
		return acc;
	}, "");

	const dataUsername = plugin.username.toLocaleLowerCase();
	const dataRepo = plugin.repo.toLocaleLowerCase();
	const dataDesc = (plugin.description || "").toLocaleLowerCase();
	const dataTags = tags
		.map((t) => t.id)
		.join(",")
		.toLocaleLowerCase();
	const nf = new Intl.NumberFormat("en-US");

	let repoLink = `
    <a href=${plugin.link} class="flex">${createIcon("github", "github")}</a>
    <div class="metric-item">${createIcon("star", "stars")} <span>${nf.format(
			plugin.stars,
		)}</span></div>
    <div class="metric-item">
      ${createIcon("alert-circle", "issues")} <span>${nf.format(
				plugin.openIssues,
			)}</span>
    </div>`;
	if (plugin.type === "srht") {
		repoLink = `<a href=${plugin.link} class="flex">${createIcon(
			"srht",
			"srht",
		)}</a>`;
	}

	return `
<div class="container plugin" data-username="${dataUsername}" data-repo="${dataRepo}" data-desc="${dataDesc}" data-tags="${dataTags}">
  <div class="header">
    <h2 class="item_header">
      <a href="/plugin/${plugin.username}/${plugin.repo}">${plugin.username}/${plugin.repo}</a>
    </h2>
    <div class="metrics">
      ${repoLink}
    </div>
  </div>
  <div class="date">
    <span>created <time datetime="${plugin.createdAt}">${format(new Date(plugin.createdAt))}</time> / </span>
    <span>updated <time datetime="${plugin.updatedAt}">${format(new Date(plugin.updatedAt))}</time></span>
  </div>
  <div class="desc">
    ${plugin.description}
  </div>
  <div class="tags">
    ${tagsStr}
  </div>
</div>`;
};

function getTags(tagDb: TagMap, tags: string[]): Tag[] {
	return tags.map((t) => tagDb[t]).filter(Boolean);
}

const createAboutPage = () => {
	const head = `
<title>neovimcraft - about</title>
<meta name="description" content="About neovimcraft" />
<meta property="og:description" content="About neovimcraft" />
<meta property="og:title" content="neovimcraft - about" />

<script src="/nav.js" type="text/javascript"></script>
`;
	const nav = createNav();
	const body = `${nav}
<div class="about_container">
  <div class="about_view">
    <div class="intro">
      <div class="blurb">
        <h1>Hey all!</h1>
        <p>
          My name is <strong>Eric Bower</strong> and I built this site because neovim is awesome and
          I want to provide resources for searching an building neovim plugins.
        </p>
      </div>
    </div>
    <div>
      <p>
        I also write <a href="https://bower.sh">blog articles about software</a>.
      </p>
    </div>
    <div>
      <h2>FAQ</h2>
      <p>Do you have questions not answered here? Email me!</p>
      <h3>Where do we get our content from?</h3>
      <p>
        As of right now, most of our data is scraped from github. You can find our scrape script
        <a
          href="https://github.com/neurosnap/neovimcraft/blob/main/src/scripts/scrape.ts"
         >here</a
        >.
      </p>
      <h3>How can I submit a plugin or resource to this project?</h3>
      <p>
        Please read the <a href="https://github.com/neurosnap/neovimcraft#want-to-submit-a-plugin">neovimcraft README</a>.
      </p>
    </div>
  </div>
</div>`;

	return createHtmlFile({ head, body });
};

const createSearchPage = (data: PluginData, by: keyof Plugin) => {
	const pluginsStr = data.plugins.sort(onSort(by)).reduce((acc, plugin) => {
		const plug = createPluginItem(plugin, getTags(data.tagDb, plugin.tags));
		return `${acc}\n${plug}`;
	}, "");
	const tagListStr = data.tags.reduce(
		(acc, tag) => `${acc}\n${createTag(tag)}`,
		"",
	);
	const sortStr = () => {
		let str = "";
		if (by === "stars") {
			str += "stars\n";
		} else {
			str += '<a href="/">stars</a>\n';
		}

		if (by === "createdAt") {
			str += "created\n";
		} else {
			str += '<a href="/created/">created</a>\n';
		}

		if (by === "updatedAt") {
			str += "updated\n";
		} else {
			str += '<a href="/updated/">updated</a>\n';
		}

		return str;
	};

	const head = `
<title>neovimcraft</title>
  <meta property="og:title" content="neovimcraft" />
  <meta
    name="description"
    content="Search through our curated neovim plugin directory."
  />
  <meta
    property="og:description"
    content="Search through our curated neovim plugin directory."
  />
  <script src="/nav.js" type="text/javascript"></script>
  <script src="/client.js" type="text/javascript"></script>
`;
	const nav = createNav();
	const body = `${nav}
<div class="search_container">
  <div class="search_view">
    <span class="search_icon">${createIcon("search", "search")}</span>
    <input
      id="search"
      value=""
      placeholder="search to find a plugin"
      autocapitalize="off"
    />
    <span class="search_clear_icon" id="search_clear">
      ${createIcon("x-circle", "clear search")}
    </span>
  </div>
  <div class="tagline">
    <span>Search through our curated list of neovim plugins. </span>
    <span><a href="https://github.com/neurosnap/neovimcraft#want-to-submit-a-plugin">Submit a plugin</a></span>
  </div>

  <div class="sidebar">
    ${tagListStr}
  </div>
  <div class="rightbar">
    ${createAds()}
  </div>
  <div class="plugins">
    <div class="plugins_container">
      <div class="search_results">${data.plugins.length} results</div>
      <div id="sort_links">
        ${sortStr()}
      </div>
      <div id="plugins_list">
        ${pluginsStr}
      </div>
    </div>
  </div>
</div>`;

	return createHtmlFile({ head, body });
};

const createSearchConfigPage = (data: PluginData, by: keyof Plugin) => {
	const pluginsStr = data.plugins.sort(onSort(by)).reduce((acc, plugin) => {
		const plug = createConfigItem(plugin, []);
		return `${acc}\n${plug}`;
	}, "");
	const sortStr = () => {
		let str = "";
		if (by === "stars") {
			str += "stars\n";
		} else {
			str += '<a href="/c">stars</a>\n';
		}

		if (by === "createdAt") {
			str += "created\n";
		} else {
			str += '<a href="/c/created/">created</a>\n';
		}

		if (by === "updatedAt") {
			str += "updated\n";
		} else {
			str += '<a href="/c/updated/">updated</a>\n';
		}

		return str;
	};

	const head = `
<title>neovimcraft</title>
  <meta property="og:title" content="neovimcraft" />
  <meta
    name="description"
    content="Search through our curated neovim config directory."
  />
  <meta
    property="og:description"
    content="Search through our curated neovim config directory."
  />
  <script src="/nav.js" type="text/javascript"></script>
  <script src="/client.js" type="text/javascript"></script>
`;
	const nav = createNav();
	const body = `${nav}
<div class="search_container">
  <div class="search_view">
    <span class="search_icon">${createIcon("search", "search")}</span>
    <input
      id="search"
      value=""
      placeholder="search to find a config"
      autocapitalize="off"
    />
    <span class="search_clear_icon" id="search_clear">
      ${createIcon("x-circle", "clear search")}
    </span>
  </div>
  <div class="tagline">
    <span>Search through our curated list of neovim configs. </span>
    <span><a href="https://github.com/neurosnap/neovimcraft#want-to-submit-a-config">Submit a config</a></span>
  </div>

  <div class="sidebar"></div>
  <div class="rightbar">
    ${createAds()}
  </div>
  <div class="plugins">
    <div class="plugins_container">
      <div class="search_results">${data.plugins.length} results</div>
      <div id="sort_links">
        ${sortStr()}
      </div>
      <div id="plugins_list">
        ${pluginsStr}
      </div>
    </div>
  </div>
</div>`;

	return createHtmlFile({ head, body });
};

const createPluginView = (plugin: Plugin, tags: Tag[]) => {
	const tagsStr = tags.reduce((acc, tag) => {
		acc += createTag(tag, false);
		return acc;
	}, "");
	const nf = new Intl.NumberFormat("en-US");

	let metricsStr = "";
	if (plugin.type === "github") {
		metricsStr = `
    <div class="metrics_view">
        <div class="metric">
          ${createIcon("star", "stars")}
          <span>${nf.format(plugin.stars)}</span>
        </div>
        <div class="metric">
          ${createIcon("alert-circle", "issues")}
          <span>${nf.format(plugin.openIssues)}</span>
        </div>
        <div class="metric">
          ${createIcon("users", "subscribers")} <span>${nf.format(
						plugin.subscribers,
					)}</span>
        </div>
        <div class="metric">
          ${createIcon("git-branch", "forks")} <span>${nf.format(
						plugin.forks,
					)}</span>
        </div>
    </div>`;
	}

	return `
<div class="meta">
  <div class="tags_view">
    ${tagsStr}
  </div>
  ${metricsStr}
  <div class="timestamps">
    <div>
      <h5 class="ts_header">CREATED</h5>
      <h2><time datetime="${plugin.createdAt}">${format(new Date(plugin.createdAt))}</time></h2>
    </div>
    <div>
      <h5 class="ts_header">UPDATED</h5>
      <h2><time datetime="${plugin.updatedAt}">${format(new Date(plugin.updatedAt))}</time></h2>
    </div>
  </div>
  <hr />
</div>
`;
};

const createPluginPage = (plugin: Plugin, tags: Tag[], html: string) => {
	const head = `
<title>
  ${plugin.id}: ${plugin.description}
</title>
<meta property="og:title" content=${plugin.id} />
<meta name="twitter:title" content=${plugin.id} />
<meta itemprop="name" content=${plugin.id} />

<meta name="description" content="${plugin.id}: ${plugin.description}" />
<meta itemprop="description" content="${plugin.id}: ${plugin.description}" />
<meta property="og:description" content="${plugin.id}: ${plugin.description}" />
<meta name="twitter:description" content="${plugin.id}: ${plugin.description}" />

<script src="/nav.js" type="text/javascript"></script>
`;
	const nav = createNav();
	const body = `${nav}
<div class="plugin_container">
  <div class="view">
    <div class="header">
      <h2>${plugin.id}</h2>
      ${plugin.homepage ? `<a href=${plugin.homepage}>website</a>` : ""}
      <a href=${plugin.link} class="flex">${createIcon(
				"github",
				"github",
			)} <span>github</span></a>
    </div>
    ${createPluginView(plugin, tags)}
    ${html}
  </div>
</div>
`;
	return createHtmlFile({ head, body });
};

async function render(data: PluginData, htmlData: { [key: string]: string }) {
	const files = [
		createFile(`${OUTDIR}/index.html`, createSearchPage(data, "stars")),
		createFile(
			`${OUTDIR}/created/index.html`,
			createSearchPage(data, "createdAt"),
		),
		createFile(
			`${OUTDIR}/updated/index.html`,
			createSearchPage(data, "updatedAt"),
		),

		createFile(`${OUTDIR}/about/index.html`, createAboutPage()),
	];

	data.plugins.forEach((plugin) => {
		const tags = getTags(data.tagDb, plugin.tags);
		const id = getResourceId(plugin);
		const html = htmlData[id] || "";
		const fname = `${OUTDIR}/plugin/${plugin.username}/${plugin.repo}/index.html`;
		const page = createPluginPage(plugin, tags, html);
		files.push(createFile(fname, page));
	});

	await Promise.all(files);
}

async function renderConfig(
	data: PluginData,
	htmlData: { [key: string]: string },
) {
	const files = [
		createFile(`${OUTDIR}/c/index.html`, createSearchConfigPage(data, "stars")),
		createFile(
			`${OUTDIR}/c/created/index.html`,
			createSearchConfigPage(data, "createdAt"),
		),
		createFile(
			`${OUTDIR}/c/updated/index.html`,
			createSearchConfigPage(data, "updatedAt"),
		),
	];

	data.plugins.forEach((plugin) => {
		const tags = getTags(data.tagDb, plugin.tags);
		const id = getResourceId(plugin);
		const html = htmlData[id] || "";
		const fname = `${OUTDIR}/plugin/${plugin.username}/${plugin.repo}/index.html`;
		const page = createPluginPage(plugin, tags, html);
		files.push(createFile(fname, page));
	});

	await Promise.all(files);
}

interface HTMLFile {
	html: { [key: string]: string };
}

const htmlData = (htmlFile as HTMLFile).html;

const pluginMap = (dbFile as any).plugins as PluginMap;
const pluginData = derivePluginData(pluginMap);
render(pluginData, htmlData).then(console.log).catch(console.error);

const configMap = (configDbFile as any).plugins as PluginMap;
const configData = derivePluginData(configMap);
renderConfig(configData, htmlData).then(console.log).catch(console.error);
