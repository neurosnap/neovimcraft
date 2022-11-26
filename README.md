# [neovimcraft.com](https://neovimcraft.com)

A site dedicated to finding the best neovim plugins.

## Requirements

- deno 

## Want to submit a plugin?

If you'd like to suggest a plugin to add to `neovimcraft` then feel free to open
a github issue or submit a PR after running the following command:

```bash
make resource
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
