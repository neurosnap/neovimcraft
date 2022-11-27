dev:
	deno run --allow-read --allow-net dev.ts
.PHONY: dev

resource:
	deno run --allow-write scripts/resource.ts
.PHONY: resource

scrape:
	deno run --allow-write --allow-net scripts/scrape.ts
	deno run --allow-write scripts/patch.ts
	deno run --allow-write --allow-env --allow-net scripts/process.ts
	deno run --allow-write --allow-read scripts/html.ts
.PHONY: scrape

clean:
	rm -f static/*.html
	rm -rf static/plugin
	rm -rf static/about
	rm -rf static/created
	rm -rf static/updated
.PHONY: clean

build: clean
	deno run --allow-write scripts/static.ts
.PHONY: build

upload:
	gsutil -m rm -r gs://neovimcraft.com/*
	gsutil -m -h 'Cache-Control:private, max-age=0, no-transform' rsync -r ./static gs://neovimcraft.com
	gsutil -m -h 'Cache-Control:private, max-age=0, no-transform' cp ./data/db.json gs://neovimcraft.com/db.json
.PHONY: upload

deploy: scrape build upload
.PHONY: deploy
