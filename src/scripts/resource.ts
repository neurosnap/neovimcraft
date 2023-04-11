import resourceFile from "../../data/resources.json" assert { type: "json" };
import resourceConfigFile from "../../data/resources-config.json" assert {
  type: "json",
};
import manualFile from "../../data/manual.json" assert { type: "json" };
import manualConfigFile from "../../data/manual-config.json" assert {
  type: "json",
};

import type { Resource, ResourceMap } from "../types.ts";
import { createResource, getResourceId } from "../entities.ts";

type Option = "plugin" | "config";

const forges = ["github", "srht"];
const forgesStr = forges.join(",");

let option = Deno.args[0];
if (!option) {
  option = "plugin";
}
if (option !== "config" && option !== "plugin") {
  throw new Error('"config" and "plugin" are the only two choices');
}

const resource = cli(option as Option);
save(resource).catch(console.error);

async function save(resource: Resource | undefined) {
  if (!resource) return;
  if (option === "plugin") {
    manualFile.resources.push(resource);
    const json = JSON.stringify(manualFile, null, 2);
    await Deno.writeTextFile("./data/manual.json", json);
  } else {
    manualConfigFile.resources.push(resource);
    const json = JSON.stringify(manualConfigFile, null, 2);
    await Deno.writeTextFile("./data/manual-config.json", json);
  }
}

function cli(opt: "config" | "plugin") {
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

  if (opt === "plugin") {
    const foundResource = (resourceFile.resources as Resource[]).find(
      (r) => getResourceId(r) === name,
    );
    if (foundResource) {
      console.log(`${name} aleady found in resources, not adding`);
      return;
    }
  } else {
    const resources = Object.values(
      resourceConfigFile.resources as ResourceMap,
    );
    const foundResource = resources.find(
      (r) => getResourceId(r) === name,
    );
    if (foundResource) {
      console.log(`${name} aleady found in resources, not adding`);
      return;
    }
  }

  console.log(
    "\nNOTICE: Please review all current tags and see if any fit, only add new tags if absolutely necessary\n",
  );
  const tagsRes = prompt("tags (comma separated):") || "";
  const tags = tagsRes.split(",");

  return createResource({
    type: type as any,
    username,
    repo,
    tags,
  });
}
