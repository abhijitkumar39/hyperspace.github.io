(function () {
	var phrases = ["data engineer", "pipeline lead", "moving into AI"];
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

	function selectTab(tabs, selected) {
		tabs.forEach(function (tab) {
			var on = tab === selected;
			tab.setAttribute("aria-selected", on ? "true" : "false");
			var panelId = tab.getAttribute("aria-controls");
			if (!panelId) return;
			var panel = document.getElementById(panelId);
			if (panel) panel.hidden = !on;
		});
	}

	document.querySelectorAll("[data-switcher]").forEach(function (root) {
		var tabs = Array.prototype.slice.call(root.querySelectorAll("[role='tab']"));
		tabs.forEach(function (tab) {
			tab.addEventListener("click", function () { selectTab(tabs, tab); });
		});
	});

	var notes = {
		shell: ["Shell · fuel", "Scheduled spider for station and price pages. Rotating proxies when the site pushed back. Raw pull into MongoDB, then ETL into the gas feed."],
		chevron: ["Chevron · fuel", "Same fuel lane as Shell: prices and stations, on a schedule, through proxies, into MongoDB before the clean job."],
		exxon: ["Exxon · fuel", "Pump prices and station coverage. Scrapyd ran the job. The raw documents stayed in MongoDB until ETL."],
		bp: ["BP · fuel", "Collected with the other fuel spiders. Proxies in front, MongoDB underneath, a later job for the feed the API served."],
		seven: ["7-Eleven · fuel", "Convenience-and-fuel locations, pulled on a schedule and folded into the same gas store as the major brands."],
		marathon: ["Marathon · fuel", "Another fuel spider in that tree. Same path: proxy, MongoDB, then the transform."],
		spothero: ["SpotHero · parking", "Airport and city inventory. Availability is what the product sells, so the spider had to keep coming back."],
		parkwhiz: ["ParkWhiz · parking", "A second parking inventory, collected beside SpotHero and normalized into the same parking store."],
		parkopedia: ["Parkopedia · parking", "Broader parking coverage. Raw pages landed in MongoDB, then ETL picked the fields the app could show."],
		plugshare: ["PlugShare · charging", "Charger locations for the EV side of the same driver app. Collected, stored, then cleaned."],
		lennar: ["Lennar · homes", "New-home inventory from a national builder. Listing pages in, structured lots and communities out."],
		horton: ["D.R. Horton · homes", "Same homebuilder lane as Lennar. Scheduled collect, raw store, then a clean table."],
		pulte: ["Pulte · homes", "Community and home listings. One spider in a set that also covered Toll Brothers and KB Home."],
		toll: ["Toll Brothers · homes", "Luxury-builder listings, collected with the other national builders in that tree."],
		kb: ["KB Home · homes", "Floor plans and communities. Same pattern as the other builder spiders."],
		indeed: ["Indeed · jobs", "Job-board listings. Text-heavy pages, useful later as labeled labor-market text, stored raw first."],
		glassdoor: ["Glassdoor · jobs", "Listings and company pages beside Indeed. Proxies mattered here. The site does not like a naked datacenter."],
		linkedin: ["LinkedIn · jobs", "Job links and listing pages from the jobs tree. Collected carefully, stored, then shaped downstream."],
		zip: ["ZipRecruiter · jobs", "Another board in the jobs set. Same collect, store, transform path."],
		monster: ["Monster · jobs", "Older board, still in the tree. Listings landed in the same raw store as the other boards."],
		dice: ["Dice · jobs", "Tech-leaning listings. Collected with Indeed, Glassdoor, and the rest of that set."]
	};

	var steps = {
		spiders: ["Spiders", "One Scrapy project per site, kicked off by Scrapyd. A fuel brand, a parking app, or a builder each had its own job."],
		proxies: ["Proxies", "Rotating proxies sat in front of the spiders. When a site started rejecting the datacenter, the pool kept the schedule alive."],
		store: ["Store", "Raw pulls went into MongoDB. A later ETL job picked the fields, typed them, and left a table the API could serve."],
		watch: ["Watch", "A dashboard showed success rate, the error pattern, and how far behind a spider had fallen, so a dead source did not sit unnoticed."]
	};

	var board = document.querySelector("[data-board]");
	if (board) {
		var laneTabs = Array.prototype.slice.call(board.querySelectorAll(".lane-tabs [role='tab']"));
		var panels = Array.prototype.slice.call(board.querySelectorAll("[data-lane-panel]"));
		var kicker = document.getElementById("dock-kicker");
		var copy = document.getElementById("dock-copy");
		var stepTabs = Array.prototype.slice.call(board.querySelectorAll(".steps [data-step]"));

		function showLane(name) {
			laneTabs.forEach(function (tab) {
				tab.setAttribute("aria-selected", tab.getAttribute("data-lane") === name ? "true" : "false");
			});
			panels.forEach(function (panel) {
				panel.hidden = panel.getAttribute("data-lane-panel") !== name;
			});
			if (name === "ai") {
				kicker.textContent = "Why this matters for AI";
				copy.textContent = "Repeated, timestamped, place-tied rows. Prices, open bays, listings that change. That is the input an applied-AI role starts from. The public model work is the Telegram bot on a local Ollama model.";
			}
		}

		function showBrand(key) {
			var note = notes[key];
			if (!note) return;
			board.querySelectorAll(".brand-grid button").forEach(function (button) {
				button.setAttribute("aria-selected", button.getAttribute("data-brand") === key ? "true" : "false");
			});
			stepTabs.forEach(function (tab) { tab.setAttribute("aria-selected", "false"); });
			kicker.textContent = note[0];
			copy.textContent = note[1];
		}

		laneTabs.forEach(function (tab) {
			tab.addEventListener("click", function () { showLane(tab.getAttribute("data-lane")); });
		});
		board.querySelectorAll(".brand-grid button").forEach(function (button) {
			button.addEventListener("click", function () { showBrand(button.getAttribute("data-brand")); });
		});
		stepTabs.forEach(function (tab) {
			tab.addEventListener("click", function () {
				var note = steps[tab.getAttribute("data-step")];
				stepTabs.forEach(function (other) {
					other.setAttribute("aria-selected", other === tab ? "true" : "false");
				});
				board.querySelectorAll(".brand-grid button").forEach(function (button) {
					button.setAttribute("aria-selected", "false");
				});
				kicker.textContent = note[0];
				copy.textContent = note[1];
			});
		});
		showBrand("shell");
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
