<script context="module" lang="ts">
  export const prerender = true;

  import { derivePluginData } from '$lib/plugin-data';
  import * as db from '$lib/db.json';

  export async function load() {
    const pluginDb = db.plugins as any;
    const { plugins, tags, tagDb } = derivePluginData(pluginDb);

    return {
      props: {
        plugins,
        tags,
        tagDb,
      },
    };
  }
</script>

<script lang="ts">
  import qs from 'query-string';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { Plugin, Tag, TagMap } from '$lib/types';
  import TagItem from '$lib/tag.svelte';
  import Icon from '$lib/icon.svelte';
  import PluginItem from '$lib/plugin.svelte';

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

  export let tagDb: TagMap = {};
  function getTags(tags: string[]): Tag[] {
    return tags.map((t) => tagDb[t]).filter(Boolean);
  }

  let search = '';
  page.subscribe(({ query }) => {
    search = decodeURIComponent(query.get('search') || '');
  });

  export let plugins: Plugin[] = [];
  export let tags: Tag[] = [];
  $: filterTotal = filterPlugins({ search, plugins });

  function paginate(p: number, items: Plugin[]) {
    const PER_PAGE = 15;
    const total = Math.ceil(items.length / PER_PAGE);
    const first = p === 1;
    const last = p === total;
    const end = p * PER_PAGE;
    const start = end - PER_PAGE;
    return { results: items.slice(start, end), first, last, total };
  }
  let curPage = 1;
  $: pager = paginate(curPage, filterTotal);
  const changePage = (next: number) => {
    curPage = next;
    document.getElementById('plugins_list').scrollTo(0, 0);
  };
  const prev = () => changePage(curPage - 1);
  const next = () => changePage(curPage + 1);
</script>

<div class="container">
  <div class="intro">
    <h1 id="logo">
      neovim awesome
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

  <div class="sidebar">
    <div class="desc">Search through our curated list of neovim plugins</div>
    {#each tags as tag}
      <TagItem {tag} {onSearch} />
    {/each}
  </div>
  <div class="plugins">
    <div class="plugins_list" id="plugins_list">
      <div class="search_results">{filterTotal.length} results</div>
      {#each pager.results as plugin}
        <PluginItem {plugin} tags={getTags(plugin.tags)} {onSearch} />
      {/each}
      <div class="paginate">
        <button on:click={prev} disabled={pager.first}>prev</button>
        <div>{curPage} of {pager.total}</div>
        <button on:click={next} disabled={pager.last}>next</button>
      </div>
    </div>
  </div>
</div>

<svelte:head>
  <title>Neovim Awesome - Plugin Search</title>
</svelte:head>

<style>
  :global(body) {
    overflow-y: hidden;
  }

  .paginate {
    margin: 30px 0;
    display: flex;
    align-items: center;
  }

  .desc {
    margin-bottom: 5px;
  }

  .search_view {
    grid-column: 2;
    grid-row: 1;
    position: relative;
  }

  .search_icon {
    position: absolute;
    top: 12px;
    left: 0;
  }

  .clear_search_icon {
    position: absolute;
    top: 15px;
    right: 0;
    cursor: pointer;
  }

  #search {
    width: 100%;
    height: 47px;
    padding-left: 30px;
    padding-right: 30px;
  }

  .search_results {
    margin: 0;
    margin-top: 5px;
    margin-bottom: 5px;
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

  .sidebar {
    grid-column: 1;
    grid-row: 2;
    padding: 0 10px;
    height: calc(100vh - 50px);
  }

  .plugins {
    grid-column: 2;
    grid-row: 2;
  }

  .plugins_list {
    height: calc(100vh - 50px);
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  button {
    padding: 10px 15px;
    margin: 0 10px;
    background-color: var(--highlight-color);
    color: var(--primary-color);
    cursor: pointer;
    outline: 0;
    border: 1px solid var(--primary-color);
    border-radius: 3px;
  }

  button:disabled {
    cursor: default;
    background-color: var(--primary-color);
  }

  button:hover:enabled {
    background-color: var(--highlight-secondary);
  }

  @media only screen and (max-width: 700px) {
    .container {
      grid-template-columns: 1fr;
      padding: 0 10px;
    }

    #logo,
    .sidebar {
      display: none;
    }

    .search_view {
      grid-column: 1;
    }

    .plugins {
      grid-column: 1;
    }
  }
</style>
