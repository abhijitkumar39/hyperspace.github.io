(function () {
	var phrases = ["data engineer", "pipeline lead", "applied AI"];
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
		shell: ["Shell · fuel", "Station pages and pump prices, on a schedule. Rotating proxies when the site pushed back. Raw documents in MongoDB, then a clean gas table. Those timestamped prices were part of what the in-house model trained on."],
		chevron: ["Chevron · fuel", "Prices and stations beside Shell. Same schedule, same proxy pool, same MongoDB landing. The model later saw Chevron the way a driver would: a price, a place, a time."],
		exxon: ["Exxon · fuel", "Pump prices and station coverage. Scrapyd ran the job. ETL typed the fields the API served, and those rows joined the fuel corpus."],
		bp: ["BP · fuel", "Collected with the other fuel spiders. Proxies in front, MongoDB underneath, then the feed the product and the model both read."],
		seven: ["7-Eleven · fuel", "Convenience-and-fuel locations, pulled on a schedule and folded into the same gas store as the majors. More places for the model to know by name."],
		marathon: ["Marathon · fuel", "Another fuel spider in that tree. Proxy, MongoDB, transform. The clean rows sat next to Shell and Chevron in the training set."],
		spothero: ["SpotHero · parking", "Airport and city inventory. Availability is what the product sells, so the spider kept coming back. Open bays, with a time on them, were how the model learned parking."],
		parkwhiz: ["ParkWhiz · parking", "A second parking inventory, collected beside SpotHero and normalized into the same store. Two sources, one idea of an open spot."],
		parkopedia: ["Parkopedia · parking", "Broader coverage. Raw pages in MongoDB, then the fields the app could show. That wider map filled gaps the other two parking spiders missed."],
		plugshare: ["PlugShare · charging", "Charger locations for the EV side of the same driver app. Collected, stored, cleaned, and available to the same model that knew the gas prices."],
		lennar: ["Lennar · homes", "New-home inventory from a national builder. Listing pages in, communities and lots out. Listing text that changed was useful language, not just a price."],
		horton: ["D.R. Horton · homes", "Same builder lane as Lennar. Scheduled collect, raw store, clean table. The model could tell Horton inventory from Lennar because the rows were kept apart."],
		pulte: ["Pulte · homes", "Community and home listings, in a set that also covered Toll Brothers and KB Home. Each builder kept its own spider and its own voice in the corpus."],
		toll: ["Toll Brothers · homes", "Luxury-builder listings, collected with the other nationals. Price, plan, and community name, typed, then available downstream."],
		kb: ["KB Home · homes", "Floor plans and communities. Same pattern as the other builder spiders, and the same ending: a clean row the model could cite."],
		indeed: ["Indeed · jobs", "Job-board listings. Text-heavy pages, stored raw first, then shaped into posts with a title, a place, and a company. That language was part of the training text."],
		glassdoor: ["Glassdoor · jobs", "Listings and company pages beside Indeed. Proxies mattered. The site does not like a naked datacenter. Cleaned posts joined the jobs corpus."],
		linkedin: ["LinkedIn · jobs", "Job links and listing pages, collected carefully and stored before anything was asked of them. Downstream, they were structured posts, not a scrape dump."],
		zip: ["ZipRecruiter · jobs", "Another board in the jobs set. Collect, store, transform. A second wording of the same role is how a model learns the job, not just the title."],
		monster: ["Monster · jobs", "Older board, still in the tree. Listings landed in the same raw store, then the same clean shape as Indeed and Glassdoor."],
		dice: ["Dice · jobs", "Tech-leaning listings, collected with the rest of that set. Narrower language, useful when the question was about engineering roles."]
	};

	var steps = {
		spiders: ["Spiders", "One Scrapy project per site, kicked off by Scrapyd. A fuel brand, a parking app, a builder, or a job board each had its own job, on a schedule."],
		proxies: ["Proxies", "Rotating proxies sat in front of the spiders. When a site started rejecting the datacenter, the pool kept the schedule alive so the corpus did not go stale."],
		store: ["Store", "Raw pulls went into MongoDB. A later ETL job picked the fields, typed them, and left prices, places, and listing text an API could serve."],
		watch: ["Watch", "A dashboard showed success rate, the error pattern, and how far behind a spider had fallen. A dead source would have quietly poisoned the model."],
		model: ["Model", "After the clean job, those rows were the training set. Pump prices through the day, bays that were still open, listings that changed. The in-house LLM answered from that store, not from a generic crawl."]
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
				stepTabs.forEach(function (tab) { tab.setAttribute("aria-selected", "false"); });
				board.querySelectorAll(".brand-grid button").forEach(function (button) {
					button.setAttribute("aria-selected", "false");
				});
				kicker.textContent = "What the model actually learned";
				copy.textContent = "Not a generic crawl. Our tables: a price at a time, an open bay, a listing that changed. The in-house LLM answered from that store. The public cousin is the Telegram bot on a local Ollama model.";
				return;
			}
			var panel = panels.filter(function (item) {
				return item.getAttribute("data-lane-panel") === name;
			})[0];
			var first = panel && panel.querySelector("button[data-brand]");
			if (first) showBrand(first.getAttribute("data-brand"));
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
