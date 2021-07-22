<script lang="ts">
  import Nav from '$lib/nav.svelte';
  import Tag from '$lib/tag.svelte';

  interface Article {
    text: string;
    desc: string;
    url: string;
    media: string;
    date: Date;
    tags: string[];
  }

  const zero = (num: number) => (num < 10 ? `0${num}` : `${num}`);
  const format = (date: Date) => {
    return `${date.getFullYear()}-${zero(date.getMonth())}-${zero(date.getDate())}`;
  };

  const createArticle = (article: Partial<Article> = {}): Article => {
    return {
      text: '',
      desc: '',
      url: '',
      media: '',
      tags: [],
      date: new Date(),
      ...article,
    };
  };

  const links = [
    createArticle({
      text: 'nvim lua guide',
      url: 'https://github.com/nanotee/nvim-lua-guide',
      desc: 'A guide to using Lua in Neovim',
      tags: ['meta'],
      media:
        'https://opengraph.githubassets.com/bf01b0af4a6d4814fae6c35808e0d542bee8ce8b4449d2b64f2b40f4efc81562/nanotee/nvim-lua-guide',
    }),
    createArticle({
      text: 'What is the benefit of writing plugins in lua?',
      url:
        'https://www.reddit.com/r/neovim/comments/mg5ip7/what_is_the_benefit_of_writing_plugins_in_lua',
      desc:
        "I hear that Lua is a first-class language for neovim but I'm not really sure what that means. Can someone explain what neovim-specific benefits there are to writing your plugin in Lua?",
      date: new Date('2021-03-21'),
      tags: ['plugins'],
    }),
    createArticle({
      text: 'How to write neovim plugins in lua',
      url: 'https://www.2n.pl/blog/how-to-write-neovim-plugins-in-lua',
      media: 'https://www.2n.pl/system/blog_posts/photos/000/000/019/original/whid.png?1617885408',
      date: new Date('2021-05-02'),
      tags: ['plugins'],
      desc:
        "One of goals which neovim devs set for themselves, was making lua the first-class scripting language alternative to viml. Since version 0.4 its' interpreter along with 'stdlib' have been already built into the editor.",
    }),
    createArticle({
      text: 'From init.vim to init.lua',
      url: 'https://teukka.tech/luanvim.html',
      tags: ['config'],
      desc:
        'I want to illustrate the process of learning how to take advantage of the powerful scripting capabilities that are available in the Neovim runtime.',
      date: new Date('2021-07-22'),
    }),
    createArticle({
      text: 'How to make UI for neovim plugins in Lua',
      url: 'https://dev.to/2nit/how-to-make-ui-for-neovim-plugins-in-lua-3b6e',
      tags: ['plugins'],
      desc:
        "Let's create a simple plugin that will show us last opened files in handy side navigation.",
      media:
        'https://res.cloudinary.com/practicaldev/image/fetch/s--AqStf1TN--/c_imagga_scale,f_auto,fl_progressive,h_420,q_auto,w_1000/https://dev-to-uploads.s3.amazonaws.com/i/p1vusfl4dhivlv7hb559.png',
    }),
    createArticle({
      text: 'Neovim 0.5 features and the switch to init.lua',
      url: 'https://oroques.dev/notes/neovim-init',
      tags: ['config'],
      desc:
        'This post will help you write a very basic init.lua which include all these new features.',
      media: 'https://raw.githubusercontent.com/ojroques/nvim-lspfuzzy/main/demo.gif',
      date: new Date('2021-07-18'),
    }),
    createArticle({
      text: 'Learn Lua in Y minutes',
      url: 'https://learnxinyminutes.com/docs/lua/',
      tags: ['learn'],
      desc: 'A brief introduction into the lua programming language',
      date: new Date('2021-07-22'),
    }),
    createArticle({
      text: 'Learn lua quick guide',
      tags: ['learn'],
      url: 'https://github.com/medwatt/Notes/blob/main/Lua/Lua_Quick_Guide.ipynb',
      media:
        'https://opengraph.githubassets.com/6c6bc0166cc8b9679b671ca24b9a16329977677ef1130f81d939a14e22fc9a9e/medwatt/Notes',
      desc: 'This guide is also a good resource for getting started quickly',
      date: new Date('2021-07-22'),
    }),
    createArticle({
      text: 'Lua interactive tutorial',
      tags: ['learn'],
      url: 'https://www.luascript.dev/learn',
      desc: 'New to lua?  Start with us and learn!',
      date: new Date('2021-07-22'),
      media: '/lua-script.png',
    }),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
</script>

<Nav />

<div class="container">
  <div class="view">
    <h1>guides</h1>
    <p>
      I've been compiling a list of guides that help people build and use lua plugins for neovim.
    </p>
    {#each links as link}
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

<style>
  :global(body) {
    overflow-y: auto;
  }

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
