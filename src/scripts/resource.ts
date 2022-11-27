import resourceFile from "../../data/resources.json" assert { type: "json" };
import manualFile from "../../data/manual.json" assert { type: "json" };

import type { Resource } from "../types.ts";
import { createResource } from "../entities.ts";

async function init() {
  const name = prompt("name (username/repo):") || "";
  const [username, repo] = name.split("/");
  const tagsRes = prompt("tags (comma separated):") || "";
  const tags = tagsRes.split(",");
  const foundResource = (resourceFile.resources as Resource[]).find(
    (r) => `${r.username}/${r.repo}` === name,
  );
  if (foundResource) {
    console.log(`${name} aleady found in resources, not adding`);
    return;
  }

  manualFile.resources.push(
    createResource({
      type: "github",
      username,
      repo,
      tags,
    }),
  );

  const json = JSON.stringify(manualFile, null, 2);

  await Deno.writeTextFile("./data/manual.json", json);
}

init().catch(console.error);
