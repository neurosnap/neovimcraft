<script lang="ts">
  import Nav from '$lib/nav.svelte';
</script>

<Nav />

<div class="container">
  <div class="view">
    <div class="intro">
      <div class="blurb">
        <h1>Hey all!</h1>
        <p>
          My name is <strong>Eric Bower</strong> and I built this site because neovim is awesome and
          I want to provide resources for searching an building neovim plugins.
        </p>
      </div>
      <img class="profile" src="/me.jpg" alt="Eric Bower" />
    </div>
    <div>
      <p>
        I&apos;m a professional software engineer who has been programming since I was 13 years old.
        I love building software as much as I love building something that people find useful. Most
        of my time is devoted to growing my ability to build products.
      </p>
      <p>
        I also care deeply about open-source code and have an active{' '}
        <a href="https://github.com/neurosnap" target="_blank">Github</a>
        , check it out if you&apos;re interested. I also write{' '}
        <a href="https://erock.io" target="_blank">blog articles about software</a>.
      </p>
      <p>
        I&apos;m happy to read feedback about neovim craft so please feel free to{' '}
        <a href="mailto:neovimcraft@erock.io" target="_blank">email me</a>.
      </p>
    </div>
    <div>
      <h2>FAQ</h2>
      <p>Do you have questions not answered here? Email me!</p>
      <h3>Where do we get our content from?</h3>
      <p>
        As of right now, most of our data is scraped from github. You can find our scrape script
        <a
          href="https://github.com/neurosnap/neovimcraft/blob/main/scripts/scrape.ts"
          target="_blank">here</a
        >.
      </p>
      <h3>How can I submit a plugin or resource to this project?</h3>
      <p>
        The easiest way is to submit a PR that adds the resource to our
        <a
          href="https://github.com/neurosnap/neovimcraft/blob/main/src/lib/resources.json"
          target="_blank">resources.json file</a
        >.
      </p>
    </div>
  </div>
</div>

<svelte:head>
  <title>neovim craft - about</title>
  <meta name="description" content="About neovim craft" />
  <meta property="og:description" content="About neovim craft" />
  <meta property="og:title" content="neovim craft - about" />
</svelte:head>

<style>
  .container {
    display: flex;
    justify-content: center;
  }

  .view {
    width: 600px;
  }

  .intro {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
  }

  .blurb {
    margin-right: 8px;
  }

  .profile {
    border-radius: 9999px;
    width: 200px;
    height: 200px;
  }

  @media only screen and (max-width: 700px) {
    .container {
      padding: 0 15px;
    }
  }
</style>
