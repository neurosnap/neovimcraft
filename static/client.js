function addUrlParam(key, value) {
	if (history.pushState) {
		const searchParams = new URLSearchParams(window.location.search);
		searchParams.set(key, value);
		const newurl =
			window.location.protocol +
			"//" +
			window.location.host +
			window.location.pathname +
			"?" +
			searchParams.toString();
		window.history.pushState({ path: newurl }, "", newurl);
	}
}

function rmUrlParam(key) {
	const url = window.location.href;
	const r = new URL(url);
	r.searchParams.delete(key);
	const newUrl = r.href;
	window.history.pushState({ path: newUrl }, "", newUrl);
}

function getUrlParam(key) {
	const url = window.location.href;
	const r = new URL(url);
	return r.searchParams.get(key);
}

function createFilter(pluginsEl) {
	function filter(value) {
		function each(el) {
			if (!value) {
				el.classList.remove("hidden");
				return;
			}
			const search = value.toLocaleLowerCase();
			const username = el.dataset.username;
			const repo = el.dataset.repo;
			const desc = el.dataset.desc || "";
			const tags = el.dataset.tags.split(",");

			let hasTags = false;
			if (search.includes("tag:")) {
				const nextSearch = search.replace("tag:", "");
				hasTags = tags.some((tag) => tag === nextSearch);
			}

			const showEl =
				username.includes(search) ||
				repo.includes(search) ||
				desc.includes(search) ||
				hasTags;

			if (showEl) {
				el.classList.remove("hidden");
			} else {
				el.classList.add("hidden");
			}
		}

		pluginsEl.forEach(each);
	}

	return filter;
}

function updateLinks(search) {
	const links = must("#sort_links");
	for (const link of links.children) {
		const r = new URL(link.href);
		if (search) {
			r.searchParams.set("search", search);
		} else {
			r.searchParams.delete("search");
		}
		const newUrl = r.href;
		link.href = newUrl;
	}
}

function must(pattern) {
	const el = document.querySelector(pattern);
	if (!el) {
		throw new Error(`${pattern} not found`);
	}
	return el;
}

function mustAll(pattern) {
	const el = document.querySelectorAll(pattern);
	if (!el) {
		throw new Error(`${pattern} not found`);
	}
	return el;
}

function debounce(fn, delay) {
	let timeoutID;
	return (...args) => {
		if (timeoutID) {
			clearTimeout(timeoutID);
		}
		timeoutID = setTimeout(() => {
			fn(...args);
		}, delay);
	};
}

function init() {
	const searchEl = must("#search");
	const clearSearchEl = must("#search_clear");
	const pluginsEl = mustAll(".plugin");
	const tagsEl = mustAll(".tag");

	const urlParam = getUrlParam("search");
	searchEl.value = urlParam;
	const filter = createFilter(pluginsEl);

	const search = (value) => {
		if (value) {
			addUrlParam("search", value);
			updateLinks(value);
		} else {
			rmUrlParam("search");
			updateLinks("");
		}

		filter(value);
	};

	const debouncedSearch = debounce((ev) => {
		const value = ev.target.value;
		search(value);
	}, 150);

	searchEl.addEventListener("input", debouncedSearch);

	clearSearchEl.addEventListener("click", () => {
		searchEl.value = "";
		rmUrlParam("search");
		updateLinks("");
		filter("");
	});

	tagsEl.forEach((tagEl) => {
		tagEl.addEventListener("click", (el) => {
			const id = el.target.dataset.id;
			if (!id) return;
			const value = `tag:${id}`;
			searchEl.value = value;
			search(value);
		});
	});
	filter(searchEl.value);
}

document.addEventListener("DOMContentLoaded", init);
