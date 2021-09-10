<script lang="ts">
  import type { Plugin, Tag } from './types';
  import Tooltip from './tooltip.svelte';
  import Icon from './icon.svelte';
  import TagItem from './tag.svelte';
  import { relativeTimeFromDates } from './date';
  export let plugin: Plugin;
  export let tags: Tag[];
  export let onSearch: (t: string) => any = (_: string) => {};
</script>

<div class="container">
  <div class="header">
    <h2 class="item_header">
      <a href="/plugin/{plugin.username}/{plugin.repo}">{plugin.repo}</a>
    </h2>
    <div class="metrics">
      <Tooltip tip="github repo" bottom>
        <a href={plugin.link} target="_blank"><Icon icon="github" /></a>
      </Tooltip>
      <Tooltip tip="stars" bottom>
        <div class="metric-item"><Icon icon="star" /> <span>{plugin.stars}</span></div>
      </Tooltip>
      <Tooltip tip="open issues" bottom>
        <div class="metric-item">
          <Icon icon="alert-circle" /> <span>{plugin.openIssues}</span>
        </div>
      </Tooltip>
    </div>
  </div>
  <div class="date">
    updated {relativeTimeFromDates(new Date(plugin.updatedAt))}
  </div>
  <div class="desc">
    {plugin.description}
  </div>
  <div class="tags">
    {#each tags as tag}
      <TagItem {tag} showCount={false} {onSearch} />
    {/each}
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: column;
    padding: 15px 0;
    min-height: 170px;
    width: 100%;
    border-bottom: 1px solid var(--primary-color);
  }

  .date {
    font-size: 14px;
  }

  .header {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
  }

  .desc {
    margin-top: 5px;
  }

  .item_header {
    flex: 1;
    display: flex;
    align-items: center;
  }

  .metrics {
    width: 175px;
    min-width: 175px;
    display: flex;
    justify-content: space-between;
  }

  .metric-item {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .tags {
    margin-top: 5px;
  }
</style>
