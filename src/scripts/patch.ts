import scrapePluginData from "../../data/scrape.json" with { type: "json" };
import manualPluginData from "../../data/manual.json" with { type: "json" };
import scrapeConfigData from "../../data/scrape-config.json" with {
  type: "json",
};
import manualConfigData from "../../data/manual-config.json" with {
  type: "json",
};

import type { Resource, ResourceMap } from "../types.ts";
import { getResourceId } from "../entities.ts";

init().catch(console.error);

async function init() {
  const plugins = patch({
    scrapeData: scrapePluginData as any,
    manualData: manualPluginData as any,
  });
  await Deno.writeTextFile("./data/resources.json", plugins);

  const config = patch({
    scrapeData: scrapeConfigData as any,
    manualData: manualConfigData as any,
  });
  await Deno.writeTextFile("./data/resources-config.json", config);
}

interface ResourceContainer {
  resources: Resource[];
}

interface PatchOpt {
  scrapeData: ResourceContainer;
  manualData: ResourceContainer;
}

function patch(
  { scrapeData, manualData }: PatchOpt,
) {
  const db: ResourceMap = {};
  const scrapeResources = scrapeData.resources as Resource[];
  scrapeResources.forEach((r: Resource) => {
    db[getResourceId(r)] = r;
  });

  const manualResources = manualData.resources as Resource[];
  // resource file trumps what we scrape so we can make changes to things like the tags
  manualResources.forEach((r) => {
    db[getResourceId(r)] = r;
  });

  const newResources = Object.values(db).sort((a, b) => {
    if (a.username === b.username) {
      return a.repo.localeCompare(b.repo);
    }
    return a.username.localeCompare(b.username);
  });
  const data = { resources: newResources };
  const json = JSON.stringify(data, null, 2);
  return json;
}
