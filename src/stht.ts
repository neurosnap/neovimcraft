import type { FetchRepoProps, Resp } from "./types.ts";

interface SrhtRepo {
  id: string;
  name: string;
  created: string;
  updated: string;
  readme: string | null;
  description: string;
  HEAD: { name: string };
}

interface SrhtRepoResp {
  data: {
    user: {
      repository: SrhtRepo;
    };
  };
}

async function fetchReadme(
  props: FetchRepoProps,
  branch: string,
  fpath = "README.md",
): Promise<Resp<string>> {
  const url =
    `https://git.sr.ht/~${props.username}/${props.repo}/blob/${branch}/${fpath}`;
  console.log(`Fetching ${url}`);
  const resp = await fetch(url);
  const readme = await resp.text();
  if (!resp.ok) {
    return {
      ok: false,
      data: {
        status: resp.status,
        error: new Error(`failed to fetch srht readme: ${readme}`),
      },
    };
  }

  return { ok: true, data: readme };
}

async function recurseReadme(
  props: FetchRepoProps,
  branch: string,
  fnames: string[],
) {
  for (let i = 0; i < fnames.length; i += 1) {
    const readme = await fetchReadme(props, branch, fnames[i]);

    if (readme.ok) {
      return readme.data;
    } else {
      console.log(`${readme.data.status}: ${readme.data.error.message}`);
    }
  }

  return "";
}

interface SrhtData {
  repo: SrhtRepo;
  branch: string;
  readme: string;
}

export async function fetchSrhtData(
  props: FetchRepoProps,
): Promise<Resp<SrhtData>> {
  const query = `\
    query {\
      user(username: "${props.username}") {\
        repository(name: "${props.repo}") {\
          id,\
          name,\
          created,\
          updated,\
          readme,\
          description,\
          HEAD { name }\
        }\
      }\
    }`;
  const body = { query };

  const payload = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${props.token}`,
      ["Content-Type"]: "application/json",
    },
    body: JSON.stringify(body),
  };
  const url = "https://git.sr.ht/query";
  console.log(`Fetching ${url} [${props.username}/${props.repo}]`);
  const resp = await fetch(url, payload);

  if (!resp.ok) {
    return {
      ok: false,
      data: { status: resp.status, error: new Error("request failed") },
    };
  }

  const data: SrhtRepoResp = await resp.json();
  const repo = data.data.user.repository;
  const name = repo.HEAD.name;
  const ref = name.split("/");
  const branch = ref[ref.length - 1];
  let readmeData = "";
  if (repo.readme) {
    readmeData = repo.readme;
  } else {
    // supported readme: https://git.sr.ht/~sircmpwn/scm.sr.ht/tree/83185bf27e1e67ab2ce88851dc7a3f7766075a60/item/scmsrht/formatting.py#L25
    const fnames = ["README.md", "README.markdown", "README"];
    readmeData = await recurseReadme(props, branch, fnames);
  }

  return {
    ok: true,
    data: {
      repo,
      branch,
      readme: readmeData,
    },
  };
}
