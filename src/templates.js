/* ==========================================================================
   Cardstock — card renderers (front + back)
   All measurements are expressed in millimetres and multiplied by --p
   (pixels-per-mm), so a card can be drawn at preview size or at 1200 DPI
   from the exact same markup.
   ========================================================================== */
(function (global) {
  "use strict";

  const BLEED = 3;            // mm
  const SAFE = 3.5;           // mm inside the trim line

  /* ---------- tiny helpers ---------- */
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");

  const mm = (n) => `calc(${n} * var(--p))`;

  function icon(name, color, cls, style) {
    if (!name || !global.CardIcons) return "";
    const svg = global.CardIcons.svgFor(name).replace(/currentColor/g, color || "currentColor");
    return `<span class="ic ${cls || ""}" style="color:${color};${style || ""}">${svg}</span>`;
  }

  /* deterministic pseudo-random so every render is identical */
  function rng(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ======================================================================
     BACKGROUND ART — always covers the full bleed area
     ====================================================================== */
  function decor(theme) {
    const t = theme;
    const A = t.accent, A2 = t.accent2, P = t.pop;
    const r = rng(t.id.length * 977 + 31);

    const wrap = (inner, extra) => `<div class="art ${t.decor}" style="--art-a:${A};--art-b:${A2};--art-p:${P};${extra || ""}">${inner}</div>`;

    switch (t.decor) {
      case "glow": {
        return wrap(`
          <svg class="art-glow" viewBox="0 0 190 136" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <radialGradient id="g1" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="${A}" stop-opacity="0.55"/>
                <stop offset="100%" stop-color="${A}" stop-opacity="0"/>
              </radialGradient>
              <radialGradient id="g2" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="${P}" stop-opacity="0.4"/>
                <stop offset="100%" stop-color="${P}" stop-opacity="0"/>
              </radialGradient>
              <radialGradient id="g3" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="${A2}" stop-opacity="0.35"/>
                <stop offset="100%" stop-color="${A2}" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <ellipse cx="24" cy="14" rx="76" ry="60" fill="url(#g1)"/>
            <ellipse cx="176" cy="126" rx="72" ry="58" fill="url(#g2)"/>
            <ellipse cx="168" cy="10" rx="52" ry="44" fill="url(#g3)"/>
          </svg>
          <svg class="art-stars" viewBox="0 0 190 136" aria-hidden="true">
            ${Array.from({ length: 26 }).map(() => {
              const x = (r() * 190).toFixed(1), y = (r() * 136).toFixed(1);
              const s = (0.5 + r() * 1.1).toFixed(2);
              const c = r() > 0.55 ? A2 : (r() > 0.5 ? P : t.ink);
              return `<circle cx="${x}" cy="${y}" r="${s}" fill="${c}" opacity="${(0.18 + r() * 0.45).toFixed(2)}"/>`;
            }).join("")}
          </svg>`);
      }

      case "sunburst": {
        const rays = Array.from({ length: 22 }).map((_, i) => {
          const a = (i / 22) * 360;
          return `<rect x="189" y="-1.6" width="64" height="3.2" rx="1.4" fill="${A}" opacity="0.11"
                    transform="rotate(${a} 190 0)"/>`;
        }).join("");
        return wrap(`
          <svg class="art-rays" viewBox="0 0 190 136" aria-hidden="true">${rays}</svg>
          <svg class="art-wave" viewBox="0 0 190 136" preserveAspectRatio="none" aria-hidden="true">
            <path d="M-4 122c22-9 40 6 62 0s38-12 60-5 40 10 76 2v22H-4Z" fill="${A2}" opacity="0.16"/>
            <path d="M-4 128c26-7 44 5 66 0s36-10 58-4 44 8 74 1v16H-4Z" fill="${A}" opacity="0.13"/>
          </svg>`);
      }

      case "confetti":
      case "confettiMint": {
        const mint = t.decor === "confettiMint";
        const cols = mint ? [A, A2, P, t.ink] : [A, A2, P, "#FFFFFF"];
        const shapes = Array.from({ length: 34 }).map(() => {
          const x = (r() * 190).toFixed(1), y = (r() * 136).toFixed(1);
          const c = cols[Math.floor(r() * cols.length)];
          const o = (0.16 + r() * 0.4).toFixed(2);
          const k = r();
          if (k < 0.4) return `<circle cx="${x}" cy="${y}" r="${(0.7 + r() * 1.5).toFixed(2)}" fill="${c}" opacity="${o}"/>`;
          if (k < 0.72) return `<rect x="${x}" y="${y}" width="${(1.4 + r() * 2.4).toFixed(2)}" height="${(0.7 + r() * 0.9).toFixed(2)}" rx="0.4" fill="${c}" opacity="${o}" transform="rotate(${(r() * 180).toFixed(0)} ${x} ${y})"/>`;
          return `<path d="M${x} ${y}q2.2-2.6 4.4 0" fill="none" stroke="${c}" stroke-width="1" stroke-linecap="round" opacity="${o}"/>`;
        }).join("");
        return wrap(`<svg class="art-confetti" viewBox="0 0 190 136" aria-hidden="true">${shapes}</svg>`);
      }

      case "paws": {
        const pawSvg = global.CardIcons.svgFor("paw");
        const spots = [[-14, -10, 34, 0.06], [150, 96, 40, 0.07], [162, -16, 30, 0.05], [-24, 104, 28, 0.05], [86, 128, 22, 0.05]];
        return wrap(spots.map(([x, y, s, o]) =>
          `<span class="art-paw" style="left:${mm(x)};top:${mm(y)};width:${mm(s)};opacity:${o};color:${A}">${pawSvg.replace(/currentColor/g, A)}</span>`
        ).join("") + `<div class="art-blush"></div>`);
      }

      case "route": {
        return wrap(`
          <svg class="art-route" viewBox="0 0 190 136" aria-hidden="true">
            <path d="M-10 128C26 122 34 104 62 100s30 12 52 6 30-26 52-32"
                  fill="none" stroke="${A}" stroke-width="0.75" stroke-dasharray="3 3" opacity="0.26"/>
            <circle cx="62" cy="100" r="1.5" fill="${A}" opacity="0.35"/>
            <circle cx="114" cy="106" r="1.5" fill="${A}" opacity="0.35"/>
            <g transform="translate(172 26) rotate(28) scale(1.5)" opacity="0.5">
              <path d="M0 0 12 -6 4.2 -0.4 4.2 2.6 0 0Z" fill="${A}"/>
              <path d="M4.2 -0.4 4.2 2.6 7 -0.9Z" fill="${A2}"/>
            </g>
          </svg>
          <div class="art-grid"></div>`);
      }

      case "gold": {
        return wrap(`
          <svg class="art-gold" viewBox="0 0 190 136" aria-hidden="true">
            ${Array.from({ length: 30 }).map(() => {
              const x = (r() * 190).toFixed(1), y = (r() * 136).toFixed(1);
              return `<circle cx="${x}" cy="${y}" r="${(0.4 + r() * 0.9).toFixed(2)}" fill="${A}" opacity="${(0.12 + r() * 0.3).toFixed(2)}"/>`;
            }).join("")}
            <g stroke="${A}" stroke-width="0.7" fill="none" opacity="0.35">
              <path d="M-2 8c14 3 22 10 26 24"/>
              <path d="M-2 20c10 2 16 8 19 18"/>
              <path d="M192 128c-14-3-22-10-26-24"/>
              <path d="M192 116c-10-2-16-8-19-18"/>
            </g>
            <g fill="${A}" opacity="0.4">
              <circle cx="18" cy="26" r="1.1"/><circle cx="12" cy="36" r="0.8"/>
              <circle cx="172" cy="112" r="1.1"/><circle cx="178" cy="102" r="0.8"/>
            </g>
          </svg>`);
      }

      /* ---- the themes added with the racing / flower / cat sets draw their
         art in real millimetres (viewBox 68 × 95 = the bleed size), so a strip
         along the bottom edge really sits on the bottom edge ---- */
      case "checker": {
        const sq = 3.6, cells = [];
        for (let c = 0; c < 20; c++) {
          for (let row = 0; row < 2; row++) {
            if ((row + c) % 2) continue;
            const x = (c * sq).toFixed(2), yTop = (row * sq).toFixed(2), yBot = (95 - (row + 1) * sq).toFixed(2);
            cells.push(`<rect x="${x}" y="${yTop}" width="${sq}" height="${sq}" fill="${t.ink}" opacity="0.92"/>`);
            cells.push(`<rect x="${x}" y="${yBot}" width="${sq}" height="${sq}" fill="${t.ink}" opacity="0.92"/>`);
          }
        }
        const streaks = [0, 1, 2, 3].map((i) =>
          `<rect x="4" y="${(30 + i * 11).toFixed(1)}" width="${(30 - i * 4).toFixed(1)}" height="1.1" rx="0.55"
             fill="${A}" opacity="${(0.20 - i * 0.035).toFixed(2)}" transform="skewX(-24)"/>`).join("");
        return wrap(`<svg class="art-checker" viewBox="0 0 68 95" preserveAspectRatio="none" aria-hidden="true">${cells.join("")}${streaks}</svg>`);
      }

      case "petals": {
        const petals = Array.from({ length: 40 }).map(() => {
          const x = (r() * 68).toFixed(2), y = (r() * 95).toFixed(2);
          const rx = (0.5 + r() * 0.75).toFixed(2), ry = (0.32 + r() * 0.45).toFixed(2);
          const rot = (r() * 180).toFixed(0);
          const c = [A, A2, P][Math.floor(r() * 3)];
          return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${c}" opacity="${(0.16 + r() * 0.28).toFixed(2)}"
                    transform="rotate(${rot} ${x} ${y})"/>`;
        }).join("");
        return wrap(`
          <svg class="art-petals" viewBox="0 0 68 95" preserveAspectRatio="none" aria-hidden="true">
            <ellipse cx="2" cy="6" rx="26" ry="22" fill="${A}" opacity="0.055"/>
            <ellipse cx="66" cy="90" rx="24" ry="20" fill="${A2}" opacity="0.06"/>
            ${petals}
          </svg>`);
      }

      case "meadow": {
        const blades = Array.from({ length: 48 }).map(() => {
          const x = (r() * 70 - 1).toFixed(2);
          const h = (3 + r() * 9).toFixed(1);
          const lean = ((r() - 0.5) * 4).toFixed(1);
          return `<path d="M${x} 32q${lean} -${(h * 0.55).toFixed(1)} ${lean} -${h}" fill="none"
                    stroke="${A2}" stroke-width="0.45" stroke-linecap="round" opacity="${(0.18 + r() * 0.3).toFixed(2)}"/>`;
        }).join("");
        const heads = Array.from({ length: 10 }).map(() => {
          const x = (2 + r() * 64).toFixed(1), y = (24 + r() * 6).toFixed(1);
          const c = [A, P, "#FFFFFF"][Math.floor(r() * 3)];
          return `<g opacity="${(0.5 + r() * 0.3).toFixed(2)}" transform="translate(${x} ${y}) scale(0.42)">
            ${Array.from({ length: 5 }).map((_, i) =>
              `<ellipse cx="0" cy="-1.9" rx="1.35" ry="2" fill="${c}" transform="rotate(${i * 72})"/>`).join("")}
            <circle r="1" fill="${A2}"/>
          </g>`;
        }).join("");
        return wrap(`
          <svg class="art-meadow" viewBox="0 0 68 32" preserveAspectRatio="none" aria-hidden="true">${blades}</svg>
          <svg class="art-meadow" viewBox="0 0 68 32" preserveAspectRatio="none" aria-hidden="true">${heads}</svg>`);
      }

      case "sakura": {
        /* seigaiha: rows of overlapping arcs along the very bottom */
        const arcs = [];
        for (let row = 0; row < 3; row++) {
          const y = 95 - row * 5.6;
          const off = (row % 2) * 5.5;
          for (let x = -5.5 + off; x < 72; x += 11) {
            arcs.push(`<path d="M${x.toFixed(1)} ${y.toFixed(1)}a5.5 5.5 0 0 1 11 0" fill="none" stroke="${A2}" stroke-width="0.42" opacity="0.30"/>`);
            arcs.push(`<path d="M${(x + 1.8).toFixed(1)} ${y.toFixed(1)}a3.7 3.7 0 0 1 7.4 0" fill="none" stroke="${A2}" stroke-width="0.42" opacity="0.24"/>`);
            arcs.push(`<path d="M${(x + 3.6).toFixed(1)} ${y.toFixed(1)}a1.9 1.9 0 0 1 3.8 0" fill="none" stroke="${A2}" stroke-width="0.42" opacity="0.18"/>`);
          }
        }
        const blossoms = Array.from({ length: 13 }).map((_, i) => {
          let bx, by;
          if (i < 9) {                                   /* side margins */
            bx = i % 2 ? 1 + r() * 10 : 57 + r() * 10;
            by = 8 + r() * 74;
          } else {                                       /* above the name */
            bx = 12 + r() * 44;
            by = 3 + r() * 18;
          }
          if (bx < 27 && by < 27) bx += 30;              /* keep clear of the mascot */
          const x = bx.toFixed(1), y = by.toFixed(1);
          const sc = (0.16 + r() * 0.18).toFixed(2);
          const c = r() > 0.45 ? A : P;
          return `<g transform="translate(${x} ${y}) scale(${sc}) rotate(${(r() * 360).toFixed(0)})" opacity="${(0.35 + r() * 0.35).toFixed(2)}">
            ${Array.from({ length: 5 }).map((_, i) =>
              `<path d="M0 0C-1.7-1.2-2.3-3.1-1.5-4.6-.7-5.1-.4-5.1 0-4.1.4-5.1.7-5.1 1.5-4.6 2.3-3.1 1.7-1.2 0 0Z"
                     fill="${c}" transform="rotate(${i * 72 + 90})"/>`).join("")}
            <circle r="1" fill="${A2}"/>
          </g>`;
        }).join("");
        return wrap(`<svg class="art-sakura" viewBox="0 0 68 95" preserveAspectRatio="none" aria-hidden="true">${arcs.join("")}${blossoms}</svg>`);
      }

      case "dots":
      default:
        return wrap(`<div class="art-dotgrid"></div><div class="art-blotch"></div>`);
    }
  }

  /* ======================================================================
     FRONT
     ====================================================================== */
  /* Slots are laid out on an ellipse for the vertical 62 × 89 mm card:
     x runs ±31 from the centre, y runs ±44.5, so the ring is tall and narrow.
     Ordered clockwise from the top so icon colour rotation reads evenly. */
  const HALO_SLOTS = [
    /* x, y (mm from the trim centre), scale, rotation.
       The plate owns the middle band, so the icons ring above and below it. */
    [0, -38.2, 0.95, -5],
    [12, -36.4, 0.82, 7],
    [21, -31.6, 0.88, -9],
    [25.4, -25.0, 0.80, 11],
    [26.4, -13.0, 0.64, -6],
    [26.4, 13.0, 0.64, 8],
    [25.4, 25.0, 0.84, -7],
    [21, 31.6, 0.90, 9],
    [12, 36.4, 0.80, -11],
    [0, 38.2, 0.86, 4],
    [-12, 36.4, 0.78, -6],
    [-21, 31.6, 0.90, 12],
    [-25.4, 25.0, 0.82, -10],
    [-26.4, 13.0, 0.64, 6],
    [-26.4, -13.0, 0.66, -8],
    [-25.4, -25.0, 0.88, 8],
    [-21, -31.6, 0.86, -12],
    [-12, -36.4, 0.80, 5]
  ];

  const CONFETTI_SLOTS = [
    [-22, -36.0, 1.00, -12],
    [2, -38.0, 0.90, 6],
    [23, -35.0, 1.05, 10],
    [-26.2, -26.0, 0.85, -8],
    [26.0, -25.0, 0.80, 12],
    [-26.4, -8.0, 0.74, -14],
    [26.2, -8.0, 0.72, 8],
    [-26.2, 8.0, 0.72, 10],
    [26.2, 10.0, 0.74, -10],
    [-24.0, 24.0, 0.85, -6],
    [24.0, 23.0, 0.90, 14],
    [-13.0, 32.0, 1.00, 8],
    [0, 33.0, 0.80, -10],
    [13.0, 32.0, 0.86, 5]
  ];

  const DENSITY = { minimal: 6, balanced: 10, rich: 14 };
  function iconsFor(state, t) {
    const pool = (state.icons && state.icons.length) ? state.icons : t.icons;
    const n = DENSITY[state.density] || 10;
    if (!pool.length) return [];
    /* a mascot illustration is drawn large elsewhere, never shrunk to icon size */
    const isM = global.CardIcons.isMascot || ((ic) => /^bichon/.test(ic));
    const ring = pool.filter((ic) => !isM(ic));
    const use = ring.length ? ring : pool;
    const out = [];
    for (let i = 0; i < n; i++) out.push(use[i % use.length]);
    return out;
  }

  function mascot(t, cls, style) {
    if (!t.mascot) return "";
    const svg = global.CardIcons.svgFor(t.mascot);
    return `<span class="mascot ${cls || ""}" style="${style || ""}">${svg}</span>`;
  }

  /* the mascot owns a corner of the card; pins underneath it are dropped */
  const MASCOT_BOX = {
    tl: { x0: -31, x1: -8.5, y0: -45, y1: -21 },
    br: { x0: 10, x1: 31, y0: 24, y1: 45 }
  };
  function slotsFor(slots, t, corner) {
    if (!t.mascot) return slots;
    const b = MASCOT_BOX[corner] || MASCOT_BOX.tl;
    const kept = slots.filter((s) => !(s[0] >= b.x0 && s[0] <= b.x1 && s[1] >= b.y0 && s[1] <= b.y1));
    return kept.length >= 6 ? kept : slots;
  }

  function placeIcons(icons, slots, colorFor, cls) {
    const use = icons.slice(0, slots.length);
    return use.map((name, i) => {
      const s = slots[i % slots.length];
      const size = (5.6 * s[2]).toFixed(2);
      return `<span class="pin ${cls || ""}" style="--x:${s[0]};--y:${s[1]};--r:${s[3]}deg;--s:${size}">
        ${icon(name, colorFor(i), "pin-ic")}
      </span>`;
    }).join("");
  }

  function nameBlock(state, t, opts) {
    const o = opts || {};
    return `<div class="name ${o.cls || ""}" data-fit="name">${esc(state.recipient || "Your Name Here")}</div>`;
  }

  function front(state, t, opts) {
    const icons = iconsFor(state, t);
    const layout = state.frontLayout;
    const pv = !!opts.preview;
    const eyebrow = state.eyebrow || (pv ? "A LITTLE SOMETHING FOR" : "");
    const occasion = state.occasion || t.occasion;
    const ic = (i) => i % 3 === 2 ? t.accent2 : (i % 3 === 1 ? t.pop : t.accent);
    const name = esc(state.recipient || (pv ? "Your Name Here" : ""));

    const head = `
      <div class="eyebrow fit-line" data-fit="line" data-min="8">${esc(eyebrow)}</div>
      <div class="name-wrap"><div class="name" data-fit="name" data-max="26" data-min="12" data-pref="single" data-single-min="14.5">${name}</div></div>
      <div class="occasion fit-line" data-fit="line" data-min="9">${esc(occasion)}</div>`;

    if (layout === "frame") {
      const topRow = icons.slice(0, 5);
      const botRow = icons.slice(5, 8);
      return `
        ${decor(t)}
        <div class="ly frame ${t.dark ? "is-dark" : ""}">
          <div class="frame-rule outer"></div>
          <div class="frame-rule inner"></div>
          <div class="frame-corner tl">${icon(icons[0], t.accent, "corner-ic")}</div>
          <div class="frame-corner tr">${icon(icons[1], t.accent2, "corner-ic")}</div>
          <div class="frame-corner bl">${icon(icons[2], t.pop, "corner-ic")}</div>
          <div class="frame-corner br">${icon(icons[3], t.accent, "corner-ic")}</div>
          <div class="frame-garland top">${topRow.map((n, i) => icon(n, i % 2 ? t.accent2 : t.accent, "garland-ic")).join("")}</div>
          <div class="central">
            ${head}
            <div class="frame-dots"><i></i><i></i><i></i></div>
          </div>
          <div class="frame-garland bottom">${botRow.map((n, i) => icon(n, i % 2 ? t.pop : t.accent2, "garland-ic small")).join("")}</div>
        </div>`;
    }

    if (layout === "ticket") {
      const row = icons.slice(0, 6);
      const row2 = icons.slice(6, 10);
      return `
        ${decor(t)}
        <div class="ly ticket ${t.dark ? "is-dark" : ""}">
          <div class="tick-row top">${row.map((n, i) => icon(n, i % 2 ? t.accent2 : t.accent, "tick-ic")).join("")}</div>
          <div class="band-wrap">
            <div class="band">
              <div class="perf left"></div><div class="perf right"></div>
              <div class="band-inner">
                <div class="eyebrow band-eye fit-line" data-fit="line" data-min="8">${esc(eyebrow)}</div>
                <div class="name" data-fit="name" data-max="24" data-min="12" data-pref="single" data-single-min="14">${name}</div>
                <div class="band-divider"></div>
                <div class="occasion fit-line" data-fit="line" data-min="9">${esc(occasion)}</div>
              </div>
            </div>
          </div>
          <div class="tick-row bottom">${row2.map((n, i) => icon(n, i % 2 ? t.pop : t.accent, "tick-ic small")).join("")}</div>
        </div>`;
    }

    if (layout === "confetti") {
      return `
        ${decor(t)}
        <div class="ly confetti ${t.dark ? "is-dark" : ""}">
          ${mascot(t, "mascot-confetti")}
          <div class="field">${placeIcons(icons.slice(0, 14), slotsFor(CONFETTI_SLOTS, t, "br"), ic, "conf-pin")}</div>
          <div class="central">
            <svg class="blob" viewBox="0 0 200 90" aria-hidden="true" preserveAspectRatio="none">
              <path d="M96 2c46-4 92 8 99 30 7 23-22 44-63 50S21 84 8 66C-5 47 8 22 42 12 60 6 78 3 96 2Z" fill="${t.paper2}"/>
            </svg>
            <div class="eyebrow fit-line" data-fit="line" data-min="8">${esc(eyebrow)}</div>
            <div class="name-wrap"><div class="name" data-fit="name" data-max="22" data-min="12" data-pref="single" data-single-min="14">${name}</div></div>
            <svg class="squiggle" viewBox="0 0 120 12" aria-hidden="true">
              <path d="M3 8.4c14-4.6 26-4.6 40 0s26 4.6 40 0 24-3.8 34 0" fill="none"
                    stroke="${t.accent}" stroke-width="2.6" stroke-linecap="round"/>
            </svg>
            <div class="occasion fit-line" data-fit="line" data-min="9">${esc(occasion)}</div>
          </div>
        </div>`;
    }

    /* default: halo */
    const plateIcons = icons.slice(0, 14);
    return `
      ${decor(t)}
      <div class="ly halo ${t.dark ? "is-dark" : ""}">
        ${mascot(t, "mascot-halo")}
        <div class="field">${placeIcons(plateIcons, slotsFor(HALO_SLOTS, t, "tl"), ic, "halo-pin")}</div>
        <div class="central">
          <div class="eyebrow fit-line" data-fit="line" data-min="8">${esc(eyebrow)}</div>
          <div class="plate">
            <div class="plate-ghost"></div>
            <div class="plate-body">
              <div class="name" data-fit="name" data-max="26" data-min="12" data-pref="single" data-single-min="14.5">${name}</div>
            </div>
          </div>
          <div class="occasion fit-line" data-fit="line" data-min="9">${esc(occasion)}</div>
        </div>
      </div>`;
  }

  /* ======================================================================
     BACK
     ====================================================================== */
  function back(state, t, opts) {
    opts = opts || {};
    const layout = state.backLayout;
    const pv = !!opts.preview;
    const typed = state.message && state.message.trim().length;
    const msg = typed ? state.message.replace(/\s+$/, "")
      : (pv ? "Your message appears here — a memory, a thank you, or a joke only the two of you share." : "");
    const sender = (state.sender || "").trim();
    const recipient = (state.recipient || "").trim();
    const title = recipient ? `NOTE FOR ${recipient.toUpperCase()}` : (opts.preview ? "A NOTE FOR YOU" : "");
    const ic = (i) => [t.accent, t.accent2, t.pop][i % 3];
    const icons = iconsFor(state, t);
    const msgHtml = esc(msg);
    const sign = state.showSender
      ? `<div class="signature" data-fit="sign">${sender ? esc(sender) : (opts.preview ? "With love" : "")}</div>`
      : `<div class="signature" data-fit="sign">${esc(state.occasion || t.occasion)}</div>`;

    const body = `
      <div class="msg${msg ? "" : " msg-empty"}" data-fit="msg" data-min="8">${msgHtml}</div>`;

    if (layout === "card") {
      return `
        ${backDecor(t)}
        <div class="ly back note ${t.dark ? "is-dark" : ""}">
          <div class="back-head">
            <span class="back-title fit-line" data-fit="line" data-min="8">${esc(title)}</span>
            ${icon(icons[0] || "sparkle", t.accent, "head-ic")}
          </div>
          <div class="note-panel">
            <div class="note-mark">${icon(icons[2] || "sparkle", t.accent2, "mark-ic")}</div>
            ${body}
          </div>
          <div class="back-foot">${sign}<span class="foot-icons">${icon(icons[1], t.accent2, "foot-ic")}${icon(icons[3], t.pop, "foot-ic small")}</span></div>
        </div>`;
    }

    if (layout === "postcard") {
      return `
        ${backDecor(t)}
        <div class="ly back postcard ${t.dark ? "is-dark" : ""}">
          <div class="pc-frame">
            <div class="pc-stamp">${t.mascot ? mascot(t, "stamp-mascot") : icon(icons[0], t.accent, "stamp-ic")}</div>
            <div class="back-title fit-line" data-fit="line" data-min="8">${esc(title)}</div>
            ${body}
            <div class="pc-foot">
              ${sign}
              <span class="pc-rule"></span>
            </div>
          </div>
        </div>`;
    }

    if (layout === "plain") {
      return `
        ${backDecor(t)}
        <div class="ly back plain ${t.dark ? "is-dark" : ""}">
          ${body}
          <div class="plain-foot">${sign}</div>
        </div>`;
    }

    /* default: ruled */
    return `
      ${backDecor(t)}
      <div class="ly back ruled ${t.dark ? "is-dark" : ""}">
        <div class="back-head">
          <span class="back-title fit-line" data-fit="line" data-min="8">${esc(title)}</span>
          <span class="head-icons">${icon(icons[1], t.accent2, "head-ic")}${icon(icons[2], t.pop, "head-ic small")}</span>
        </div>
        <div class="rule-msg">
          ${body}
        </div>
        <div class="back-foot">
          ${sign}
          <span class="foot-icons">${icon(icons[0], t.accent, "foot-ic small")}</span>
        </div>
      </div>`;
  }

  /* Back decoration is deliberately quieter than the front */
  function backDecor(t) {
    if (t.decor === "glow") {
      return `<div class="art back-art glow-soft" style="--art-a:${t.accent};--art-b:${t.accent2};--art-p:${t.pop}">
        <svg class="art-glow" viewBox="0 0 190 136" preserveAspectRatio="none" aria-hidden="true">
          <defs><radialGradient id="bg1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="${t.accent}" stop-opacity="0.30"/>
            <stop offset="100%" stop-color="${t.accent}" stop-opacity="0"/>
          </radialGradient></defs>
          <ellipse cx="16" cy="130" rx="76" ry="58" fill="url(#bg1)"/>
        </svg></div>`;
    }
    if (t.decor === "sunburst" || t.decor === "route") {
      return `<div class="art back-art" style="--art-a:${t.accent};--art-b:${t.accent2};--art-p:${t.pop}">
        <svg class="art-wave" viewBox="0 0 190 136" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-4 130c26-7 44 4 66-1s36-10 58-4 44 8 74 1v14H-4Z" fill="${t.accent2}" opacity="0.12"/>
        </svg></div>`;
    }
    if (t.decor === "paws") {
      const pawSvg = global.CardIcons.svgFor("paw").replace(/currentColor/g, t.accent);
      return `<div class="art back-art" style="--art-a:${t.accent};--art-b:${t.accent2}">
        <span class="art-paw" style="left:${mm(-16)};top:${mm(96)};width:${mm(30)};opacity:.07">${pawSvg}</span>
        <span class="art-paw" style="left:${mm(152)};top:${mm(-14)};width:${mm(26)};opacity:.06">${pawSvg}</span>
      </div>`;
    }
    return `<div class="art back-art" style="--art-a:${t.accent};--art-b:${t.accent2};--art-p:${t.pop}"><div class="art-dotgrid soft"></div></div>`;
  }

  /* ======================================================================
     CARD ASSEMBLY
     ====================================================================== */
  function card(state, t, side, size, opts) {
    const o = opts || {};
    const sizeDef = size || global.CardThemes.SIZES.A;
    const W = sizeDef.w, H = sizeDef.h;
    const style = [
      `--cw:${W}`, `--ch:${H}`, `--bleed:${BLEED}`, `--safe:${SAFE}`,
      `--paper:${t.paper}`, `--paper2:${t.paper2}`, `--ink:${t.ink}`, `--ink-soft:${t.inkSoft}`,
      `--accent:${state.accentOverride || t.accent}`, `--accent2:${t.accent2}`, `--pop:${t.pop}`,
      `--on-accent:${t.onAccent}`, `--msg-pt:${state.messageSize}`, `--minpt:${state.messageSize}`,
      o.pxPerMm ? `--p:${o.pxPerMm}px` : ""
    ].filter(Boolean).join(";");

    const guides = o.guides ? `
      <div class="guides" aria-hidden="true">
        <div class="g-bleed"></div>
        <div class="g-trim"></div>
        <div class="g-safe"></div>
        <span class="g-label g-label-bleed">BLEED 3mm</span>
        <span class="g-label g-label-trim">TRIM ${W}×${H}mm</span>
      </div>` : "";

    return `<div class="card ${o.guides ? "show-guides" : ""} ${sizeDef.vertical ? "is-vertical" : ""} theme-${t.id} ${global.CardThemes.FONT_STYLES[state.fontStyle].css} ${side} ${t.dark ? "dark" : ""} ${side === "back" && state.handFont ? "back-font-hand" : ""}" data-side="${side}" style="${style}">
      <div class="bleed-bg"></div>
      ${side === "front" ? front(state, t, o) : back(state, t, o)}
      ${guides}
    </div>`;
  }

  global.CardTemplates = { card, front, back, esc, BLEED, SAFE };
})(window);
