import type { Plugin, PluginData, PluginMap, TagMap } from "./types.ts";

function getTagsDb(plist: Plugin[]): TagMap {
	const tagsDb: TagMap = {};
	plist.forEach((plugin) => {
		plugin.tags.forEach((tag) => {
			if (!tagsDb[tag]) {
				tagsDb[tag] = { id: tag, count: 0 };
			}
			tagsDb[tag].count += 1;
		});
	});
	return tagsDb;
}

export function derivePluginData(pluginDb: PluginMap): PluginData {
	const plugins = Object.values(pluginDb).sort((a, b) => b.stars - a.stars);
	const tagDb = getTagsDb(plugins);
	const tags = Object.values(tagDb).sort((a, b) => b.count - a.count);
	return { plugins, tags, tagDb };
}
