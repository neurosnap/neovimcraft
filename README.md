# [neovimcraft.com](https://neovimcraft.com)

A site dedicated to finding the best neovim plugins.

## Requirements

- deno

## Want to submit a plugin?

There are a couple of ways to add plugins to `neovimcraft`. Probably the
simplest way would be to get your plugin added to
[awesome-neovim](https://github.com/rockerBOO/awesome-neovim). We scrape that
repo and is the primary data source for the plugin directory.

If you'd like to suggest a plugin to `neovimcraft` directly then feel free to
open a github issue or submit a PR after running the following command:

```bash
make resource
```

This command will step through the requirements for adding a resource to the
site.

## Want to submit a config?

If you'd like to suggest a config to add to `neovimcraft.com/c` then feel free
to submit a PR after running the following command:

```bash
make resource-config
```

This command will step through the requirements for adding a resource to the
site.

## nvim.sh

Want to query neovimcraft from the terminal?

```bash
curl https://nvim.sh
```

https://github.com/neurosnap/nvim.sh

## Developing

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
