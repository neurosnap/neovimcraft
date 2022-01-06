<script lang="ts">
  import qs from 'query-string';
  import { goto } from '$app/navigation';

  import type { Plugin, Tag } from './types';
  import TagItem from './tag.svelte';
  import Icon from './icon.svelte';
  import Tooltip from '$lib/tooltip.svelte';
  import { format, relativeTimeFromDates } from '$lib/date';

  export let plugin: Plugin;
  export let tags: Tag[];
  export let html: string = '<div>readme not found</div>';
  const isPlugin = tags.find((t) => t.id === 'plugin');

  function onSearch(curSearch: string) {
    const query = qs.parseUrl(window.location.search);
    const s = encodeURIComponent(curSearch);
    query.query.search = s;
    goto(`/${qs.stringifyUrl(query)}`);
  }
</script>

<div class="meta">
  <div class="tags_view">
    {#each tags as tag}
      <TagItem {tag} {onSearch} showCount={false} />
    {/each}
  </div>
  <div class="metrics">
    <Tooltip tip="stars" bottom>
      <div class="metric"><Icon icon="star" /> <span>{plugin.stars}</span></div>
    </Tooltip>
    <Tooltip tip="open issues" bottom>
      <div class="metric"><Icon icon="alert-circle" /> <span>{plugin.openIssues}</span></div>
    </Tooltip>
    <Tooltip tip="subscribers" bottom>
      <div class="metric"><Icon icon="users" /> <span>{plugin.subscribers}</span></div>
    </Tooltip>
    <Tooltip tip="forks" bottom>
      <div class="metric"><Icon icon="git-branch" /> <span>{plugin.forks}</span></div>
    </Tooltip>
  </div>
  <div class="timestamps">
    <div>
      <h5 class="ts-header">CREATED</h5>
      <h2>{format(new Date(plugin.createdAt))}</h2>
    </div>
    <div>
      <h5 class="ts-header">UPDATED</h5>
      <h2>{relativeTimeFromDates(new Date(plugin.updatedAt))}</h2>
    </div>
  </div>
  {#if isPlugin}
    <div class="install">
      <h3><a href="https://github.com/wbthomason/packer.nvim">packer</a></h3>
      <pre><code>require('packer').startup(function()
  use '{plugin.id}'
end)</code></pre>
    </div>
    <div class="install">
      <h3><a href="https://github.com/savq/paq-nvim">paq</a></h3>
      <pre><code>require "paq" &lcub; 
  '{plugin.id}'
&rcub;</code></pre>
    </div>
  {/if}
  <hr />
</div>
{@html html}

<style>
  :global(img) {
    max-width: 100%;
    height: auto;
  }

  .timestamps {
    display: flex;
    justify-content: space-between;
    background-color: var(--primary-color);
    padding: 15px;
    margin: 15px 0;
  }

  .ts-header {
    margin-bottom: 10px;
  }

  .meta {
    margin-bottom: 20px;
  }

  .metrics {
    display: flex;
    justify-content: space-between;
  }

  .metric {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .tags_view {
    margin-bottom: 10px;
  }

  .install {
    margin-top: 10px;
  }
</style>
