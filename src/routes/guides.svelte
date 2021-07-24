<script context="module" lang="ts">
  import * as data from '$lib/articles.json';

  interface Article {
    text: string;
    desc: string;
    url: string;
    media: string;
    date: Date;
    tags: string[];
  }

  const createArticle = (article: Partial<Article & { date: string }> = {}): Article => {
    return {
      text: '',
      desc: '',
      url: '',
      media: '',
      tags: [],
      ...article,
      date: article.date ? new Date(article.date) : new Date(),
    };
  };

  export async function load() {
    const articles = data.articles as any;

    return {
      props: {
        articles: articles.map(createArticle).sort((a, b) => b.date.getTime() - a.date.getTime()),
      },
    };
  }
</script>

<script lang="ts">
  import Nav from '$lib/nav.svelte';
  import Tag from '$lib/tag.svelte';

  const zero = (num: number) => (num < 10 ? `0${num}` : `${num}`);
  const format = (date: Date) => {
    return `${date.getFullYear()}-${zero(date.getMonth() + 1)}-${zero(date.getDate())}`;
  };

  export let articles: Article[];
</script>

<Nav />

<div class="container">
  <div class="view">
    <h1>guides</h1>
    <p>
      I've been compiling a list of guides that help people build and use lua plugins for neovim.
    </p>
    {#each articles as link}
      <div class="article">
        {#if link.media}
          <a href={link.url} target="_blank">
            <img src={link.media} alt={link.text} class="media" />
          </a>
        {/if}
        <div class="article-header">
          <h2>
            <a href={link.url} target="_blank">{link.text}</a>
          </h2>
          <small class="date">{format(link.date)}</small>
          <div class="tags">
            {#each link.tags as tag}
              <Tag tag={{ id: tag, count: 1 }} showCount={false} />
            {/each}
          </div>
        </div>
        {#if link.desc}{link.desc}{/if}
      </div>
    {/each}
  </div>
</div>

<svelte:head>
  <title>neovim craft - guides</title>
  <meta
    name="description"
    content="Curated guides to help you configure neovim and build plugins"
  />
  <meta
    property="og:description"
    content="Curated guides to help you configure neovim and build plugins"
  />
  <meta property="og:title" content="neovim craft - plugin guides" />
</svelte:head>

<style>
  .container {
    padding: 0 15px;
    display: flex;
    justify-content: center;
  }

  .view {
    width: 600px;
  }

  .article-header {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
  }

  .article {
    display: flex;
    flex-direction: column;
    margin: 15px 0;
    padding: 15px;
    border: 1px solid var(--primary-color);
  }

  .media {
    width: 100%;
    max-width: 580px;
    height: auto;
  }
</style>
