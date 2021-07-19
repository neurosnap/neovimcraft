import type { Plugin } from '$lib/types';
import * as db from '$lib/db.json';
import * as pluginHtml from '$lib/html.json';
import { derivePluginData } from '$lib/plugin-data';

export async function get({ params }) {
  const { username, repo } = params;
  const id = `${username}/${repo}`;
  const plugin = db.plugins[id] as Plugin;
  const { tagDb } = derivePluginData(db.plugins);
  const html = pluginHtml.html[id];
  const tags = plugin.tags.map((t) => tagDb[t]).filter(Boolean);

  return { body: { plugin, html, tags } };
}
