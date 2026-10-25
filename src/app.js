/* ==========================================================================
   Cardstock — studio application
   ========================================================================== */
(function () {
  "use strict";

  const { THEMES, FONT_STYLES, FRONT_LAYOUTS, BACK_LAYOUTS, SIZES, BLEED_MM, byId } = window.CardThemes;
  const T = window.CardTemplates;

  const STORE_KEY = "cardstock.v1";

  const DEFAULTS = {
    themeId: "neon",
    recipient: "Sofia",
    eyebrow: "A LITTLE SOMETHING FOR",
    occasion: "",
    message: "Thank you for always being the first to say yes — to the trip, to the second round, to the very bad idea. Here's to many more.",
    sender: "Alex",
    showSender: true,
    fontStyle: "elegant",
    frontLayout: "halo",
    backLayout: "ruled",
    density: "balanced",
    icons: null,            // null = use theme's icon family
    accentOverride: "",
    messageSize: 10,
    handFont: false,
    sizeKey: "A",
    showGuides: true,
    viewSide: "both",
    zoom: 100
  };

  let state = load();
  let lastFocused = null;

  /* ---------------------------------------------------------------- state */
  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return Object.assign({}, DEFAULTS);
      return Object.assign({}, DEFAULTS, JSON.parse(raw));
    } catch (e) { return Object.assign({}, DEFAULTS); }
  }
  let saveTimer = null;
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { }
    }, 250);
  }

  const theme = () => byId(state.themeId);
  const size = () => SIZES[state.sizeKey] || SIZES.A;

  /* ------------------------------------------------------------- render */
  const cardsEl = document.getElementById("cards");

  function render() {
    const t = theme();
    // keep type styles / layouts valid for the theme
    if (!FRONT_LAYOUTS.some((l) => l.id === state.frontLayout)) state.frontLayout = "halo";
    if (!BACK_LAYOUTS.some((l) => l.id === state.backLayout)) state.backLayout = "ruled";

    const sides = state.viewSide === "both" ? ["front", "back"] : [state.viewSide];
    cardsEl.innerHTML = sides.map((side) => {
      const label = side === "front" ? "Front" : "Back";
      const meta = side === "front"
        ? `${(state.icons && state.icons.length ? state.icons.length : Math.min(t.icons.length, 14))} icons`
        : `${state.messageSize} pt message`;
      return `<div class="card-slot">
        <div class="card-frame">${T.card(state, t, side, size(), { guides: state.showGuides, preview: true })}</div>
        <div class="card-label"><span class="dot"></span>${label} <span class="meta">· ${meta}</span></div>
      </div>`;
    }).join("");

    layoutStage();
    window.CardFit.fitCard(cardsEl);
    requestAnimationFrame(() => {
      window.CardFit.fitCard(cardsEl);
      updateChecks();
      setTimeout(() => { window.CardFit.fitCard(cardsEl); updateChecks(); }, 120);
    });
    syncControls();
    persist();
  }

  /* --------------------------------------------------- stage sizing */
  function layoutStage() {
    const scroll = document.querySelector(".cards-scroll");
    const both = state.viewSide === "both";
    const narrow = window.matchMedia("(max-width: 760px)").matches;
    const sz = size();
    const pad = narrow ? 32 : 56;
    const availW = Math.max(240, scroll.clientWidth - pad);
    const availH = Math.max(180, scroll.clientHeight - 96);

    const perCardW = both && !narrow ? (availW - 34) / 2 : availW - 8;
    const perCardH = availH;

    /* on phones the cards stack, so let width drive the scale and scroll */
    let p = narrow
      ? perCardW / (sz.w + BLEED_MM * 2)
      : Math.min(perCardW / (sz.w + BLEED_MM * 2), perCardH / (sz.h + BLEED_MM * 2));
    p = Math.max(1.9, Math.min(p, 8.6));
    p *= state.zoom / 100;
    cardsEl.style.setProperty("--p", p.toFixed(4) + "px");
  }

  /* ------------------------------------------------------------- controls */
  function money(n) { return n; }

  function el(tag, attrs, html) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === "class") n.className = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k];
      else if (k.startsWith("on")) n.addEventListener(k.slice(2), attrs[k]);
      else n.setAttribute(k, attrs[k]);
    }
    if (html != null) n.innerHTML = html;
    return n;
  }

  const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="m4.5 12.5 5 5 10-11"/></svg>';
  const ICON_WARN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 6v8M12 18h.01"/></svg>';

  /* ---------- theme grid ---------- */
  const themeCountEl = document.getElementById("themeCount");
  if (themeCountEl) themeCountEl.textContent = THEMES.length + " presets";
  const themeGrid = document.getElementById("themeGrid");
  function buildThemeGrid() {
    themeGrid.innerHTML = "";
    THEMES.forEach((t) => {
      const b = el("button", { class: "theme-card", type: "button", "aria-pressed": String(state.themeId === t.id), "data-theme": t.id });
      b.innerHTML = `
        <span class="tc-swatch" style="--tc:${t.accent}"></span>
        <span class="tc-top">
          <span class="tc-dots">
            <i class="tc-dot" style="background:${t.paper}"></i>
            <i class="tc-dot" style="background:${t.accent}"></i>
            <i class="tc-dot" style="background:${t.accent2}"></i>
            <i class="tc-dot" style="background:${t.pop}"></i>
          </span>
          <span class="tc-ic">${window.CardIcons.svgFor(t.cornerIcon)}</span>
        </span>
        <span class="tc-name">${t.name}</span>
        <span class="tc-blurb">${t.blurb}</span>`;
      b.addEventListener("click", () => setTheme(t.id));
      themeGrid.appendChild(b);
    });
  }

  function setTheme(id) {
    const prev = theme();
    state.themeId = id;
    const t = theme();
    // carry over a custom accent only if it was untouched
    state.accentOverride = "";
    state.icons = null;
    // adopt the new theme's type + layout defaults
    state.fontStyle = t.fontStyle;
    state.frontLayout = t.frontLayout;
    state.backLayout = t.backLayout;
    render();
  }

  /* ---------- segmented controls ---------- */
  function buildSeg(container, items, getVal, setVal, opts) {
    container.innerHTML = "";
    items.forEach((it) => {
      const b = el("button", { type: "button", "aria-pressed": String(getVal() === it.id), title: it.note || it.label });
      b.innerHTML = (opts && opts.icons && opts.icons[it.id] ? opts.icons[it.id] : "") + `<span>${it.label}</span>`;
      b.addEventListener("click", () => { setVal(it.id); });
      container.appendChild(b);
    });
  }

  const frontLayoutSeg = document.getElementById("frontLayoutSeg");
  const backLayoutSeg = document.getElementById("backLayoutSeg");
  const fontSeg = document.getElementById("fontSeg");

  const FRONT_ICONS = {
    halo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="8" stroke-dasharray="2 3"/></svg>',
    frame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><rect x="6.5" y="7.5" width="11" height="9" rx="1"/></svg>',
    ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M3 9.5 21 6l1 5-18 3.5z"/><path d="M2.6 16.4 21 12.9"/></svg>',
    confetti: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="2.6"/><path d="M5 5h.01M19 6h.01M6 19h.01M18 18h.01M12 3v.01M12 21v.01M3 12h.01M21 12h.01" stroke-width="2.6" stroke-linecap="round"/></svg>'
  };
  const BACK_ICONS = {
    ruled: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M4 6h16M4 10h16M4 14h16M4 18h10"/></svg>',
    card: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M7.5 9.5h9M7.5 13h6" stroke-linecap="round"/></svg>',
    postcard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="5" width="18" height="14" rx="1.6"/><rect x="15" y="7.5" width="3.6" height="3" rx=".5"/><path d="M6 15h6M6 12h4" stroke-linecap="round"/></svg>',
    plain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6 9h12M6 13h12M6 17h7"/></svg>'
  };
  const FONT_ICONS = {
    elegant: '<span style="font-family:Fraunces,serif;font-size:15px;line-height:1">Aa</span>',
    playful: '<span style="font-family:\'Baloo 2\',cursive;font-weight:800;font-size:15px;line-height:1">Aa</span>',
    classic: '<span style="font-family:Fraunces,serif;font-weight:400;font-size:15px;line-height:1">Aa</span>',
    modern: '<span style="font-family:Inter,sans-serif;font-weight:700;font-size:15px;line-height:1">Aa</span>'
  };

  function buildControllers() {
    buildSeg(frontLayoutSeg, FRONT_LAYOUTS, () => state.frontLayout, (v) => { state.frontLayout = v; render(); }, { icons: FRONT_ICONS });
    buildSeg(backLayoutSeg, BACK_LAYOUTS, () => state.backLayout, (v) => { state.backLayout = v; render(); }, { icons: BACK_ICONS });
    buildSeg(fontSeg, Object.keys(FONT_STYLES).map((k) => ({ id: k, label: FONT_STYLES[k].label })), () => state.fontStyle, (v) => { state.fontStyle = v; render(); }, { icons: FONT_ICONS });

    const densitySeg = document.getElementById("densitySeg");
    buildSeg(densitySeg, [
      { id: "minimal", label: "Few" },
      { id: "balanced", label: "Balanced" },
      { id: "rich", label: "Rich" }
    ], () => state.density, (v) => { state.density = v; render(); });
  }

  /* ---------- accent swatches ---------- */
  const SWATCHES = ["#FF5C8A", "#D9542B", "#E4572E", "#EF8A7F", "#C8F26B", "#2A9D8F", "#1E8A85", "#7FD1FF", "#2F6F8F", "#5B8DEF", "#E3B463", "#F2C14E", "#A78BFA", "#8B5E3C", "#111A2C"];
  const accentWrap = document.getElementById("accentSwatches");

  function buildSwatches() {
    const t = theme();
    accentWrap.innerHTML = "";
    const current = state.accentOverride || t.accent;
    SLOTS.forEach((c) => {
      const b = el("button", { class: "swatch", type: "button", "aria-pressed": String(sameColor(c, current)), "data-c": c, title: c });
      b.style.background = c;
      b.addEventListener("click", () => { state.accentOverride = sameColor(c, theme().accent) ? "" : c; render(); });
      accentWrap.appendChild(b);
    });
    const custom = el("label", { class: "swatch-custom", title: "Custom colour" });
    custom.innerHTML = `<input type="color" value="${current}" aria-label="Custom accent colour">`;
    custom.querySelector("input").addEventListener("input", (e) => { state.accentOverride = e.target.value; render(); });
    accentWrap.appendChild(custom);

    const reset = el("button", { class: "btn ghost", type: "button", style: "padding:3px 8px;font-size:11.5px" }, "Theme default");
    reset.addEventListener("click", () => { state.accentOverride = ""; render(); });
    accentWrap.appendChild(reset);
  }
  const SLOTS = ["#FF5C8A", "#D9542B", "#E4572E", "#EF8A7F", "#F2C14E", "#E3B463", "#C8F26B", "#2A9D8F", "#1E8A85", "#7FD1FF", "#2F6F8F", "#5B8DEF", "#A78BFA", "#8B5E3C"];

  function sameColor(a, b) {
    if (!a || !b) return false;
    const norm = (s) => s.toLowerCase().replace(/\s/g, "");
    if (norm(a) === norm(b)) return true;
    const hex = (s) => {
      const m = s.match(/^#([0-9a-f]{6})$/i);
      if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
      const r = s.match(/^rgba?\(([^)]+)\)/i);
      if (r) return r[1].split(",").slice(0, 3).map((n) => Math.round(parseFloat(n)));
      return null;
    };
    const x = hex(a), y = hex(b);
    return !!(x && y && x[0] === y[0] && x[1] === y[1] && x[2] === y[2]);
  }

  /* ---------- icon tray ---------- */
  /* derived from the theme list so a new theme can never drift out of the icon pool */
  const FAMILY_OF = THEMES.reduce((m, t) => (m[t.id] = t.family || "general", m), {});
  const iconTray = document.getElementById("iconTray");
  const iconCountHint = document.getElementById("iconCountHint");

  function familyPool(t) {
    const fam = FAMILY_OF[t.id];
    const fams = fam === "party" ? ["party", "bar"] : [fam];
    const pool = [];
    /* this theme's own icons lead; sibling themes in the family follow */
    const kin = THEMES.filter((x) => fams.indexOf(FAMILY_OF[x.id]) >= 0);
    kin.sort((a, b) => (a.id === t.id ? -1 : b.id === t.id ? 1 : 0));
    kin.forEach((x) => {
      x.icons.forEach((ic) => { if (pool.indexOf(ic) < 0) pool.push(ic); });
    });
    if (fam !== "dog") ["heart", "star", "sparkle"].forEach((ic) => { if (pool.indexOf(ic) < 0) pool.push(ic); });
    return pool;
  }

  function activeIcons() {
    return state.icons && state.icons.length ? state.icons : T.iconsFor ? T.iconsFor(state, theme()) : theme().icons;
  }

  function buildIconTray() {
    const t = theme();
    const pool = familyPool(t);
    const chosen = state.icons && state.icons.length ? state.icons : t.icons.slice();
    iconTray.innerHTML = "";
    pool.forEach((name) => {
      const on = chosen.indexOf(name) >= 0;
      const meta = window.CardIcons.ICONS[name] || window.CardIcons.MASCOTS[name] || {};
      const b = el("button", { class: "icon-tile", type: "button", "aria-pressed": String(on), title: meta.label || name });
      b.innerHTML = window.CardIcons.svgFor(name);
      b.addEventListener("click", () => {
        let list = (state.icons && state.icons.length) ? state.icons.slice() : t.icons.slice();
        if (list.indexOf(name) >= 0) list = list.filter((x) => x !== name);
        else list.push(name);
        if (!list.length) list = [name];
        state.icons = list;
        render();
      });
      iconTray.appendChild(b);
    });
    const count = Math.min(chosen.length, 14);
    iconCountHint.textContent = state.density === "minimal" ? "6 shown" : state.density === "rich" ? Math.min(chosen.length, 14) + " shown" : Math.min(chosen.length, 10) + " shown";
  }

  document.getElementById("btnResetIcons").addEventListener("click", () => { state.icons = null; render(); });

  /* ---------- text inputs ---------- */
  const inpRecipient = document.getElementById("inpRecipient");
  const inpEyebrow = document.getElementById("inpEyebrow");
  const inpOccasion = document.getElementById("inpOccasion");
  const inpMessage = document.getElementById("inpMessage");
  const inpSender = document.getElementById("inpSender");
  const msgCounter = document.getElementById("msgCounter");

  function bindText(input, key, after) {
    input.addEventListener("input", () => {
      state[key] = input.value;
      if (after) after(input.value);
      render();
    });
  }
  bindText(inpRecipient, "recipient");
  bindText(inpEyebrow, "eyebrow");
  bindText(inpOccasion, "occasion");
  bindText(inpSender, "sender");
  bindText(inpMessage, "message", (v) => { msgCounter.textContent = v.length ? v.length + " chars" : "0 chars"; });

  const STARTERS = [
    { label: "Thank you", text: "Thank you for everything you do — quietly, generously, and usually before anyone asks.\n\nSo glad the world has you in it." },
    { label: "Birthday", text: "Happy birthday!\n\nHere's to another year of good coffee, long walks and plans we absolutely will make happen." },
    { label: "Cheers", text: "One more round, one more story.\n\nThank you for being my favourite person to get slightly lost with." },
    { label: "Love", text: "No big reason for this card — I just wanted you to know that I think you're wonderful.\n\nThat's it. That's the note." },
    { label: "Holiday", text: "Warmest wishes for the season.\n\nMay your days be slow, your table be full, and your phone battery last longer than mine." }
  ];
  const chipsEl = document.getElementById("starterChips");
  STARTERS.forEach((s) => {
    const b = el("button", { class: "chip", type: "button" }, s.label);
    b.addEventListener("click", () => {
      inpMessage.value = s.text;
      state.message = s.text;
      msgCounter.textContent = s.text.length + " chars";
      render();
    });
    chipsEl.appendChild(b);
  });

  /* ---------- back controls ---------- */
  const msgSize = document.getElementById("msgSize");
  const msgSizeVal = document.getElementById("msgSizeVal");
  msgSize.addEventListener("input", () => {
    state.messageSize = parseFloat(msgSize.value);
    msgSizeVal.textContent = state.messageSize + " pt";
    render();
  });

  const handFont = document.getElementById("handFont");
  handFont.addEventListener("change", () => { state.handFont = handFont.checked; render(); });

  const showSender = document.getElementById("showSender");
  showSender.addEventListener("change", () => { state.showSender = showSender.checked; render(); });

  /* ---------- print / size ---------- */
  const selSize = document.getElementById("selSize");
  selSize.addEventListener("change", () => {
    state.sizeKey = selSize.value;
    document.getElementById("specSize").textContent = size().label + (state.sizeKey === "B" ? " exact" : "");
    document.getElementById("mSize").textContent = size().label + ` (${size().note})`;
    render();
  });

  const showGuides = document.getElementById("showGuides");
  showGuides.addEventListener("change", () => { state.showGuides = showGuides.checked; render(); });

  /* ---------- stage bar ---------- */
  document.querySelectorAll("#sideSeg button").forEach((b) => {
    b.addEventListener("click", () => { state.viewSide = b.dataset.side; render(); });
  });
  const zoom = document.getElementById("zoom");
  const zoomVal = document.getElementById("zoomVal");
  zoom.addEventListener("input", () => {
    state.zoom = parseInt(zoom.value, 10);
    zoomVal.textContent = state.zoom + "%";
    layoutStage();
    CardFit.fitCard(cardsEl);
  });

  /* ---------------------------------------------------------------- checks */
  function escapeHtml(s) { return T.esc(s); }

  function computeChecks() {
    const out = [];
    const sz = size();
    const t = theme();
    const px = {
      300: CardExport.sizeFor(sz, 300),
      600: CardExport.sizeFor(sz, 600),
      1200: CardExport.sizeFor(sz, 1200)
    };
    out.push({
      ok: true, key: "res",
      label: `<b>300+ DPI</b> <span>${px[300].w} × ${px[300].h} px at 300 DPI</span>`
    });
    out.push({
      ok: true, key: "bleed",
      label: `<b>3 mm bleed</b> <span>file is ${(sz.w + 6).toFixed(1)} × ${(sz.h + 6).toFixed(1)} mm</span>`
    });

    /* nothing in the artwork is a bitmap, so nothing can run out of resolution */
    let svgN = 0, bmpN = 0;
    cardsEl.querySelectorAll(".card").forEach((card) => {
      svgN += card.querySelectorAll("svg").length;
      bmpN += card.querySelectorAll("img, canvas, picture, image").length;
    });
    out.push({
      ok: bmpN === 0, key: "vector",
      label: bmpN === 0
        ? `<b>Vector artwork</b> <span>${svgN} SVGs · no bitmaps, re-drawn at the export DPI</span>`
        : `<b>Bitmap artwork</b> <span>${bmpN} bitmap${bmpN === 1 ? "" : "s"} — checked at ${px[300].w} × ${px[300].h} px</span>`
    });

    // smallest type actually used + which block (if any) is clipped
    let minPt = Infinity;
    const clipped = [];
    cardsEl.querySelectorAll(".card").forEach((card) => {
      const m = CardFit.minFontPt(card);
      if (m > 0 && m < minPt) minPt = m;
      card.querySelectorAll("[data-overflow]").forEach((n) => {
        if (n.classList.contains("msg")) clipped.push("message");
        else if (n.classList.contains("name")) clipped.push("name");
        else if (n.classList.contains("signature")) clipped.push("sign-off");
        else if (n.classList.contains("back-title")) clipped.push("title");
        else if (!clipped.length) clipped.push("text");
      });
    });
    const overflow = clipped.length > 0;
    const minRounded = isFinite(minPt) ? Math.round(minPt * 10) / 10 : 0;
    out.push({
      ok: minRounded >= 7.9, key: "type",
      label: `<b>Smallest type ${minRounded} pt</b> <span>${minRounded >= 7.9 ? "above the 8 pt floor" : "below the print floor"}</span>`
    });
    out.push({
      ok: !overflow, key: "fit",
      label: overflow
        ? `<b>${clipped.join(" + ")} clipped</b> <span>shorten the text or lower the size</span>`
        : `<b>Everything fits</b> <span>no clipping</span>`
    });
    return { list: out, px, minPt: minRounded, overflow };
  }

  const stageFoot = document.getElementById("stageFoot");
  function updateChecks() {
    const { list } = computeChecks();
    stageFoot.innerHTML = list.map((c) =>
      `<span class="check ${c.ok ? "" : "bad"}"><span class="tick">${c.ok ? ICON_CHECK : ICON_WARN}</span>${c.label}</span>`
    ).join("") + `<span style="margin-left:auto;color:#A79D90">Trim ${size().w} × ${size().h} mm · bleed 3 mm</span>`;
    const fit = list.find((c) => c.key === "fit");
    const fitHint = document.getElementById("msgFitHint");
    if (fitHint) fitHint.textContent = fit.ok ? "back of card" : "text is clipping";
    const counter = document.getElementById("msgCounter");
    if (counter) {
      const len = (state.message || "").length;
      counter.classList.toggle("over", !fit.ok);
      counter.innerHTML = !fit.ok
        ? `${len} chars <b>· too long for this layout</b>`
        : `${len} chars`;
    }
  }

  /* ---------------------------------------------------------------- export */
  const modalBack = document.getElementById("modalBack");
  const busy = document.getElementById("busy");
  const busyText = document.getElementById("busyText");
  const toasts = document.getElementById("toasts");

  function toast(msg, kind) {
    const n = el("div", { class: "toast" + (kind === "err" ? " err" : "") });
    n.innerHTML = (kind === "err" ? ICON_WARN : ICON_CHECK) + `<span>${msg}</span>`;
    toasts.appendChild(n);
    setTimeout(() => { n.style.opacity = "0"; n.style.transition = "opacity .3s"; }, 2800);
    setTimeout(() => n.remove(), 3200);
  }

  function openModal() {
    lastFocused = document.activeElement;
    modalBack.classList.add("open");
    const g = document.getElementById("exportResult");
    if (g) { g.hidden = true; g.innerHTML = ""; }
    document.getElementById("btnCloseModal").focus();
    refreshModal();
  }
  function closeModal() {
    modalBack.classList.remove("open");
    if (lastFocused) lastFocused.focus();
  }
  document.getElementById("btnOpenExport").addEventListener("click", openModal);
  document.getElementById("btnExport2").addEventListener("click", openModal);
  document.getElementById("btnCloseModal").addEventListener("click", closeModal);
  modalBack.addEventListener("click", (e) => { if (e.target === modalBack) closeModal(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalBack.classList.contains("open")) closeModal();
  });

  function curFormat() {
    const r = document.querySelector('input[name="fmt"]:checked');
    return r ? r.value : "png";
  }
  function curDpi() {
    const r = document.querySelector('input[name="dpi"]:checked');
    return r ? parseInt(r.value, 10) : 300;
  }

  const FORMAT_COPY = {
    png: {
      hint: "<b>PNG</b> — lossless raster at the chosen DPI, bleed included. Best for uploading to a print shop’s web form.",
      note: "<b>Before you print:</b> colours are exported in sRGB. Most print shops ask for CMYK — if yours does, send this file plus your chosen theme and they will convert it. Keep the 3 mm bleed: the dashed magenta line in the preview shows how far the artwork runs past the cut line.",
      both: "2 PNGs"
    },
    jpeg: {
      hint: "<b>JPEG</b> — smaller file at the chosen DPI, bleed included. Handy for emailing a proof or uploading to a small print portal.",
      note: "<b>Before you print:</b> JPEG is lossy, so keep the quality high (this export uses 96%). Colours are sRGB; ask your printer to convert to CMYK if they need it, and keep the 3 mm bleed intact.",
      both: "2 JPEGs"
    },
    pdf: {
      hint: "<b>PDF</b> — print-ready pages with vector crop marks and TrimBox + BleedBox set. Hand this straight to the printer.",
      note: "<b>Print-ready:</b> each PDF embeds the artwork at the chosen DPI with crop marks and real TrimBox / BleedBox entries. Print at 100% — the crop marks show where to cut, and the bleed keeps the cut edge clean.",
      both: "2 PDFs"
    }
  };

  function refreshModal() {
    const dpi = curDpi(), fmt = curFormat();
    document.querySelectorAll(".radio").forEach((r) => {
      r.classList.toggle("on", r.querySelector("input").checked);
    });
    const sz = size();
    const px = CardExport.sizeFor(sz, dpi);
    const isPdf = fmt === "pdf";
    document.getElementById("mSize").textContent = `${sz.label} (${sz.note})`;

    /* the labels under the export buttons always describe what you will get */
    const bytesPerPx = fmt === "png" ? 0.46 : fmt === "jpeg" ? 0.11 : 0.07;
    const mb = (px.w * px.h * bytesPerPx) / 1048576;
    const mbTxt = mb > 1 ? mb.toFixed(1) + " MB" : Math.round(mb * 1024) + " KB";
    document.getElementById("sizeFront").textContent = isPdf
      ? `PDF · ${sz.w}×${sz.h} mm`
      : `${px.w}×${px.h} · ~${mbTxt}`;
    document.getElementById("sizeBack").textContent = isPdf
      ? `PDF · ${sz.w}×${sz.h} mm`
      : `${px.w}×${px.h} · ~${mbTxt}`;
    document.getElementById("sizeFront").setAttribute("data-mb", mbTxt);
    const sizeBoth = document.getElementById("sizeBoth");
    if (sizeBoth) sizeBoth.textContent = isPdf ? "2 PDFs · .zip" : `${(mb * 2).toFixed(1)} MB · .zip`;

    const copy = FORMAT_COPY[fmt] || FORMAT_COPY.png;
    const hint = document.getElementById("fmtHint");
    if (hint) hint.innerHTML = copy.hint;
    const note = document.getElementById("exportNote");
    if (note) note.innerHTML = copy.note;

    document.getElementById("specDpi").textContent = `${dpi} DPI export`;

    const { list } = computeChecks();
    document.getElementById("printChecks").innerHTML = list.map((c) =>
      `<div class="pc-check ${c.ok ? "" : "bad"}"><span class="tick">${c.ok ? ICON_CHECK : ICON_WARN}</span><span>${c.label}</span></div>`
    ).join("");
    document.querySelectorAll("[data-px]").forEach((n) => {
      const d = parseInt(n.dataset.px, 10);
      const p = CardExport.sizeFor(sz, d);
      if (d === 300) n.textContent = "print standard";
      else if (d === 600) n.textContent = `${p.w}×${p.h}`;
      else n.textContent = `${p.w}×${p.h}`;
    });
  }

  document.querySelectorAll('input[name="fmt"], input[name="dpi"]').forEach((r) => {
    r.addEventListener("change", refreshModal);
  });

  function setBusy(on, text) {
    busy.classList.toggle("on", on);
    if (text) busyText.textContent = text;
  }

  async function runExport(sides) {
    const dpi = curDpi(), fmt = curFormat();
    const isPdf = fmt === "pdf";
    const what = sides.length > 1 ? "both sides" : sides[0] + " side";
    setBusy(true, isPdf ? `Building ${what} as PDF at ${dpi} DPI…` : `Rendering ${what} at ${dpi} DPI…`);
    try {
      /* the selected format drives every button — PNG, JPEG and PDF alike */
      const files = isPdf
        ? await CardExport.exportPDF({
            state, theme: theme(), size: size(), dpi, sides,
            onProgress: (side) => setBusy(true, `Building PDF — ${side}…`)
          })
        : await CardExport.exportFiles({
            state, theme: theme(), size: size(), dpi, format: fmt, sides,
            onProgress: (side) => setBusy(true, `Rendering ${side} at ${dpi} DPI…`)
          });

      const enc = new TextEncoder();
      const packed = [];
      for (const f of files) {
        packed.push({ name: f.name, bytes: new Uint8Array(await f.blob.arrayBuffer()) });
      }
      packed.push({ name: "PRINT-SPEC.txt", bytes: enc.encode(specText(dpi, size(), fmt)) });

      const stamp = `${size().w}x${size().h}mm_bleed3mm_${dpi}dpi`;
      const zipName = isPdf
        ? "card_print-ready-pdf_" + stamp + ".zip"
        : "card_" + sides.join("+") + "_" + stamp + ".zip";
      const zipBlob = CardExport.zip(packed);

      /* start the direct download, then always show the result gallery */
      if (files.length === 1) CardExport.save(files[0].blob, files[0].name);
      else CardExport.save(zipBlob, zipName);

      showResults(files, zipBlob, zipName, dpi, fmt);
      const label = isPdf ? "PDF" : fmt.toUpperCase();
      toast(files.length === 1
        ? `${label} ready — ${sides[0]} side at ${dpi} DPI`
        : `${label} ready — front + back at ${dpi} DPI`);
    } catch (err) {
      console.error(err);
      toast("Export failed — " + err.message, "err");
    } finally {
      setBusy(false);
    }
  }

  function thumbURL(canvas, maxW) {
    const scale = Math.min(1, (maxW || 520) / canvas.width);
    const c = document.createElement("canvas");
    c.width = Math.round(canvas.width * scale);
    c.height = Math.round(canvas.height * scale);
    const ctx = c.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(canvas, 0, 0, c.width, c.height);
    return c.toDataURL("image/png");
  }

  function bytesLabel(n) {
    return n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.round(n / 1024) + " KB";
  }

  function inSubframe() {
    try { return window.top !== window.self; } catch (e) { return true; }
  }

  function showResults(results, zipBlob, zipName, dpi, fmt) {
    const box = document.getElementById("exportResult");
    const many = results.length > 1;
    const isPdf = fmt === "pdf";
    const label = isPdf ? "PDF" : (fmt || "png").toUpperCase();
    box.hidden = false;
    box.innerHTML = `
      <h4>${many ? "Both sides are ready" : "Your card is ready"} <span class="er-fmt">${label}</span></h4>
      <div class="er-sub">${dpi} DPI · ${results[0].canvas.width} × ${results[0].canvas.height} px · 3 mm bleed included${isPdf ? " · crop marks + TrimBox/BleedBox" : ""}</div>
      <div class="er-grid ${many ? "" : "one"}">
        ${results.map((r, i) => `
          <div class="er-item">
            <div class="er-thumb"><img src="${thumbURL(r.canvas, many ? 420 : 560)}" alt="${r.side} preview"></div>
            <div class="er-meta"><b>${r.side === "front" ? "Front" : "Back"}</b>${r.name}<br>${bytesLabel(r.blob.size)}</div>
            <div class="er-btns">
              <button class="btn" type="button" data-save="${i}">Save file</button>
              <button class="btn ghost" type="button" data-open="${i}" title="Open in a new tab">Open</button>
            </div>
          </div>`).join("")}
      </div>
      ${many ? `<div class="er-btns" style="margin-top:10px"><button class="btn primary" type="button" id="btnSaveZip" style="flex:1;padding:9px">Save both as ZIP (${bytesLabel(zipBlob.size)})</button></div>` : ""}
      <div class="er-hint">
        ${isPdf
          ? `<b>Hand this to the printer.</b> Each PDF holds the artwork at ${dpi} DPI plus vector crop marks, with TrimBox ${size().w} × ${size().h} mm and BleedBox +3 mm — they will know exactly where to cut.`
          : `<b>Download did not start?</b> Some embedded previews block file downloads. Right-click a card preview above and choose <b>“Save image as…”</b> — the preview is a stand-in for the full-resolution file, so use the <b>Save file</b> button (or open the app in its own browser tab) to get the real ${dpi} DPI artwork.`}
      </div>
      ${inSubframe() ? `<div class="sub-warn on">This studio is running inside an embedded preview, which can block downloads. Open the app in a new browser tab for one-click downloads.</div>` : ""}`;

    box.querySelectorAll("[data-save]").forEach((b) => {
      b.addEventListener("click", () => {
        const r = results[parseInt(b.dataset.save, 10)];
        CardExport.save(r.blob, r.name);
        toast("Saving " + r.name);
      });
    });
    box.querySelectorAll("[data-open]").forEach((b) => {
      b.addEventListener("click", () => {
        const r = results[parseInt(b.dataset.open, 10)];
        const url = URL.createObjectURL(r.blob);
        const w = window.open(url, "_blank");
        if (!w) { toast("Pop-up blocked — use Save file instead", "err"); URL.revokeObjectURL(url); }
      });
    });
    const bz = document.getElementById("btnSaveZip");
    if (bz) bz.addEventListener("click", () => { CardExport.save(zipBlob, zipName); toast("Saving " + zipName); });
    box.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function specText(dpi, sz, fmt) {
    const px = CardExport.sizeFor(sz, dpi);
    const isPdf = fmt === "pdf";
    const assembly = isPdf
      ? [
          "Each PDF contains the artwork at the stated DPI plus vector crop marks,",
          "with TrimBox, BleedBox and ArtBox set. Print at 100% scale and let the",
          "crop marks guide the cut — nothing needs to be resized."
        ]
      : [
          `Print the ${(fmt || "png").toUpperCase()} files at 100% scale with the 3 mm bleed included,`,
          "then trim to the finished size. The artwork runs past the cut line, so a",
          "millimetre of drift will not leave a white edge."
        ];
    return [
      "CARDSTOCK — PRINT SPECIFICATION",
      "===============================",
      "",
      `Trim size      : ${sz.w} x ${sz.h} mm  (${(sz.w / 25.4).toFixed(2)} x ${(sz.h / 25.4).toFixed(2)} in)`,
      `Bleed          : 3 mm on every edge`,
      `Full file size : ${(sz.w + 6).toFixed(1)} x ${(sz.h + 6).toFixed(1)} mm`,
      `Safe margin    : 3.5 mm inside the trim line`,
      `Resolution     : ${dpi} DPI (${px.w} x ${px.h} px)`,
      `File format    : ${isPdf ? "PDF with crop marks (TrimBox + BleedBox)" : (fmt || "png").toUpperCase()}`,
      `Colour profile : sRGB (convert to CMYK if your printer requires it)`,
      `Smallest type  : 8 pt minimum`,
      "",
      "ASSEMBLY",
      "--------",
      ...assembly,
      "",
      `Theme: ${theme().name}`,
      `Recipient: ${state.recipient || "—"}`,
      `Generated by Cardstock on ${new Date().toLocaleDateString()}`
    ].join("\n");
  }

  document.getElementById("btnDlFront").addEventListener("click", () => runExport(["front"]));
  document.getElementById("btnDlBack").addEventListener("click", () => runExport(["back"]));
  document.getElementById("btnDlBoth").addEventListener("click", () => runExport(["front", "back"]));

  /* ---------------------------------------------------------------- controls sync */
  function syncControls() {
    document.querySelectorAll("#themeGrid .theme-card").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.theme === state.themeId));
    });
    document.querySelectorAll("#frontLayoutSeg button").forEach((b, i) => {
      b.setAttribute("aria-pressed", String(FRONT_LAYOUTS[i].id === state.frontLayout));
    });
    document.querySelectorAll("#backLayoutSeg button").forEach((b, i) => {
      b.setAttribute("aria-pressed", String(BACK_LAYOUTS[i].id === state.backLayout));
    });
    document.querySelectorAll("#fontSeg button").forEach((b, i) => {
      b.setAttribute("aria-pressed", String(Object.keys(FONT_STYLES)[i] === state.fontStyle));
    });
    document.querySelectorAll("#densitySeg button").forEach((b, i) => {
      b.setAttribute("aria-pressed", String(["minimal", "balanced", "rich"][i] === state.density));
    });
    document.querySelectorAll("#sideSeg button").forEach((b) => {
      b.setAttribute("aria-pressed", String(b.dataset.side === state.viewSide));
    });
    if (inpRecipient.value !== state.recipient) inpRecipient.value = state.recipient;
    if (inpEyebrow.value !== state.eyebrow) inpEyebrow.value = state.eyebrow;
    if (inpOccasion.value !== state.occasion) inpOccasion.value = state.occasion;
    if (inpMessage.value !== state.message) inpMessage.value = state.message;
    if (inpSender.value !== state.sender) inpSender.value = state.sender;
    msgCounter.textContent = (state.message || "").length + " chars";
    msgSize.value = state.messageSize;
    msgSizeVal.textContent = state.messageSize + " pt";
    handFont.checked = !!state.handFont;
    showSender.checked = !!state.showSender;
    showGuides.checked = !!state.showGuides;
    selSize.value = state.sizeKey;
    document.getElementById("specSize").textContent = size().label;
    document.getElementById("specDpi").textContent = `${curDpi()} DPI export`;
    zoom.value = state.zoom; zoomVal.textContent = state.zoom + "%";
    buildSwatches();
    buildIconTray();
  }

  /* ---------------------------------------------------------------- extras */
  function randomize() {
    const t = THEMES.filter((x) => x.id !== state.themeId);
    const pick = t[Math.floor(Math.random() * t.length)];
    state.themeId = pick.id;
    state.fontStyle = pick.fontStyle;
    state.frontLayout = FRONT_LAYOUTS[Math.floor(Math.random() * FRONT_LAYOUTS.length)].id;
    state.backLayout = BACK_LAYOUTS[Math.floor(Math.random() * BACK_LAYOUTS.length)].id;
    state.accentOverride = "";
    state.icons = null;
    state.density = ["minimal", "balanced", "rich"][Math.floor(Math.random() * 3)];
    render();
    toast(pick.name + " — " + pick.blurb);
  }
  document.getElementById("btnRandom").addEventListener("click", randomize);

  const btnReset = document.getElementById("btnReset");
  if (btnReset) btnReset.addEventListener("click", () => {
    state = Object.assign({}, DEFAULTS);
    render();
    toast("Back to the starting card");
  });

  /* boot */
  function boot() {
    buildThemeGrid();
    buildControllers();
    render();
    document.getElementById("specSize").textContent = size().label;
    document.getElementById("mSize").textContent = size().label + " (" + size().note + ")";
    refreshModal();

    window.addEventListener("resize", () => {
      layoutStage();
      CardFit.fitCard(cardsEl);
    });
    new ResizeObserver(() => { layoutStage(); }).observe(document.querySelector(".cards-scroll"));

    document.fonts.ready.then(() => {
      CardFit.fitCard(cardsEl);
      updateChecks();
      setTimeout(() => { CardFit.fitCard(cardsEl); updateChecks(); }, 150);
    });
    setTimeout(() => {
      document.body.classList.add("ready");
    }, 60);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  /* expose a tiny debug/automation hook */
  window.CardStudio = {
    get state() { return state; },
    set(patch) { Object.assign(state, patch); render(); },
    render, theme, size, computeChecks, refreshModal
  };
})();
