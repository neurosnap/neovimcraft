export interface Plugin {
	type: "github" | "srht";
	id: string;
	name: string;
	username: string;
	repo: string;
	link: string;
	tags: string[];
	homepage: string;
	branch: string;
	openIssues: number;
	watchers: number;
	forks: number;
	stars: number;
	subscribers: number;
	network: number;
	description: string;
	createdAt: string;
	updatedAt: string;
}

export type PluginMap = { [key: string]: Plugin };

export interface Tag {
	id: string;
	count: number;
}

export type TagMap = { [key: string]: Tag };

export interface PluginData {
	plugins: Plugin[];
	tags: Tag[];
	tagDb: TagMap;
}

export interface Resource {
	type: "github" | "srht";
	username: string;
	repo: string;
	tags: string[];
}

export type ResourceMap = { [key: string]: Resource };

export interface ApiSuccess<D = any> {
	ok: true;
	next?: string;
	data: D;
}

export interface ApiFailure {
	ok: false;
	data: { status: number; error: Error };
}

export type Resp<D> = ApiSuccess<D> | ApiFailure;

export interface FetchRepoProps {
	username: string;
	repo: string;
	token: string;
}
