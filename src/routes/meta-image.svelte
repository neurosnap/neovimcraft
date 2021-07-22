<script lang="ts">
  import Tag from '$lib/tag.svelte';
  const tags = [
    { id: 'neovim', count: 11 },
    { id: 'plugins', count: 5 },
    { id: 'lua', count: 50 },
    { id: 'learn', count: 1 },
    { id: 'build', count: 2 },
  ];
</script>

<div class="container">
  <div class="meta">
    <div class="top">
      <div>
        <img class="logo" src="/neovim-mark-flat.png" alt="neovim logo" />
      </div>
      <div>
        <h1 class="header">neovim craft</h1>
        <div class="desc">
          Search through our curated neovim plugin directory and read our guides on creating
          plugins.
        </div>
      </div>
    </div>
    <div class="links">
      {#each tags as tag}
        <Tag {tag} showCount={false} />
      {/each}
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background-color: #fff;
  }

  .meta {
    width: 1200px;
    height: 600px;
    background-color: var(--bg-color);
    padding: 90px 60px;
  }

  .top {
    display: flex;
    align-items: center;
  }

  .logo {
    width: 150px;
    height: auto;
    margin-right: 30px;
  }

  .header {
    font-size: 10rem;
    line-height: 10rem;
    margin-bottom: 1rem;
  }

  .desc {
    font-size: 2rem;
    margin-left: 10px;
  }

  .links {
    margin-top: 1rem;
    margin-left: 190px;
  }

  :global(.tag) {
    font-size: 1.5rem !important;
    margin-right: 1rem !important;
    padding: 0.5rem !important;
  }
</style>
