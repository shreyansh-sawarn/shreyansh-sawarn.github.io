/* ============================================================
   cyberpunk × sakura — vanilla JS, no dependencies
   ============================================================ */
(function () {
	'use strict';

	var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* ---------- theme toggle (dark by default) ---------- */
	var themeBtn = document.getElementById('theme-toggle');

	function applyTheme(light) {
		document.body.classList.toggle('light', light);
		if (themeBtn) {
			themeBtn.setAttribute('aria-checked', String(light));
			themeBtn.title = light ? 'Switch to dark mode' : 'Switch to light mode';
		}
	}

	// Dark by default on first visit; remembers the visitor's choice after that
	var savedTheme = null;
	try { savedTheme = localStorage.getItem('theme'); } catch (e) { /* private mode */ }
	applyTheme(savedTheme === 'light');

	if (themeBtn) {
		themeBtn.addEventListener('click', function () {
			var light = !document.body.classList.contains('light');
			applyTheme(light);
			try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch (e) { /* ignore */ }
		});
	}

	/* ---------- typewriter (hero roles) ---------- */
	var roles = [
		'DevOps Engineer',
		'Azure • CI/CD • IaC',
		'SRE & Platform Ops',
		'Terraform • Kubernetes'
	];
	var tw = document.getElementById('typewriter');

	if (tw) {
		if (reducedMotion) {
			tw.textContent = roles[0];
		} else {
			var roleIdx = 0, charIdx = 0, deleting = false;

			(function type() {
				var current = roles[roleIdx];

				if (deleting) {
					charIdx--;
				} else {
					charIdx++;
				}
				tw.textContent = current.slice(0, charIdx);

				var delay = deleting ? 40 : 85;
				if (!deleting && charIdx === current.length) {
					delay = 2200;           // pause at full word
					deleting = true;
					// glitch-zap flourish on the completed word
					tw.classList.add('zap');
					setTimeout(function () { tw.classList.remove('zap'); }, 400);
				} else if (deleting && charIdx === 0) {
					deleting = false;
					roleIdx = (roleIdx + 1) % roles.length;
					delay = 400;
				}
				setTimeout(type, delay);
			})();
		}
	}

	/* ---------- falling sakura petals ---------- */
	var canvas = document.getElementById('sakura');

	if (canvas && !reducedMotion) {
		var ctx = canvas.getContext('2d');
		var petals = [];
		var PETAL_COUNT = Math.min(40, Math.floor(window.innerWidth / 32));

		function resize() {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		}
		resize();
		window.addEventListener('resize', resize);

		function makePetal(initial) {
			return {
				x: Math.random() * canvas.width,
				y: initial ? Math.random() * canvas.height : -20,
				size: 5 + Math.random() * 7,
				speedY: 0.4 + Math.random() * 0.9,
				speedX: 0.3 + Math.random() * 0.7,
				sway: Math.random() * Math.PI * 2,
				swaySpeed: 0.008 + Math.random() * 0.015,
				rot: Math.random() * Math.PI * 2,
				rotSpeed: (Math.random() - 0.5) * 0.02,
				opacity: 0.35 + Math.random() * 0.45,
				hue: Math.random() < 0.85 ? 'pink' : 'cyan' // a few "digital" petals
			};
		}

		for (var i = 0; i < PETAL_COUNT; i++) petals.push(makePetal(true));

		function drawPetal(p) {
			ctx.save();
			ctx.translate(p.x, p.y);
			ctx.rotate(p.rot);
			ctx.globalAlpha = p.opacity;

			var light = document.body.classList.contains('light');
			if (p.hue === 'cyan') {
				ctx.fillStyle = light ? 'rgba(14, 124, 150, 0.75)' : 'rgba(34, 230, 247, 0.9)';
				ctx.shadowColor = light ? 'rgba(14, 124, 150, 0.4)' : 'rgba(34, 230, 247, 0.8)';
			} else {
				ctx.fillStyle = light ? 'rgba(214, 51, 132, 0.65)' : 'rgba(255, 150, 190, 0.9)';
				ctx.shadowColor = light ? 'rgba(214, 51, 132, 0.35)' : 'rgba(255, 122, 178, 0.6)';
			}
			ctx.shadowBlur = light ? 4 : 6;

			// petal shape: two curves meeting in a point
			ctx.beginPath();
			ctx.moveTo(0, -p.size / 2);
			ctx.bezierCurveTo(p.size * 0.7, -p.size * 0.4, p.size * 0.5, p.size * 0.5, 0, p.size / 2);
			ctx.bezierCurveTo(-p.size * 0.5, p.size * 0.5, -p.size * 0.7, -p.size * 0.4, 0, -p.size / 2);
			ctx.fill();
			ctx.restore();
		}

		var hidden = false;
		document.addEventListener('visibilitychange', function () {
			hidden = document.hidden;
		});

		(function animate() {
			requestAnimationFrame(animate);
			if (hidden) return;

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (var i = 0; i < petals.length; i++) {
				var p = petals[i];
				p.sway += p.swaySpeed;
				p.x += Math.sin(p.sway) * 0.8 + p.speedX * 0.3;
				p.y += p.speedY;
				p.rot += p.rotSpeed;

				if (p.y > canvas.height + 20 || p.x > canvas.width + 30) {
					petals[i] = makePetal(false);
				}
				drawPetal(p);
			}
		})();
	}

	/* ---------- scroll reveal ---------- */
	var revealEls = document.querySelectorAll('.reveal');

	if ('IntersectionObserver' in window && !reducedMotion) {
		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				// toggle so reveal animations replay on every scroll in/out
				entry.target.classList.toggle('in', entry.isIntersecting);
			});
		}, { threshold: 0.12 });

		revealEls.forEach(function (el) { observer.observe(el); });
	} else {
		revealEls.forEach(function (el) { el.classList.add('in'); });
	}

	/* ---------- katakana digital rain (left edge) ---------- */
	var rain = document.getElementById('rain');

	if (rain && !reducedMotion) {
		var rctx = rain.getContext('2d');
		var CHARS = 'アカサタナハマヤラワ0123456789シツクニ桜コドイン';
		var FONT = 14, COLS;
		var drops = [];

		function rainResize() {
			rain.width = 150;
			rain.height = window.innerHeight;
			COLS = Math.floor(rain.width / (FONT + 4));
			drops = [];
			for (var i = 0; i < COLS; i++) {
				drops.push({ y: Math.random() * rain.height, speed: 2 + Math.random() * 3 });
			}
		}
		rainResize();
		window.addEventListener('resize', rainResize);

		var rainHidden = false;
		document.addEventListener('visibilitychange', function () { rainHidden = document.hidden; });

		var last = 0;
		(function rainLoop(ts) {
			requestAnimationFrame(rainLoop);
			if (rainHidden || ts - last < 55) return; // ~18fps, chunky matrix feel
			last = ts;

			// fade previous frame (keeps canvas transparent)
			rctx.globalCompositeOperation = 'destination-out';
			rctx.fillStyle = 'rgba(0,0,0,0.12)';
			rctx.fillRect(0, 0, rain.width, rain.height);
			rctx.globalCompositeOperation = 'source-over';

			rctx.font = FONT + 'px "Share Tech Mono", monospace';
			var light = document.body.classList.contains('light');

			for (var i = 0; i < COLS; i++) {
				var d = drops[i];
				var ch = CHARS[Math.floor(Math.random() * CHARS.length)];
				// mostly pink, some cyan heads
				if (Math.random() < 0.18) {
					rctx.fillStyle = light ? 'rgba(14,124,150,0.9)' : 'rgba(34,230,247,0.9)';
				} else {
					rctx.fillStyle = light ? 'rgba(214,51,132,0.85)' : 'rgba(255,122,178,0.85)';
				}
				rctx.fillText(ch, i * (FONT + 4) + 2, d.y);
				d.y += d.speed * 4;
				if (d.y > rain.height + 40) {
					d.y = -20 - Math.random() * 200;
					d.speed = 2 + Math.random() * 3;
				}
			}
		})(0);
	}

	/* ---------- scroll parallax on the sakura branches ---------- */
	var trees = document.querySelectorAll('.sakura-tree');

	if (trees.length && !reducedMotion) {
		var ticking = false;
		window.addEventListener('scroll', function () {
			if (ticking) return;
			ticking = true;
			requestAnimationFrame(function () {
				// branches drift up slightly slower than the page, and fade out
				var y = window.scrollY;
				var shift = y * -0.18;
				var fade = Math.max(0, 1 - y / (window.innerHeight * 1.1));
				trees.forEach(function (el) {
					el.style.translate = '0 ' + shift.toFixed(1) + 'px';
					el.style.opacity = fade.toFixed(2);
				});
				ticking = false;
			});
		}, { passive: true });
	}

	/* ---------- live GitHub stats on project cards ---------- */
	(function () {
		var cards = document.querySelectorAll('.project_card');
		if (!cards.length || !window.fetch) return;

		function timeAgo(iso) {
			var days = Math.floor((Date.now() - new Date(iso)) / 864e5);
			if (days < 1) return 'today';
			if (days < 30) return days + 'd ago';
			if (days < 365) return Math.floor(days / 30) + 'mo ago';
			return Math.floor(days / 365) + 'y ago';
		}

		cards.forEach(function (card) {
			var link = card.querySelector('.project_gh');
			if (!link) return;
			var m = link.href.match(/github\.com\/([^\/]+\/[^\/]+)/);
			if (!m) return;
			var repo = m[1];

			var cached = null;
			try { cached = JSON.parse(sessionStorage.getItem('gh2:' + repo)); } catch (e) { /* ignore */ }

			function commitCount() {
				// per_page=1 → the Link header's last page number = total commits
				return fetch('https://api.github.com/repos/' + repo + '/commits?per_page=1')
					.then(function (r) {
						if (!r.ok) return null;
						var link = r.headers.get('Link') || '';
						var m2 = link.match(/&page=(\d+)>; rel="last"/);
						return m2 ? parseInt(m2[1], 10) : 1;
					}).catch(function () { return null; });
			}

			(cached ? Promise.resolve(cached)
				: fetch('https://api.github.com/repos/' + repo)
					.then(function (r) { return r.ok ? r.json() : null; })
					.then(function (d) {
						if (!d || !d.full_name) return null;
						return commitCount().then(function (c) {
							return { language: d.language, pushed_at: d.pushed_at, commits: c };
						});
					})
			).then(function (d) {
				if (!d) return;
				try { sessionStorage.setItem('gh2:' + repo, JSON.stringify(d)); } catch (e) { /* ignore */ }
				var parts = [d.language || 'code'];
				if (d.commits) parts.push(d.commits + ' commit' + (d.commits === 1 ? '' : 's'));
				parts.push('updated ' + timeAgo(d.pushed_at));
				var meta = document.createElement('p');
				meta.className = 'project_meta';
				meta.innerHTML = parts.join('<span class="sep">·</span>');
				var desc = card.querySelector('.project_desc');
				card.insertBefore(meta, desc);
			}).catch(function () { /* offline / rate-limited: keep static card */ });
		});
	})();

	/* ---------- terminal easter egg ---------- */
	(function () {
		var term = document.getElementById('terminal');
		var out = document.getElementById('term-out');
		var input = document.getElementById('term-input');
		var openBtn = document.getElementById('term-button');
		var closeBtn = document.getElementById('term-close');
		if (!term || !out || !input) return;

		function print(html) {
			out.innerHTML += html + '\n';
			out.scrollTop = out.scrollHeight;
		}

		var COMMANDS = {
			help: function () {
				print('<span class="t-dim">available commands:</span>\n  <span class="t-cmd">about</span>      who am i\n  <span class="t-cmd">skills</span>     core toolbox\n  <span class="t-cmd">projects</span>   things i built\n  <span class="t-cmd">resume</span>     open my resume\n  <span class="t-cmd">contact</span>    reach me\n  <span class="t-cmd">github</span>     open my github\n  <span class="t-cmd">linkedin</span>   open my linkedin\n  <span class="t-cmd">theme</span>      toggle light/dark\n  <span class="t-cmd">clear</span>      clear terminal\n  <span class="t-cmd">exit</span>       close terminal');
			},
			about: function () {
				print('<span class="t-pink">Shreyansh Sawarn</span> — DevOps Engineer, 4.5+ years.\nAzure CI/CD, Terraform, Kubernetes, SRE. Reliability is a feature.');
			},
			skills: function () {
				print('azure-devops docker kubernetes terraform terragrunt\npython powershell kql linux sonarcloud jfrog redis');
			},
			projects: function () {
				print('tf-azure                    <span class="t-dim">terraform azure automation</span>\nFace-Eyes-Smile-Detector    <span class="t-dim">opencv + python</span>\nLibrary-Management-System   <span class="t-dim">php + sql</span>\n<span class="t-dim">run \'github\' to browse them</span>');
			},
			resume: function () {
				print('opening resume.pdf ...');
				window.open('images/Shreyansh_Sawarn_Resume.pdf', '_blank');
			},
			contact: function () {
				print('email: <a href="mailto:shreyanshsawarn88@gmail.com">shreyanshsawarn88@gmail.com</a>');
			},
			github: function () {
				print('opening github ...');
				window.open('https://github.com/shreyansh-sawarn', '_blank');
			},
			linkedin: function () {
				print('opening linkedin ...');
				window.open('https://www.linkedin.com/in/shreyanshsawarn/', '_blank');
			},
			theme: function () {
				document.getElementById('theme-toggle').click();
				print('theme toggled.');
			},
			whoami: function () { print('shreyansh — devops engineer'); },
			uptime: function () { print('4.5+ years in production, 0 unrecoverable incidents'); },
			clear: function () { out.innerHTML = ''; },
			exit: function () { closeTerm(); }
		};

		function run(cmd) {
			print('<span class="t-pink">$</span> ' + cmd.replace(/</g, '&lt;'));
			var name = cmd.trim().split(/\s+/)[0].toLowerCase();
			if (!name) return;
			if (name === 'sudo') { print('sudo: permission denied. nice try.'); return; }
			if (COMMANDS[name]) { COMMANDS[name](); }
			else { print('command not found: ' + name.replace(/</g, '&lt;') + ' <span class="t-dim">(try \'help\')</span>'); }
		}

		function openTerm() {
			term.hidden = false;
			if (!out.innerHTML) {
				print('<span class="t-dim">welcome to shreyansh@portfolio — type <span class="t-cmd">help</span> to begin</span>');
			}
			input.focus();
		}

		function closeTerm() {
			term.hidden = true;
		}

		openBtn.addEventListener('click', function () {
			term.hidden ? openTerm() : closeTerm();
		});
		closeBtn.addEventListener('click', closeTerm);

		// command history (↑ / ↓ like a real shell)
		var history = [];
		var histIdx = -1;

		input.addEventListener('keydown', function (e) {
			if (e.key === 'Enter') {
				if (input.value.trim()) {
					history.push(input.value);
				}
				histIdx = history.length;
				run(input.value);
				input.value = '';
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (histIdx > 0) {
					histIdx--;
					input.value = history[histIdx];
					// caret to end
					input.setSelectionRange(input.value.length, input.value.length);
				}
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (histIdx < history.length - 1) {
					histIdx++;
					input.value = history[histIdx];
				} else {
					histIdx = history.length;
					input.value = '';
				}
			} else if (e.key === 'Tab') {
				e.preventDefault();
				var partial = input.value.trimStart().toLowerCase();
				if (!partial) return;
				var matches = Object.keys(COMMANDS).filter(function (c) {
					return c.indexOf(partial) === 0;
				});
				if (matches.length === 1) {
					input.value = matches[0];
				} else if (matches.length > 1) {
					// complete to the longest common prefix, list the options
					var prefix = matches.reduce(function (a, b) {
						var i = 0;
						while (i < a.length && a[i] === b[i]) i++;
						return a.slice(0, i);
					});
					if (prefix.length > partial.length) input.value = prefix;
					print('<span class="t-dim">' + matches.join('  ') + '</span>');
				}
			}
		});

		document.addEventListener('keydown', function (e) {
			if (e.key === '`' && e.target !== input) {
				e.preventDefault();
				term.hidden ? openTerm() : closeTerm();
			}
			if (e.key === 'Escape' && !term.hidden) closeTerm();
		});
	})();

	/* ---------- back to top ---------- */
	var topBtn = document.getElementById('top-button');

	if (topBtn) {
		window.addEventListener('scroll', function () {
			topBtn.classList.toggle('visible', window.scrollY > 500);
		}, { passive: true });

		topBtn.addEventListener('click', function () {
			window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
		});
	}
})();
