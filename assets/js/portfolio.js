(function () {
	var phrases = ["data engineer", "programmer", "time-pass chef"];
	var role = document.getElementById("role");
	var index = 0;
	var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

	function typePhrase(text, done) {
		var i = 0;
		role.textContent = "";
		var timer = window.setInterval(function () {
			role.textContent = text.slice(0, i + 1);
			i += 1;
			if (i >= text.length) {
				window.clearInterval(timer);
				window.setTimeout(done, 1100);
			}
		}, 55);
	}

	function erase(done) {
		var timer = window.setInterval(function () {
			var current = role.textContent;
			role.textContent = current.slice(0, -1);
			if (!role.textContent) {
				window.clearInterval(timer);
				done();
			}
		}, 32);
	}

	function loop() {
		typePhrase(phrases[index], function () {
			erase(function () {
				index = (index + 1) % phrases.length;
				loop();
			});
		});
	}

	if (role && !reduced) {
		loop();
	}

	var nav = document.querySelector("[data-nav]");
	var menu = document.querySelector(".menu");
	var links = document.getElementById("site-nav");

	function onScroll() {
		if (!nav) return;
		nav.classList.toggle("is-stuck", window.scrollY > 8);
	}

	onScroll();
	window.addEventListener("scroll", onScroll, { passive: true });

	if (menu && links) {
		menu.addEventListener("click", function () {
			var open = links.classList.toggle("is-open");
			menu.setAttribute("aria-expanded", open ? "true" : "false");
			document.body.classList.toggle("nav-open", open);
		});

		links.addEventListener("click", function (event) {
			if (event.target.closest("a")) {
				links.classList.remove("is-open");
				menu.setAttribute("aria-expanded", "false");
				document.body.classList.remove("nav-open");
			}
		});
	}

	var form = document.getElementById("note-form");
	if (form) {
		form.addEventListener("submit", function (event) {
			event.preventDefault();
			var data = new FormData(form);
			var name = String(data.get("name") || "").trim();
			var email = String(data.get("email") || "").trim();
			var message = String(data.get("message") || "").trim();
			var body = "Name: " + name + "\nEmail: " + email + "\n\n" + message;
			var url = "mailto:abhijitkumar39@gmail.com?subject=" +
				encodeURIComponent("Portfolio note from " + name) +
				"&body=" + encodeURIComponent(body);
			window.location.href = url;
		});
	}
})();
