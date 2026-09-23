/* prachiti.exe — interactions */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg, ms = 2200) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), ms);
  }

  /* ---------- pixel avatar ---------- */
  const PIXELS = [
    "....hhhhhhh.bb..",
    "...hhhhhhhhhbbb.",
    "..hhhhhhhhhhhbb.",
    "..hhhsssssshhh..",
    ".hhhssssssssshh.",
    ".hhsseessseesshh",
    ".hhsseessseesshh",
    ".hhcssssssssschh",
    ".hhsssssmmssssh.",
    ".hhhsssssssssh..",
    ".hhh..ssss..hh..",
    ".hh.ppwwwwpp.h..",
    "..sppppwwppppps.",
    "..sppppppppppps.",
    "..s.pppppppp.s..",
    "....gggggggg....",
    "...gggggggggg...",
    ".....ll..ll.....",
    ".....ll..ll.....",
    "....kkk..kkk....",
  ];
  const COLORS = {
    h: "#3b1f1a", s: "#c98b6b", e: "#2a1410", b: "#ff4fa3", w: "#ffffff",
    p: "#ff8fbf", m: "#b0405a", c: "#ff9aa8", g: "#7a1230", l: "#c98b6b", k: "#fff6ec",
  };
  function avatarSVG(scale) {
    const w = PIXELS[0].length, h = PIXELS.length;
    let rects = "";
    PIXELS.forEach((row, y) => {
      [...row].forEach((ch, x) => {
        if (ch === ".") return;
        const cls = ch === "e" ? ' class="eye"' : "";
        rects += `<rect${cls} x="${x}" y="${y}" width="1" height="1" fill="${COLORS[ch]}"/>`;
      });
    });
    return `<svg width="${w * scale}" height="${h * scale}" viewBox="0 0 ${w} ${h}" aria-hidden="true">${rects}</svg>`;
  }
  $$(".pixel-avatar").forEach((el) => {
    el.innerHTML = avatarSVG(+el.dataset.scale || 6);
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", "Pixel-art Prachiti");
  });
  // blink
  setInterval(() => {
    $$(".pixel-avatar .eye").forEach((e) => e.classList.add("shut"));
    setTimeout(() => $$(".pixel-avatar .eye").forEach((e) => e.classList.remove("shut")), 160);
  }, 3200);

  /* ---------- boot screen ---------- */
  const boot = $("#boot");
  let seen = false;
  let onBootKey = null;
  try { seen = sessionStorage.getItem("booted") === "1"; } catch (_) {}
  function startGame() {
    if (boot.classList.contains("gone")) return;
    if (onBootKey) window.removeEventListener("keydown", onBootKey);
    $(".boot-title").classList.add("glitch");
    setTimeout(() => {
      boot.classList.add("gone");
      document.body.style.overflow = "";
      try { sessionStorage.setItem("booted", "1"); } catch (_) {}
      setTimeout(() => toast("★ PLAYER 01 HAS ENTERED ★"), 700);
      runTypers($("#home"));
    }, reduceMotion ? 0 : 600);
  }
  if (seen) {
    boot.classList.add("gone");
    setTimeout(() => runTypers($("#home")), 200);
  } else {
    document.body.style.overflow = "hidden";
    $("#startBtn").addEventListener("click", startGame);
    onBootKey = (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      window.removeEventListener("keydown", onBootKey);
      startGame();
    };
    window.addEventListener("keydown", onBootKey);
    boot.addEventListener("dblclick", startGame);
  }
  $("#tbStart").addEventListener("click", () => {
    try { sessionStorage.removeItem("booted"); } catch (_) {}
    window.scrollTo(0, 0);
    location.reload();
  });

  // starfield
  const canvas = $("#stars");
  const ctx = canvas.getContext("2d");
  let stars = [];
  function sizeCanvas() {
    canvas.width = innerWidth; canvas.height = innerHeight;
    stars = Array.from({ length: Math.min(180, (innerWidth * innerHeight) / 7000) }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      s: Math.random() < 0.15 ? 3 : Math.random() < 0.5 ? 2 : 1,
      v: 0.15 + Math.random() * 0.5, t: Math.random() * Math.PI * 2,
      c: ["#ffffff", "#ff8fbf", "#c7c3ff", "#ffe86b"][Math.floor(Math.random() * 4)],
    }));
  }
  function drawStars() {
    if (boot.classList.contains("gone")) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const st of stars) {
      st.t += 0.05; st.x -= st.v;
      if (st.x < 0) st.x = canvas.width;
      ctx.globalAlpha = 0.5 + Math.sin(st.t) * 0.5;
      ctx.fillStyle = st.c;
      ctx.fillRect(Math.round(st.x), Math.round(st.y), st.s, st.s);
    }
    requestAnimationFrame(drawStars);
  }
  if (!seen) { sizeCanvas(); drawStars(); addEventListener("resize", sizeCanvas); }

  /* ---------- typing effect ---------- */
  function typeInto(el) {
    if (el.dataset.typed) return;
    el.dataset.typed = "1";
    const text = el.dataset.text;
    if (reduceMotion) { el.textContent = text; el.classList.add("done"); return; }
    let i = 0;
    (function step() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(step, 28 + Math.random() * 40);
      else setTimeout(() => el.classList.add("done"), 1200);
    })();
  }
  function runTypers(scope) { $$(".typer", scope).forEach(typeInto); }

  /* ---------- scroll reveal + skill bars ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add("in");
      $$(".bar i", el).forEach((b, i) => setTimeout(() => (b.style.width = b.dataset.w + "%"), 200 + i * 150));
      if (!el.closest("#home")) runTypers(el);
      io.unobserve(el);
    });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 80 + "ms";
    io.observe(el);
  });

  /* ---------- XP bar + active nav ---------- */
  const xpFill = $("#xpFill"), lvl = $("#lvl");
  const sections = $$("main section[id]");
  const navLinks = $$(".nav-links a");
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const pct = max > 0 ? scrollY / max : 0;
    xpFill.style.width = (pct * 100).toFixed(1) + "%";
    lvl.textContent = String(Math.min(99, Math.floor(pct * 25) + 1)).padStart(2, "0");
    let current = sections[0].id;
    for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * 0.4) current = s.id;
    navLinks.forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + current));
    if (pct > 0.985 && !onScroll.maxed) { onScroll.maxed = true; toast("LEVEL MAXED! ✦ thanks for playing ✦"); }
  }
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- coins: click stickers ---------- */
  let coins = 0;
  const coinEl = $("#coinCount"), coinWrap = $(".coins");
  const TOTAL = $$(".sticker").length;
  $$(".sticker").forEach((st) => {
    st.setAttribute("role", "button");
    st.setAttribute("aria-label", "Collect sticker");
    st.tabIndex = 0;
    const collect = (e) => {
      if (st.classList.contains("popped")) return;
      st.classList.add("popped");
      coins++;
      coinEl.textContent = coins;
      coinWrap.classList.remove("bump"); void coinWrap.offsetWidth; coinWrap.classList.add("bump");
      const r = st.getBoundingClientRect();
      const pop = document.createElement("span");
      pop.className = "coin-pop"; pop.textContent = "+1 ●";
      pop.style.left = r.left + r.width / 2 + "px"; pop.style.top = r.top + "px";
      document.body.appendChild(pop);
      setTimeout(() => pop.remove(), 800);
      if (coins === TOTAL) { toast(`ACHIEVEMENT UNLOCKED: sweet tooth (${TOTAL}/${TOTAL}) 🍬`, 3500); confetti(); }
      else toast(`coin get! ${coins}/${TOTAL}`, 1200);
      // respawn later so it keeps being fun
      setTimeout(() => st.classList.remove("popped"), 9000);
    };
    st.addEventListener("click", collect);
    st.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); collect(e); } });
  });

  function confetti(n = 60) {
    if (reduceMotion) return;
    const bits = ["🍬", "🍒", "⭐", "💖", "✦", "🌸", "🍭"];
    for (let i = 0; i < n; i++) {
      const c = document.createElement("span");
      c.className = "confetti";
      c.textContent = bits[i % bits.length];
      c.style.left = Math.random() * 100 + "vw";
      c.style.animationDuration = 2 + Math.random() * 2.5 + "s";
      c.style.animationDelay = Math.random() * 0.8 + "s";
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 5500);
    }
  }

  /* ---------- parallax stickers ---------- */
  if (finePointer && !reduceMotion) {
    let raf;
    addEventListener("mousemove", (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const dx = e.clientX / innerWidth - 0.5, dy = e.clientY / innerHeight - 0.5;
        $$(".sticker").forEach((s) => {
          const d = +s.dataset.depth || 10;
          s.style.transform = `translate(${dx * d}px, ${dy * d}px)`;
        });
      });
    });
  }

  /* ---------- sparkle cursor trail ---------- */
  if (finePointer && !reduceMotion) {
    const glyphs = ["✦", "✧", "♥", "★", "·"];
    const cols = ["#ff4fa3", "#8d86ff", "#d62839", "#f2b705", "#ff8fbf"];
    let last = 0;
    addEventListener("mousemove", (e) => {
      const now = performance.now();
      if (now - last < 45) return;
      last = now;
      const s = document.createElement("span");
      s.className = "spark";
      s.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      s.style.color = cols[Math.floor(Math.random() * cols.length)];
      s.style.left = e.clientX + 6 + "px";
      s.style.top = e.clientY + 6 + "px";
      s.style.setProperty("--dx", (Math.random() * 30 - 15) + "px");
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    });
  }

  /* ---------- draggable Y2K windows ---------- */
  let zTop = 10;
  $$(".draggable").forEach((win) => {
    const bar = $(".titlebar", win);
    let sx, sy, ox = 0, oy = 0, dragging = false;
    const cs = getComputedStyle(win);
    if (cs.position === "static") win.style.position = "relative";
    bar.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".ctrls") || !finePointer) return;
      dragging = true;
      sx = e.clientX - ox; sy = e.clientY - oy;
      win.classList.add("dragging");
      win.style.zIndex = ++zTop;
      bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      ox = e.clientX - sx; oy = e.clientY - sy;
      win.style.translate = `${ox}px ${oy}px`;
    });
    const end = () => { dragging = false; win.classList.remove("dragging"); };
    bar.addEventListener("pointerup", end);
    bar.addEventListener("pointercancel", end);
    win.addEventListener("pointerdown", () => (win.style.zIndex = ++zTop));
  });

  // window controls
  const quips = ["can't get rid of me that easily!", "nice try ✦ respawning...", "error 418: i'm a teapot", "window.exe refuses to close :)"];
  $$(".window").forEach((win) => {
    $$(".ctrls i", win).forEach((btn) => {
      btn.addEventListener("click", () => {
        const t = btn.textContent.trim();
        if (t === "_") { win.classList.toggle("min"); return; }
        if (t === "□") { win.classList.remove("min"); win.classList.remove("reopen"); void win.offsetWidth; win.classList.add("reopen"); return; }
        if (t === "×") {
          win.classList.add("closing");
          toast(quips[Math.floor(Math.random() * quips.length)]);
          setTimeout(() => {
            win.classList.remove("closing");
            win.classList.add("reopen");
            setTimeout(() => win.classList.remove("reopen"), 600);
          }, 1400);
        }
      });
    });
  });

  /* ---------- quest log tabs ---------- */
  const tabs = $$(".quest-tab"), panels = $$(".quest-panel"), indicator = $(".quest-indicator");
  function selectQuest(i) {
    tabs.forEach((t, j) => { t.classList.toggle("active", i === j); t.setAttribute("aria-selected", i === j); });
    panels.forEach((p, j) => p.classList.toggle("active", i === j));
    indicator.style.left = i * 25 + "%";
  }
  tabs.forEach((t, i) => t.addEventListener("click", () => selectQuest(i)));
  selectQuest(0);

  /* ---------- copy email ---------- */
  $("#copyEmail").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText("prachitipalande191@gmail.com"); toast("email copied! ✉"); }
    catch (_) { toast("prachitipalande191@gmail.com"); }
  });

  /* ---------- resume button: hide if the PDF isn't in /assets ---------- */
  const resumeBtn = $("#resumeBtn");
  fetch(resumeBtn.getAttribute("href"), { method: "HEAD" })
    .then((r) => { if (!r.ok) throw 0; })
    .catch(() => { resumeBtn.style.display = "none"; });

  /* ---------- taskbar clock ---------- */
  const clock = $("#clock");
  const tick = () => (clock.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
  tick(); setInterval(tick, 15000);

  /* ---------- konami code easter egg ---------- */
  const code = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let k = 0;
  addEventListener("keydown", (e) => {
    k = e.key === code[k] ? k + 1 : e.key === code[0] ? 1 : 0;
    if (k === code.length) { k = 0; toast("↑↑↓↓←→←→BA — CHEAT CODE: +99 CANDY", 3000); confetti(90); }
  });
})();
