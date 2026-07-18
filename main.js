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
