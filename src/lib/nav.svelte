<script lang="ts">
  import Icon from '$lib/icon.svelte';
</script>

<div class="nav">
  <h1 id="logo">
    neovim craft
    <a href="https://github.com/neurosnap/neovimcraft" target="_blank">
      <Icon icon="github" />
    </a>
  </h1>
  <div class="links">
    <a href="/">plugins</a>
    <a href="/about">about</a>
  </div>
</div>

<style>
.nav {
  display: grid;
  grid-template-columns: minmax(250px, 400px) minmax(350px, 600px);
  grid-template-rows: 50px 1fr;
  align-items: center;
  padding: 0 10px 0 10px;
}

.links {
  grid-column: 2;
  grid-row: 1;
}

#logo {
  display: flex;
  align-items: center;
  grid-column: 1;
  grid-row: 1;
}

#logo > a {
  margin-left: 15px;
}
</style>
