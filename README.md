# neovimcraft.com

A site dedicated to finding the best neovim plugins and other resources for
building neovim plugins

## Want to submit a plugin?

If you'd like to suggest a plugin to add to `neovimcraft` then feel free to
open a github issue or submit a PR after running the following command:

```bash
yarn resource
```

This command will step through the requirements for adding a resource to the
site.

## Developing

You need to add a couple environment variables related to using the github api:

```
export GITHUB_ACCESS_TOKEN='xxx'
export GITHUB_USERNAME='my-user'
```

To run the scraper

```bash
yarn scrape
```

This will fetch data from remote sources and then save them to our
`resources.json` file. This file is our source-of-truth for the plugins we
eventually save.

To fetch and process the results in our `results.json` file

```bash
yarn process
```

This will use the github api to fetch information about the resources and also
fetch the associated readme for each resource and save them to `db.json` and
`markdown.json`

To only process missing resources:

```bash
yarn process missing
```

To convert markdown files to html

```bash
yarn html
```

This will create an `html.json` file which contains the readme html which we
use for each plugin page.

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
