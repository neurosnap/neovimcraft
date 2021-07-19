<script lang="ts">
  import qs from 'query-string';
  import { goto } from '$app/navigation';

  import type { Plugin, Tag } from './types';
  import TagView from './tag.svelte';
  import Icon from './icon.svelte';
  import Tooltip from '$lib/tooltip.svelte';

  export let plugin: Plugin;
  export let tags: Tag[];
  export let html: string = '<div>readme not found</div>';

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
      <TagView {tag} {onSearch} />
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
  <div class="install">
    <h3>packer</h3>
    <pre><code>require('packer').startup(function()
  use '{plugin.id}'
end)</code></pre>
  </div>
  <div class="install">
    <h3>paq</h3>
    <pre><code>require "paq" &lcub; 
  '{plugin.id}'
&rcub;</code></pre>
  </div>
  <hr />
</div>
{@html html}

<style>
  :global(img) {
    max-width: 100%;
    height: auto;
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
