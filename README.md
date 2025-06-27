# [neovimcraft.com](https://neovimcraft.com)

A site dedicated to finding the best neovim plugins.

## Want to submit a plugin?

Submit the plugin to
[awesome-neovim](https://github.com/rockerBOO/awesome-neovim). We scrape that
repo and is the primary data source for the plugin directory.

## nvim.sh

Want to query neovimcraft from the terminal?

```bash
curl https://nvim.sh
```

https://github.com/neurosnap/nvim.sh

## Developing

neovimcraft is a static site.  We use `deno` for static site generation.

You need to add a couple environment variables related to using the github api:

```bash
export GITHUB_ACCESS_TOKEN='xxx'
export GITHUB_USERNAME='my-user'
```

To scrape and process all plugins, run:

```bash
make scrape
```

To build the static site, run:

```bash
make build
```
