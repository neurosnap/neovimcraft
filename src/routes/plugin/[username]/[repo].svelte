<script context="module" lang="ts">
  export const prerender = true;

  import type { LoadInput } from '@sveltejs/kit';

  export async function load({ page, fetch }: LoadInput) {
    const { username, repo } = page.params;
    const url = `/plugin/${username}/${repo}.json`;
    const res = await fetch(url);

    if (res.ok) {
      return {
        props: await res.json(),
      };
    }

    return {
      status: res.status,
      error: new Error(`Could not load ${url}`),
    };
  }
</script>

<script lang="ts">
  import type { Plugin, Tag } from '$lib/types';
  import PluginView from '$lib/plugin-view.svelte';
  import Icon from '$lib/icon.svelte';
  import Nav from '$lib/nav.svelte';

  export let plugin: Plugin;
  export let tags: Tag[];
  export let html: string;
</script>

<svelte:head>
  <title>
    {plugin.id}: {plugin.description}
  </title>
  <meta property="og:title" content={plugin.id} />
  <meta name="twitter:title" content={plugin.id} />
  <meta itemprop="name" content={plugin.id} />

  <meta name="description" content="{plugin.id}: {plugin.description}" />
  <meta itemprop="description" content="{plugin.id}: {plugin.description}" />
  <meta property="og:description" content="{plugin.id}: {plugin.description}" />
  <meta name="twitter:description" content="{plugin.id}: {plugin.description}" />
</svelte:head>

<Nav />

<div class="container">
  <div class="view">
    <div class="header">
      <h1>{plugin.id}</h1>
      {#if plugin.homepage}<a href={plugin.homepage} target="_blank">website</a>{/if}
      <a href={plugin.link} target="_blank"><Icon icon="github" /> <span>github</span></a>
    </div>
    <PluginView {plugin} {tags} {html} />
  </div>
</div>

<style>
  .container {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .view {
    max-width: 800px;
    width: 95%;
    padding: 0 10px 30px 10px;
  }

  .header {
    display: flex;
    align-items: center;
  }

  .header > a {
    margin-left: 15px;
    display: flex;
    align-items: center;
  }
</style>
