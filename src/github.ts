import type { FetchRepoProps, Resp } from "./types.ts";

import { Buffer } from "./deps.ts";

const accessToken = process.env.GITHUB_ACCESS_TOKEN || "";
const accessUsername = process.env.GITHUB_USERNAME || "";
export const ghToken = Buffer.from(`${accessUsername}:${accessToken}`).toString(
	"base64",
);

function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

const nextRe = new RegExp(/<([^<]+)>; rel="next"/);

async function githubApi<D = any>(
	endpoint: string,
	token: string,
): Promise<Resp<D>> {
	const url = `https://api.github.com${endpoint}`;
	console.log(`Fetching ${url}`);
	const res = await fetch(url, {
		headers: { Authorization: `Basic ${token}` },
	});

	const rateLimitRemaining = parseInt(
		res.headers.get("X-RateLimit-Remaining") || "-1", 10
	);
	// this value is in seconds, not ms
	const rateLimitReset = parseInt(res.headers.get("X-RateLimit-Reset") || "-1", 10);
	console.log(`rate limit remaining: ${rateLimitRemaining}`);
	if (rateLimitRemaining === 1 || rateLimitRemaining === 0) {
		const now = Date.now();
		const RESET_BUFFER = 500;
		const wait = rateLimitReset * 1000 + RESET_BUFFER - now;
		// ms -> s -> min
		const mins = Math.ceil(wait / 1000 / 60);
		if (mins > 0) {
			console.log(`Hit github rate limit, waiting ${mins} mins`);
		}
		await delay(wait);
	}

	let data = null;
	try {
		data = await res.json();
	} catch {
		return {
			ok: false,
			data: {
				status: res.status,
				error: new Error(`JSON parsing error [${url}]`),
			},
		};
	}

	if (res.ok) {
		// pagination
		let next = "";
		const link = res.headers.get("link");
		if (link) {
			const paginated = nextRe.exec(link || "");
			if (paginated && paginated.length > 1) {
				next = paginated[1];
			}
		}

		return {
			ok: true,
			next,
			data,
		};
	}

	return {
		ok: false,
		data: {
			status: res.status,
			error: new Error(`Could not load [${url}]`),
		},
	};
}

async function fetchReadme({
	username,
	repo,
	token,
}: FetchRepoProps): Promise<Resp<string>> {
	const result = await githubApi(`/repos/${username}/${repo}/readme`, token);
	if (!result.ok) {
		return {
			ok: false,
			data: result.data as any,
		};
	}

	const url = result.data.download_url;
	console.log(`Fetching README ${url}`);
	const readme = await fetch(url);
	const data = await readme.text();
	return {
		ok: true,
		data,
	};
}

interface RepoData {
	name: string;
	html_url: string;
	homepage: string;
	default_branch: string;
	open_issues_count: number;
	watchers_count: number;
	forks: number;
	stargazers_count: number;
	subscribers_count: number;
	network_count: number;
	description: string;
	created_at: string;
	updated_at: string;
}

async function fetchRepo({
	username,
	repo,
	token,
}: FetchRepoProps): Promise<Resp<RepoData>> {
	if (!username || !repo) {
		return {
			ok: false,
			data: {
				status: 0,
				error: new Error(`malformed repo ${username}/${repo}`),
			},
		};
	}
	const result = await githubApi(`/repos/${username}/${repo}`, token);
	return result;
}

interface BranchData {
	commit: {
		commit: {
			committer: {
				date: string;
			};
		};
	};
}

async function fetchBranch({
	username,
	repo,
	branch,
	token,
}: FetchRepoProps & { branch: string }): Promise<Resp<BranchData>> {
	const result = await githubApi(
		`/repos/${username}/${repo}/branches/${branch}`,
		token,
	);
	return result;
}

interface GithubData {
	readme: string;
	repo: RepoData;
	branch: Resp<BranchData>;
}

export async function fetchGithubData(
	props: FetchRepoProps,
): Promise<Resp<GithubData>> {
	console.log(`Fetching repo ${props.username}/${props.repo}`);
	const repo = await fetchRepo(props);
	if (!repo.ok) {
		return repo;
	}

	console.log(`Fetching branch ${props.username}/${props.repo}`);
	const branch = await fetchBranch({
		...props,
		branch: repo.data.default_branch,
	});
	if (!branch.ok) {
		console.error(`${branch.data.status}: ${branch.data.error.message}`);
		return branch;
	}

	console.log(`Fetching readme ${props.username}/${props.repo}`);
	const readme = await fetchReadme({
		username: props.username,
		repo: props.repo,
		token: props.token,
	});
	if (!readme.ok) {
		console.error(`${readme.data.status}: ${readme.data.error.message}`);
		return readme;
	}

	console.log(`Fetching complete ${props.username}/${props.repo}`);
	return {
		ok: true,
		data: {
			readme: readme.ok ? readme.data : "",
			repo: repo.data,
			branch,
		},
	};
}

type TopicRepo = RepoData & { full_name: string; topics: string[] };

export async function fetchTopics(topic: string, token: string) {
	const items: TopicRepo[] = [];
	let next = `/search/repositories?q=${topic}&per_page=25`;
	// limit the number of pages
	// let count = 0;

	while (next) {
		const result = await githubApi<{ items: TopicRepo[] }>(next, token);

		next = "";

		if (result.ok) {
			items.push(...result.data.items);

			/* count += 1;
      if (result.next && count < 3) {
        next = result.next;
        next = next.replace('https://api.github.com', '');
      } */
		} else {
			console.error(result.data);
		}
	}

	return items;
}
