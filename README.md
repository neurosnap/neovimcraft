# neovim-awesome

A site dedicated to finding the best neovim plugins.

## Developing

You need to add a couple environment variables related to using the github api:

```
export GITHUB_ACCESS_TOKEN='xxx'
export GITHUB_USERNAME='my-user'
```

To run the scraper

```bash
yarn process
```

To convert markdown files to html

```bash
yarn transform
```

Once you've created a project and installed dependencies with `yarn`, start a development server:

```bash
yarn dev
```

## Building

Before creating a production version of your app, install an [adapter](https://kit.svelte.dev/docs#adapters) for your target environment. Then:

```bash
yarn build
```

> You can preview the built app with `yarn preview`, regardless of whether you installed an adapter. This should _not_ be used to serve your app in production.

## Deploy

```bash
yarn deploy
```
