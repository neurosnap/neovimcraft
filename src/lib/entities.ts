import type { Plugin, Resource } from './types';

export const createPlugin = (p: Partial<Plugin> = {}): Plugin => {
  return {
    id: '',
    name: '',
    username: '',
    repo: '',
    link: '',
    tags: [],
    homepage: '',
    description: '',
    branch: 'main',
    openIssues: 0,
    watchers: 0,
    forks: 0,
    stars: 0,
    subscribers: 0,
    network: 0,
    ...p,
  };
};

export function createResource(p: Partial<Resource> = {}): Resource {
  return {
    type: 'github',
    username: '',
    repo: '',
    tags: [],
    ...p,
  };
}
