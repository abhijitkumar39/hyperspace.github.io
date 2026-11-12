(function () {
	var phrases = ["backend", "chatbot", "live bookings"];
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

	document.querySelectorAll('a[href="#tab-mine"]').forEach(function (link) {
		link.addEventListener("click", function () {
			var tab = document.getElementById("tab-mine");
			if (tab) tab.click();
		});
	});

	document.querySelectorAll("[data-switcher]").forEach(function (root) {
		var tabs = Array.prototype.slice.call(root.querySelectorAll("[role='tab']"));
		tabs.forEach(function (tab) {
			tab.addEventListener("click", function () { selectTab(tabs, tab); });
		});
	});

	var notes = {
		fuel: ["Fuel", "Pump prices and station coverage, on a schedule. Raw pages in MongoDB, then ETL into a typed price and a place. Those rows trained the LLM, and RAG retrieved them later."],
		parking: ["Parking", "Bays and chargers, collected often enough that open still meant open. Cleaned into a place and a time, then available to the same model."],
		homes: ["Homes", "Listing pages in, communities and lots out. Text that changed was language the model could learn, not only a price."],
		jobs: ["Jobs", "Listing text, stored raw first, then a title, a place, and the wording of the role. That corpus sat beside the prices and the places."]
	};

	var steps = {
		spiders: ["Spiders", "Scrapy on a schedule. Fuel, parking, homes, and jobs each had their own job, so one lane could fail without taking the others down."],
		store: ["Store", "Raw pulls went into MongoDB. ETL picked the fields, typed them, and left prices, places, and listing text an API could serve."],
		watch: ["Watch", "A dashboard showed success, the error pattern, and how far behind a job had fallen. A quiet failure would have trained the model on stale rows."],
		model: ["Train", "The clean tables were the training set for our own LLMs. Prices through the day, bays that were still open, listings that changed."],
		rag: ["RAG", "At question time the model retrieved from that store. The answer cited our rows: a price, a place, a listing."]
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
			stepTabs.forEach(function (tab) { tab.setAttribute("aria-selected", "false"); });
			if (name === "ai") {
				kicker.textContent = "What the model learned";
				copy.textContent = "Our tables: a price at a time, an open bay, a listing that changed. RAG retrieved those rows, and the LLM answered from that store.";
				return;
			}
			var note = notes[name];
			if (!note) return;
			kicker.textContent = note[0];
			copy.textContent = note[1];
		}

		laneTabs.forEach(function (tab) {
			tab.addEventListener("click", function () { showLane(tab.getAttribute("data-lane")); });
		});
		stepTabs.forEach(function (tab) {
			tab.addEventListener("click", function () {
				var note = steps[tab.getAttribute("data-step")];
				if (!note) return;
				stepTabs.forEach(function (other) {
					other.setAttribute("aria-selected", other === tab ? "true" : "false");
				});
				panels.forEach(function (panel) { panel.hidden = true; });
				laneTabs.forEach(function (lane) {
					if (lane.getAttribute("data-lane") === "ai") lane.setAttribute("aria-selected", "false");
				});
				kicker.textContent = note[0];
				copy.textContent = note[1];
			});
		});
		showLane("fuel");
	}

	var chat = document.querySelector("[data-chat]");
	if (chat) {
		var log = document.getElementById("chat-log");
		var sourceNodes = chat.querySelectorAll("[data-source]");
		var script = [
			{ who: "guest", text: "Where is the match, and when do I get the tickets?", on: [] },
			{ who: "bot", text: "Kickoff is at the ground on your pass. Tickets land tonight.", on: ["places"] },
			{ who: "guest", text: "Find a flight and a hotel. What is the weather doing?", on: ["places"] },
			{ who: "bot", text: "Clear skies. A hotel twelve minutes out is still open. Flights are live.", on: ["places", "weather", "booking", "serp"] }
		];

		function setSources(names) {
			sourceNodes.forEach(function (node) {
				node.classList.toggle("on", names.indexOf(node.getAttribute("data-source")) !== -1);
			});
		}

		function showLine(line) {
			var bubble = document.createElement("p");
			bubble.className = "bubble " + line.who;
			bubble.textContent = line.text;
			log.appendChild(bubble);
			setSources(line.on);
		}

		if (!reduced) {
			var step = 0;
			function playChat() {
				log.textContent = "";
				setSources([]);
				step = 0;
				var timer = window.setInterval(function () {
					showLine(script[step]);
					step += 1;
					if (step >= script.length) {
						window.clearInterval(timer);
						window.setTimeout(playChat, 2600);
					}
				}, 1100);
			}
			playChat();
		}
	}

	var counter = document.querySelector("[data-count]");
	if (counter && !reduced && "IntersectionObserver" in window) {
		var target = Number(counter.getAttribute("data-count"));
		var started = false;
		var watcher = new IntersectionObserver(function (entries) {
			if (!entries[0].isIntersecting || started) return;
			started = true;
			var begin = performance.now();
			function tick(now) {
				var t = Math.min(1, (now - begin) / 1200);
				var eased = 1 - Math.pow(1 - t, 3);
				counter.textContent = Math.round(target * eased).toLocaleString("en-US");
				if (t < 1) window.requestAnimationFrame(tick);
			}
			counter.textContent = "0";
			window.requestAnimationFrame(tick);
		}, { threshold: 0.6 });
		watcher.observe(counter);
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
