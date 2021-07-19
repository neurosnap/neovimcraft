<script context="module" lang="ts">
  export const prerender = true;

  import { derivePluginData } from '$lib/plugin-data';
  import * as db from '$lib/db.json';

  export async function load() {
    const pluginDb = db.plugins as any;
    const { plugins, tags } = derivePluginData(pluginDb);

    return {
      props: {
        plugins,
        tags,
      },
    };
  }
</script>

<script lang="ts">
  import qs from 'query-string';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { Plugin, Tag } from '$lib/types';
  import TagView from '$lib/tag.svelte';
  import Icon from '$lib/icon.svelte';
  import Tooltip from '$lib/tooltip.svelte';

  let timer: NodeJS.Timeout;
  const debounce = (fn: (v: string) => any) => {
    return (event: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn(event.target.value);
      }, 250);
    };
  };

  function onSearch(curSearch: string) {
    if (curSearch) {
      const query = qs.parseUrl(window.location.search);
      const s = encodeURIComponent(curSearch);
      query.query.search = s;
      goto(`/${qs.stringifyUrl(query)}`, {
        replaceState: true,
        noscroll: true,
        keepfocus: true,
      });
    } else {
      const query = qs.parseUrl(window.location.search);
      delete query.query.search;
      goto(`/${qs.stringifyUrl(query)}`, { replaceState: true, noscroll: true, keepfocus: true });
    }
  }

  function clearSearch() {
    goto('/', {
      replaceState: true,
      noscroll: true,
      keepfocus: true,
    });
    document.getElementById('search').focus();
  }

  function filterPlugins({ search, plugins }: { search: string; plugins: Plugin[] }): Plugin[] {
    if (!search) return plugins;

    const onFilter = (plugin: Plugin) => {
      if (search.includes('tag:')) {
        const nextSearch = search.replace('tag:', '');
        return plugin.tags.some((tag) => tag === nextSearch);
      }
      return plugin.id.toLocaleLowerCase().includes(search);
    };

    return plugins.filter(onFilter);
  }

  let search = '';
  page.subscribe(({ query }) => {
    search = decodeURIComponent(query.get('search') || '');
  });

  export let plugins: Plugin[] = [];
  export let tags: Tag[] = [];
  $: results = filterPlugins({ search, plugins });
</script>

<div class="container">
  <div class="intro">
    <h1 id="logo">
      Neovim Awesome
      <a href="https://github.com/neurosnap/neovim-awesome" target="_blank">
        <Icon icon="github" />
      </a>
    </h1>
  </div>

  <div class="search_view">
    <span class="search_icon"><Icon icon="search" /></span>
    <input
      id="search"
      on:keyup={debounce(onSearch)}
      value={search}
      placeholder="search to find a plugin"
    />
    {#if search}
      <span class="clear_search_icon" on:click={clearSearch}>
        <Icon icon="x-circle" />
      </span>
    {/if}
  </div>

  <div class="tags_view">
    {#each tags as tag}
      <TagView {tag} {onSearch} />
    {/each}
  </div>
  <div class="plugins_view">
    <div class="plugins_list">
      {#each results as plugin}
        <div class="plugin">
          <div class="plugin_top">
            <h2 class="plugin_item_header">
              <a href="/plugin/{plugin.username}/{plugin.repo}">{plugin.repo}</a>
            </h2>
            <div class="plugin_metrics">
              <Tooltip tip="stars" bottom>
                <div class="metric"><Icon icon="star" /> <span>{plugin.stars}</span></div>
              </Tooltip>
              <Tooltip tip="open issues" bottom>
                <div class="metric">
                  <Icon icon="alert-circle" /> <span>{plugin.openIssues}</span>
                </div>
              </Tooltip>
            </div>
          </div>
          <div class="plugin_desc">
            {plugin.description}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>

<svelte:head>
  <title>Neovim Awesome - Plugin Search</title>
</svelte:head>

<style>
  .search_view {
    grid-column: 2;
    grid-row: 1;
    position: relative;
  }

  .search_icon {
    position: absolute;
    top: 15px;
    left: 0;
  }

  .clear_search_icon {
    position: absolute;
    top: 15px;
    right: 0;
    cursor: pointer;
  }

  #search {
    width: calc(100% - 60px);
    height: 47px;
    padding-left: 30px;
    padding-right: 30px;
  }

  .container {
    height: 100vh;
    display: grid;
    grid-template-columns: minmax(250px, 400px) minmax(350px, 600px);
    grid-template-rows: 50px 1fr;
    column-gap: 10px;
  }

  .intro {
    padding: 0 10px 0 10px;
    grid-column: 1;
    grid-row: 1;
  }

  #logo {
    display: flex;
    align-items: center;
  }

  #logo > a {
    margin-left: 15px;
  }

  .tags_view {
    grid-column: 1;
    grid-row: 2;
    padding: 0 10px;
    height: calc(100vh - 50px);
    overflow-y: scroll;
  }

  .plugin {
    display: flex;
    flex-direction: column;
    padding: 15px;
    height: 110px;
    border-bottom: 1px solid var(--primary-color);
  }

  .plugin_top {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  .plugin_desc {
    margin-top: 5px;
  }

  .plugin_item_header {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .plugin_metrics {
    width: 150px;
    min-width: 150px;
    display: flex;
    justify-content: space-between;
  }

  .metric {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .plugins_view {
    display: flex;
    align-items: center;
    flex-direction: column;
    grid-column: 2;
    grid-row: 2;
    height: calc(100vh - 50px);
  }

  .plugins_list {
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  @media only screen and (max-width: 700px) {
    .container {
      grid-template-columns: 1fr;
    }

    #logo,
    .tags_view {
      display: none;
    }

    .search_view {
      grid-column: 1;
      padding: 0 10px;
    }

    .plugins_view {
      grid-column: 1;
    }
  }
</style>
