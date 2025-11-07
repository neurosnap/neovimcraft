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

function nav() {
	const menuBtnEl = must("#menu-btn");
	const menuCloseEl = mustAll(".menu-close");
	menuBtnEl.addEventListener("click", () => {
		menu.classList.remove("hidden");
	});
	menuCloseEl.forEach((el) => {
		el.addEventListener("click", () => {
			menu.classList.add("hidden");
		});
	});
}

document.addEventListener("DOMContentLoaded", nav);
