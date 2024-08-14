import manualFile from "../../data/manual.json" with { type: "json" };
import manualConfigFile from "../../data/manual-config.json" with {
  type: "json",
};
import type { Resource } from "../types.ts";
import { createResource } from "../entities.ts";

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

  let tags: string[] = [];
  if (opt === "plugin") {
    console.log(
      "\nNOTICE: Please review all current tags and see if any fit, only add new tags if absolutely necessary\n",
    );
    const tagsRes = prompt("tags (comma separated):") || "";
    tags = tagsRes.split(",");
  }

  return createResource({
    type: type as any,
    username,
    repo,
    tags,
  });
}
