/**
 * Abhishek Hallur — Frontend Developer Portfolio
 * script.js — Interactive features, Constellation Canvas, Magnetic Cursor,
 *             Dual Time-Lapse Crossfade, 3D Parallax & Micro-Animations
 */

document.addEventListener('DOMContentLoaded', () => {

    /* ═══════════════════════════════════════════════
       1. SCROLL PROGRESS BAR & BACK TO TOP CIRCLE
    ═══════════════════════════════════════════════ */
    const progressBar = document.getElementById('scroll-progress');
    const btt = document.getElementById('back-to-top');
    const scrollCircle = document.getElementById('scroll-circle');
    const circumference = 2 * Math.PI * 19; // ~119.38

    if (scrollCircle) {
        scrollCircle.style.strokeDasharray = circumference;
        scrollCircle.style.strokeDashoffset = circumference;
    }

    window.addEventListener('scroll', () => {
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPos = window.scrollY;
        const pct = scrollTotal > 0 ? (scrollPos / scrollTotal) * 100 : 0;

        if (progressBar) {
            progressBar.style.width = pct + '%';
        }

        // Back to top visibility & circular meter
        if (btt) {
            if (scrollPos > 320) {
                btt.classList.add('show');
            } else {
                btt.classList.remove('show');
            }
        }

        if (scrollCircle && scrollTotal > 0) {
            const fraction = Math.min(1, Math.max(0, scrollPos / scrollTotal));
            const offset = circumference - (fraction * circumference);
            scrollCircle.style.strokeDashoffset = offset;
        }
    }, { passive: true });

    if (btt) {
        btt.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    /* ═══════════════════════════════════════════════
       2. STICKY HEADER & NAV
    ═══════════════════════════════════════════════ */
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        }, { passive: true });
    }

    /* ═══════════════════════════════════════════════
       3. ACTIVE NAV LINK TRACKING
    ═══════════════════════════════════════════════ */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (sections.length && navLinks.length) {
        const sectionObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    navLinks.forEach(link => link.classList.remove('active'));
                    const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                    if (activeLink) activeLink.classList.add('active');
                }
            });
        }, { threshold: 0.35 });
        sections.forEach(s => sectionObs.observe(s));
    }

    /* ═══════════════════════════════════════════════
       4. MOBILE HAMBURGER MENU
    ═══════════════════════════════════════════════ */
    const navToggle = document.getElementById('nav-toggle');
    const navList   = document.getElementById('nav-links');
    if (navToggle && navList) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navList.classList.toggle('open');
        });
        navLinks.forEach(link => link.addEventListener('click', () => {
            navToggle.classList.remove('open');
            navList.classList.remove('open');
        }));
    }

    /* ═══════════════════════════════════════════════
       5. INTERACTIVE CONSTELLATION & MAGNETIC CANVAS
    ═══════════════════════════════════════════════ */
    (function initParticles() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let W, H, particles;
        const rand = (a, b) => a + Math.random() * (b - a);
        let mouseX = -9999, mouseY = -9999;

        window.addEventListener('mousemove', e => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        }, { passive: true });

        window.addEventListener('mouseleave', () => {
            mouseX = -9999;
            mouseY = -9999;
        });

        function resize() {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
        }

        function createParticles() {
            const count = Math.min(Math.floor(window.innerWidth / 15), 90);
            return Array.from({ length: count }, () => ({
                x: rand(0, W),
                y: rand(0, H),
                r: rand(0.6, 1.8),
                vx: rand(-0.22, 0.22),
                vy: rand(-0.45, -0.15),
                alpha: rand(0.3, 0.85),
                pulse: rand(0.006, 0.015),
                phase: rand(0, Math.PI * 2)
            }));
        }

        resize();
        particles = createParticles();
        window.addEventListener('resize', () => {
            resize();
            particles = createParticles();
        }, { passive: true });

        let frame = 0;
        function render() {
            ctx.clearRect(0, 0, W, H);
            frame++;
            const isLight = document.body.classList.contains('light');
            const baseColor = isLight ? '109,40,217,' : '196,181,253,';
            const masterAlpha = isLight ? 0.40 : 0.70;
            const pLen = particles.length;

            // Draw Constellation Connections between nearby stars
            for (let i = 0; i < pLen; i++) {
                const pi = particles[i];
                for (let j = i + 1; j < pLen; j++) {
                    const pj = particles[j];
                    const dx = pi.x - pj.x;
                    const dy = pi.y - pj.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 85) {
                        const lineAlpha = (1 - dist / 85) * 0.14 * masterAlpha;
                        ctx.beginPath();
                        ctx.moveTo(pi.x, pi.y);
                        ctx.lineTo(pj.x, pj.y);
                        ctx.strokeStyle = `rgba(${baseColor}${lineAlpha})`;
                        ctx.lineWidth = 0.55;
                        ctx.stroke();
                    }
                }

                // Interactive mouse starlight breeze
                const mdx = pi.x - mouseX;
                const mdy = pi.y - mouseY;
                const mDist = Math.hypot(mdx, mdy);
                if (mDist < 110 && mDist > 0) {
                    const force = (1 - mDist / 110) * 1.6;
                    pi.x += (mdx / mDist) * force;
                    pi.y += (mdy / mDist) * force;
                }

                // Render particle dot
                const a = pi.alpha * (0.5 + 0.5 * Math.sin(pi.phase + frame * pi.pulse)) * masterAlpha;
                ctx.beginPath();
                ctx.arc(pi.x, pi.y, pi.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${baseColor}${a})`;
                ctx.fill();

                // Fluid upward wave motion
                pi.x += pi.vx + Math.sin(frame * 0.02 + pi.phase) * 0.28;
                pi.y += pi.vy;
                if (pi.y < -6) pi.y = H + 6;
                if (pi.x < -6) pi.x = W + 6;
                if (pi.x > W + 6) pi.x = -6;
            }

            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);
    })();

    /* ═══════════════════════════════════════════════
       7. SCROLL REVEAL ANIMATIONS
    ═══════════════════════════════════════════════ */
    const revealElements = document.querySelectorAll('.reveal-el');
    if (revealElements.length) {
        const revealObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealElements.forEach(el => revealObs.observe(el));
    }

    /* ═══════════════════════════════════════════════
       8. DYNAMIC ROLE ROTATOR (Hero Tagline Typing Loop)
    ═══════════════════════════════════════════════ */
    (function initRoleRotator() {
        const rotator = document.getElementById('role-rotator');
        if (!rotator) return;
        const roles = [
            'interactive web experiences',
            'responsive & modern UI',
            'clean JavaScript architecture',
            'delightful user journeys'
        ];
        let roleIdx = 0;
        let charIdx = 0;
        let isDeleting = false;

        function tick() {
            const currentRole = roles[roleIdx];
            if (isDeleting) {
                rotator.textContent = currentRole.substring(0, charIdx - 1);
                charIdx--;
            } else {
                rotator.textContent = currentRole.substring(0, charIdx + 1);
                charIdx++;
            }

            let typeSpeed = isDeleting ? 35 : 65;

            if (!isDeleting && charIdx === currentRole.length) {
                typeSpeed = 2200; // Hold word
                isDeleting = true;
            } else if (isDeleting && charIdx === 0) {
                isDeleting = false;
                roleIdx = (roleIdx + 1) % roles.length;
                typeSpeed = 450;
            }

            setTimeout(tick, typeSpeed);
        }
        setTimeout(tick, 1000);
    })();

    /* ═══════════════════════════════════════════════
       9. HERO 3D PARALLAX TILT
    ═══════════════════════════════════════════════ */
    (function initHeroParallax() {
        const heroVisual = document.querySelector('.hero-visual');
        const photoRing = document.getElementById('hero-photo-ring');
        if (!heroVisual || !photoRing || !window.matchMedia('(min-width: 860px)').matches) return;

        heroVisual.addEventListener('mousemove', e => {
            const rect = heroVisual.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            photoRing.style.transform = `perspective(900px) rotateY(${x * 16}deg) rotateX(${-y * 16}deg)`;
        });

        heroVisual.addEventListener('mouseleave', () => {
            photoRing.style.transform = 'perspective(900px) rotateY(0deg) rotateX(0deg)';
        });
    })();

    /* ═══════════════════════════════════════════════
       10. MAGNETIC NAV LINKS (Desktop)
    ═══════════════════════════════════════════════ */
    if (window.matchMedia('(min-width: 860px)').matches) {
        navLinks.forEach(link => {
            link.addEventListener('mousemove', e => {
                const r = link.getBoundingClientRect();
                const dx = e.clientX - (r.left + r.width / 2);
                const dy = e.clientY - (r.top + r.height / 2);
                link.style.transform = `translate(${dx * 0.16}px, ${dy * 0.16}px)`;
            });
            link.addEventListener('mouseleave', () => {
                link.style.transform = '';
            });
        });
    }

    /* ═══════════════════════════════════════════════
       11. INTERACTIVE 3D TILT (Cards & Badges)
    ═══════════════════════════════════════════════ */
    document.querySelectorAll('.skill-card, .stat-card, .trait-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            card.style.transform = `perspective(700px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    /* ═══════════════════════════════════════════════
       12. CARD RIPPLE EFFECT
    ═══════════════════════════════════════════════ */
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', e => {
            const r = card.getBoundingClientRect();
            const size = Math.max(r.width, r.height);
            const rip = document.createElement('span');
            rip.className = 'ripple';
            rip.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
            card.appendChild(rip);
            rip.addEventListener('animationend', () => rip.remove());
        });
    });

    /* ═══════════════════════════════════════════════
       13. ABOUT ANIMATED NUMBER COUNTERS
    ═══════════════════════════════════════════════ */
    (function initCounters() {
        const counters = document.querySelectorAll('.counter[data-target]');
        if (!counters.length) return;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'), 10);
                    let current = 0;
                    const step = Math.max(1, Math.floor(target / 40));
                    const duration = 1200;
                    const interval = Math.floor(duration / (target / step));

                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            el.textContent = target;
                            clearInterval(timer);
                        } else {
                            el.textContent = current;
                        }
                    }, interval);

                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.4 });

        counters.forEach(c => observer.observe(c));
    })();

    /* ═══════════════════════════════════════════════
       14. CONTACT FORM
    ═══════════════════════════════════════════════ */
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async e => {
            e.preventDefault();
            const btn = contactForm.querySelector('button[type="submit"]');
            const msg = document.getElementById('form-msg');
            const originalButton = btn ? btn.innerHTML : '';
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin" style="margin-left: 6px;"></i>';
            }

            if (msg) {
                msg.textContent = '';
            }

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { Accept: 'application/json' }
                });
                const result = await response.json();

                if (!response.ok) {
                    const errors = Array.isArray(result.errors)
                        ? result.errors.map(error => error.message).join(' ')
                        : '';
                    throw new Error(errors || 'Unable to send your message. Please try again.');
                }

                contactForm.reset();
                if (msg) {
                    msg.textContent = 'Thanks! I\'ll get back to you as soon as possible.';
                    msg.style.color = '#10b981';
                }
            } catch (error) {
                if (msg) {
                    msg.textContent = error.message || 'Unable to send your message. Please try again.';
                    msg.style.color = '#ef4444';
                }
            } finally {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = originalButton;
                }
            }
        });
    }

    /* ═══════════════════════════════════════════════
       15. AUDIO WIDGET & ANIMATED EQUALIZER BARS
    ═══════════════════════════════════════════════ */
    const audioWidget = document.getElementById('audio-widget');
    const audio       = document.getElementById('bg-audio');
    const iconPlay    = document.getElementById('icon-play');
    const iconPause   = document.getElementById('icon-pause');
    const audioBars   = document.getElementById('audio-bars');
    let isPlaying     = false;

    function toggleAudio() {
        if (!audio) return;
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            if (audioBars) audioBars.classList.remove('playing');
            if (iconPlay)  iconPlay.style.display  = 'block';
            if (iconPause) iconPause.style.display = 'none';
        } else {
            audio.play().then(() => {
                isPlaying = true;
                if (audioBars) audioBars.classList.add('playing');
                if (iconPlay)  iconPlay.style.display  = 'none';
                if (iconPause) iconPause.style.display = 'block';
            }).catch(err => {
                console.warn('Audio playback was prevented:', err);
                isPlaying = false;
            });
        }
    }

    if (audioWidget && audio) {
        audioWidget.addEventListener('click', toggleAudio);
    }

    /* ═══════════════════════════════════════════════
       16. DUAL TIME-LAPSE ENGINE (DAY & NIGHT SEAMLESS CROSSFADE)
    ═══════════════════════════════════════════════ */
    const body               = document.body;
    const themeToggle        = document.getElementById('theme-toggle');
    const toggleIcon         = themeToggle ? themeToggle.querySelector('.toggle-icon') : null;
    const videoDark          = document.getElementById('bg-video-dark');
    const videoLight         = document.getElementById('bg-video-light');
    const timelapsePillBtn   = document.getElementById('timelapse-toggle-btn');
    const timelapseModeName  = document.getElementById('timelapse-mode-name');
    const timelapseBtnText   = document.getElementById('timelapse-btn-text');
    const timelapseBtnIcon   = document.getElementById('timelapse-btn-icon');

    // Ensure both time-lapse background videos start playing immediately
    [videoDark, videoLight].forEach(vid => {
        if (vid) {
            vid.play().catch(() => {
                const onFirstInteraction = () => {
                    vid.play().catch(() => {});
                    window.removeEventListener('click', onFirstInteraction);
                    window.removeEventListener('touchstart', onFirstInteraction);
                };
                window.addEventListener('click', onFirstInteraction, { once: true });
                window.addEventListener('touchstart', onFirstInteraction, { once: true });
            });
        }
    });

    let isLightMode = localStorage.getItem('theme') === 'light';

    function setMode(light) {
        isLightMode = light;

        if (light) {
            body.classList.add('light');
            if (toggleIcon) toggleIcon.textContent = '☀️';
            if (timelapseModeName) timelapseModeName.textContent = 'Day Sky';
            if (timelapseBtnText) timelapseBtnText.textContent = 'Experience Night Stars';
            if (timelapseBtnIcon) timelapseBtnIcon.className = 'fa-solid fa-moon';
        } else {
            body.classList.remove('light');
            if (toggleIcon) toggleIcon.textContent = '🌙';
            if (timelapseModeName) timelapseModeName.textContent = 'Night Stars';
            if (timelapseBtnText) timelapseBtnText.textContent = 'Experience Day Sky';
            if (timelapseBtnIcon) timelapseBtnIcon.className = 'fa-solid fa-sun';
        }

        // Celestial icon spin feedback animation
        [timelapseBtnIcon, toggleIcon].forEach(icon => {
            if (icon) {
                icon.classList.remove('spin-once');
                void icon.offsetWidth;
                icon.classList.add('spin-once');
            }
        });

        localStorage.setItem('theme', light ? 'light' : 'dark');
    }

    // Initialize saved preference
    setMode(isLightMode);

    // Navbar theme toggle click
    if (themeToggle) {
        themeToggle.addEventListener('click', () => setMode(!isLightMode));
    }

    // Hero section time-lapse pill switcher click (entire pill clickable)
    const timelapsePill = document.getElementById('timelapse-pill');
    if (timelapsePill) {
        timelapsePill.style.cursor = 'pointer';
        timelapsePill.addEventListener('click', () => setMode(!isLightMode));
    } else if (timelapsePillBtn) {
        timelapsePillBtn.addEventListener('click', () => setMode(!isLightMode));
    }

    // Keyboard shortcut: Alt + T
    document.addEventListener('keydown', e => {
        if (e.altKey && (e.key === 't' || e.key === 'T')) {
            setMode(!isLightMode);
        }
    });

});
