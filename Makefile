PROJECT="neovimcraft-$(shell date +%s)"

dev:
	deno run --allow-read --allow-net src/dev.ts
.PHONY: dev

resource:
	deno run --allow-write src/scripts/resource.ts
.PHONY: resource

resource-config:
	deno run --allow-write src/scripts/resource.ts config
.PHONY: resource-config

download-config:
	deno run --allow-env --allow-write --allow-net src/scripts/scrape-config.ts
.PHONY: download-config

download: download-config
	deno run --allow-write --allow-net src/scripts/scrape.ts
.PHONY: download

patch:
	deno run --allow-write src/scripts/patch.ts
.PHONY: patch

process:
	deno run --allow-write --allow-env --allow-net src/scripts/process.ts
.PHONY: process

missing:
	deno run --allow-write --allow-env --allow-net --allow-read src/scripts/process.ts missing
.PHONY: missing

html:
	deno run --allow-write --allow-read src/scripts/html.ts
.PHONY: html

scrape: download patch process html
.PHONY: scrape

clean:
	rm -rf ./public
	mkdir ./public
.PHONY: clean

build: clean
	deno run --allow-write src/scripts/static.ts
	cp ./data/db.json ./public/db.json
	cp -r ./static/* ./public
.PHONY: build

upload:
	rsync -rv ./public/ pgs.sh:/$(PROJECT)
	ssh pgs.sh neovimcraft --to $(PROJECT) --write
	ssh pgs.sh retain neovimcraft- -n 1 --write
.PHONY: upload

deploy: scrape build upload
.PHONY: deploy

fmt:
	deno fmt
.PHONY: format

test:
	deno lint
.PHONY: test

config: download-config process html
.PHONY: configs
