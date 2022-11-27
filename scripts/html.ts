import { marked } from "npm:marked";

import type { Plugin } from "../src/types.ts";

clean().catch(console.error);

async function clean() {
  const file = await Deno.readTextFile("./data/db.json");
  const db = JSON.parse(file.toString());
  const markdownFile = await Deno.readTextFile("./data/markdown.json");
  const markdownDb = JSON.parse(markdownFile.toString());

  const plugins = Object.values(db.plugins) as Plugin[];
  const nextDb: { [key: string]: string } = {};
  plugins.forEach((plugin) => {
    console.log(`processing ${plugin.id}`);
    marked.use({
      walkTokens: (token: any) => {
        const domain = "https://github.com";
        const pre =
          `${domain}/${plugin.username}/${plugin.repo}/blob/${plugin.branch}`;

        if (token.type === "link" || token.type === "image") {
          if (
            token.href && !token.href.startsWith("http") &&
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
    nextDb[plugin.id] = html;
  });

  try {
    const json = JSON.stringify({ html: nextDb }, null, 2);
    await Deno.writeTextFile("./data/html.json", json);
  } catch (err) {
    console.error(err);
  }
}
