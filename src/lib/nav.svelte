<script lang="ts">
  import Icon from '$lib/icon.svelte';
  import { page } from '$app/stores';
  let path = '';
  page.subscribe((store) => {
    path = store.path;
  });
  const links = [
    ['/', 'plugins'],
    ['/guides', 'guides'],
    ['/about', 'about'],
  ];
  let isOpen = false;
  const open = () => {
    isOpen = true;
  };
  const close = () => {
    isOpen = false;
  };
</script>

<div class="nav">
  <h1 id="logo">
    neovim craft
    <a href="https://github.com/neurosnap/neovimcraft" target="_blank">
      <Icon icon="github" />
    </a>
  </h1>
  <div class="links">
    {#each links as link}
      <a href={link[0]} class="link" class:active={path === link[0]}>{link[1]}</a>
    {/each}
  </div>
  <div class="menu-btn" on:click={open}><img src="/menu.svg" alt="menu" /></div>
  {#if isOpen}
    <div class="menu-container">
      <div class="menu-overlay" on:click={close} />
      <div class="menu">
        <div class="menu-header">
          <h1>neovim craft</h1>
          <div class="menu-btn" on:click={close}><img src="/menu.svg" alt="menu" /></div>
        </div>
        <div class="menu-body">
          {#each links as link}
            <a href={link[0]} class="link" class:active={path === link[0]}>{link[1]}</a>
          {/each}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 10px;
    padding-bottom: 15px;
  }

  .links {
    display: flex;
    justify-content: space-between;
    width: 250px;
  }

  .link {
    font-size: 20px;
    text-decoration: none;
    color: var(--text-color);
  }

  .link:hover {
    color: var(--highlight-color);
    text-decoration: underline;
  }

  .menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1;
  }

  .menu-container {
    display: none;
  }

  .menu {
    position: fixed;
    top: 0;
    right: 0;
    width: 80vw;
    height: 100vh;
    flex-direction: column;
    align-items: end;
    background-color: var(--bg-color);
    z-index: 1;
    padding: 0 15px;
    padding-top: 0;
    border-left: 1px solid var(--primary-color);
  }

  .menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .menu-body {
    display: flex;
    flex-direction: column;
  }

  .menu-body a {
    margin: 10px 0;
  }

  .menu-btn {
    display: none;
    cursor: pointer;
    width: 24px;
    height: 24px;
  }

  #logo {
    display: flex;
    align-items: center;
  }

  #logo > a {
    margin-left: 15px;
  }

  @media only screen and (max-width: 700px) {
    .nav {
      padding: 0 15px;
    }

    .links {
      display: none;
    }

    .link {
      margin: 10px 0;
    }

    .menu-btn {
      display: block;
    }

    .menu-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
</style>
