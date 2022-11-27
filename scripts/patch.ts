import scrapeData from "../data/scrape.json" assert { type: "json" };
import manualData from "../data/manual.json" assert { type: "json" };

import type { Resource, ResourceMap } from "../src/types.ts";

patch().then(console.log).catch(console.error);

async function patch() {
  const db: ResourceMap = {};
  const getId = (r: Resource) => `${r.username}/${r.repo}`;
  const scrapeResources = scrapeData.resources as Resource[];
  scrapeResources.forEach((r: Resource) => {
    db[getId(r)] = r;
  });

  const manualResources = manualData.resources as Resource[];
  // resource file trumps what we scrape so we can make changes to things like the tags
  manualResources.forEach((r) => {
    db[getId(r)] = r;
  });

  const newResources = Object.values(db).sort((a, b) => {
    if (a.username === b.username) {
      return a.repo.localeCompare(b.repo);
    }
    return a.username.localeCompare(b.username);
  });
  const data = { resources: newResources };
  const json = JSON.stringify(data, null, 2);

  await Deno.writeTextFile("./data/resources.json", json);
}
