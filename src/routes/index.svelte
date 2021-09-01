<script context="module" lang="ts">
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
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import type { Plugin, Tag, TagMap } from '$lib/types';
  import TagItem from '$lib/tag.svelte';
  import Icon from '$lib/icon.svelte';
  import PluginItem from '$lib/plugin.svelte';
  import Nav from '$lib/nav.svelte';

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
    if (typeof window === 'undefined') return;
    if (curSearch) {
      goto(`/?search=${curSearch}`, {
        replaceState: true,
        keepfocus: true,
      });
    } else {
      goto('/', { replaceState: true, keepfocus: true });
    }
  }

  const sortNum = (a: number, b: number) => b - a;
  const sortDateStr = (a: string, b: string) => {
    const dateA = new Date(a).getTime();
    const dateB = new Date(b).getTime();
    return dateB - dateA;
  };

  function onSort(by: keyof Plugin) {
    if (by === 'createdAt') {
      return (a: Plugin, b: Plugin) => sortDateStr(a.createdAt, b.createdAt);
    }
    if (by === 'updatedAt') {
      return (a: Plugin, b: Plugin) => sortDateStr(a.updatedAt, b.updatedAt);
    }
    return (a: Plugin, b: Plugin) => sortNum(a.stars, b.stars);
  }

  function clearSearch() {
    goto('/');
    document.getElementById('search').focus();
  }

  function filterPlugins({
    search,
    plugins,
    sort,
  }: {
    search: string;
    plugins: Plugin[];
    sort: keyof Plugin;
  }): Plugin[] {
    if (!search) return plugins.sort(onSort(sort));

    const onFilter = (plugin: Plugin) => {
      if (search.includes('tag:')) {
        const nextSearch = search.toLocaleLowerCase().replace('tag:', '');
        return plugin.tags.some((tag) => tag === nextSearch);
      }
      return plugin.id.toLocaleLowerCase().includes(search.toLocaleLowerCase());
    };

    return plugins.filter(onFilter).sort(onSort(sort));
  }

  export let tagDb: TagMap = {};
  function getTags(tags: string[]): Tag[] {
    return tags.map((t) => tagDb[t]).filter(Boolean);
  }

  $: search = decodeURIComponent($page.query.get('search') || '');
  let sort = 'stars' as keyof Plugin;
  const setSort = (e: any, nextSort: keyof Plugin) => {
    e.preventDefault();
    sort = nextSort;
  };
  export let plugins: Plugin[] = [];
  export let tags: Tag[] = [];
  $: filterTotal = filterPlugins({ search, plugins, sort });
</script>

<svelte:head>
  <title>neovimcraft</title>
  <meta property="og:title" content="neovimcraft" />
  <meta
    name="description"
    content="Search through our curated neovim plugin directory and read our guides on creating plugins."
  />
  <meta
    property="og:description"
    content="Search through our curated neovim plugin directory and read our guides on creating plugins."
  />
</svelte:head>

<Nav />

<div class="container">
  <div class="search_view">
    <span class="search_icon"><Icon icon="search" /></span>
    <input
      id="search"
      on:keyup={debounce(onSearch)}
      value={search}
      placeholder="search to find a plugin"
      autocapitalize="off"
    />
    {#if search}
      <span class="clear_search_icon" on:click={clearSearch}>
        <Icon icon="x-circle" />
      </span>
    {/if}
  </div>
  <div class="desc">Search through our curated list of neovim plugins</div>

  <div class="sidebar">
    {#each tags as tag}
      <TagItem {tag} {onSearch} />
    {/each}
  </div>
  <div class="plugins">
    <div class="plugins_list" id="plugins_list">
      <div class="search_results">{filterTotal.length} results</div>
      <div>
        {#if sort === 'stars'}
          stars
        {:else}
          <a href="#" on:click={(e) => setSort(e, 'stars')}>stars</a>
        {/if}
        {#if sort === 'createdAt'}
          created
        {:else}
          <a href="#" on:click={(e) => setSort(e, 'createdAt')}>created</a>
        {/if}
        {#if sort === 'updatedAt'}
          updated
        {:else}
          <a href="#" on:click={(e) => setSort(e, 'updatedAt')}>updated</a>
        {/if}
      </div>
      {#each filterTotal as plugin}
        <PluginItem {plugin} tags={getTags(plugin.tags)} {onSearch} />
      {/each}
    </div>
  </div>
</div>

<style>
  .desc {
    margin-bottom: 5px;
    margin-left: 25px;
    grid-row: 1;
    grid-column: 1;
    align-items: center;
    display: flex;
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
    display: grid;
    height: calc(100vh - 65px);
    grid-template-columns: minmax(250px, 400px) minmax(350px, 600px);
    grid-template-rows: 50px 1fr;
    column-gap: 10px;
  }

  .sidebar {
    grid-column: 1;
    grid-row: 2;
    padding: 0 25px 25px 25px;
  }

  .plugins {
    grid-column: 2;
    grid-row: 2;
  }

  .plugins_list {
    width: 100%;
  }

  @media only screen and (max-width: 700px) {
    .container {
      grid-template-columns: 92%;
      justify-content: center;
    }

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
