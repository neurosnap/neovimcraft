export interface Plugin {
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
}

export type PluginMap = { [key: string]: Plugin };

export interface Tag {
  id: string;
  count: number;
}

export type TagMap = { [key: string]: Tag };

export interface Resource {
  type: 'github';
  username: string;
  repo: string;
  tags: string[];
}

export type ResourceMap = { [key: string]: Resource };
