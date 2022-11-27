import dbFile from "../../data/db.json" assert { type: "json" };
import resourceFile from "../../data/resources.json" assert { type: "json" };
import manualFile from "../../data/manual.json" assert { type: "json" };
import { derivePluginData } from "../plugin-data.ts";

import type { PluginMap, Resource } from "../types.ts";
import { createResource } from "../entities.ts";

const forges = ["github", "srht"];
const forgesStr = forges.join(",");

async function init() {
  const pluginMap = (dbFile as any).plugins as PluginMap;
  const pluginData = derivePluginData(pluginMap);
  const allTags = pluginData.tags.map((t) => t.id);

  const type = prompt(`code forge [${forgesStr}] (default: github):`) ||
    "github";
  if (!forges.includes(type)) {
    throw new Error(`${type} is not a valid code forge, choose ${forgesStr}`);
  }

  const name = prompt("name (username/repo):") || "";
  let [username, repo] = name.split("/");
  if (type === "srht" && username[0] === "~") {
    username = username.replace("~", "");
  }

  const foundResource = (resourceFile.resources as Resource[]).find(
    (r) => `${r.username}/${r.repo}` === name,
  );
  if (foundResource) {
    console.log(`${name} aleady found in resources, not adding`);
    return;
  }

  console.log(
    "\nNOTICE: Please review all current tags and see if any fit, only add new tags if absolutely necessary:\n",
  );
  console.log(`[${allTags.join(", ")}]\n`);
  const tagsRes = prompt("tags (comma separated):") || "";
  const tags = tagsRes.split(",");

  manualFile.resources.push(
    createResource({
      type: type as any,
      username,
      repo,
      tags,
    }),
  );

  const json = JSON.stringify(manualFile, null, 2);
  await Deno.writeTextFile("./data/manual.json", json);
}

init().catch(console.error);
