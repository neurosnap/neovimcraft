PROJECT="neovimcraft-$(shell date +%s)"

dev:
	bun run src/dev.ts
.PHONY: dev

resource:
	bun run src/scripts/resource.ts
.PHONY: resource

resource-config:
	bun run src/scripts/resource.ts config
.PHONY: resource-config

download-config:
	bun run src/scripts/scrape-config.ts
.PHONY: download-config

download: download-config
	bun run src/scripts/scrape.ts
.PHONY: download

patch:
	bun run src/scripts/patch.ts
.PHONY: patch

process:
	bun run src/scripts/process.ts
.PHONY: process

missing:
	bun run src/scripts/process.ts missing
.PHONY: missing

html:
	bun run src/scripts/html.ts
.PHONY: html

scrape: download patch process html
.PHONY: scrape

clean:
	rm -rf ./public
	mkdir ./public
.PHONY: clean

build: clean
	bun run src/scripts/static.ts
	cp ./data/db.json ./public/db.json
	cp -r ./static/* ./public
.PHONY: build

upload:
	rsync ./public/_pgs_ignore pgs.sh:/$(PROJECT)/_pgs_ignore
	rsync -rv ./public/ pgs.sh:/$(PROJECT)
	ssh pgs.sh link neovimcraft --to $(PROJECT) --write
	ssh pgs.sh retain neovimcraft- -n 1 --write
.PHONY: upload

deploy: scrape build upload
.PHONY: deploy

fmt:
	bun run biome format --write
.PHONY: format

test:
	bun run biome lint
.PHONY: test

config: download-config process html
.PHONY: configs
