/* ==========================================================================
   Cardstock — export engine
   DOM → SVG(foreignObject) → canvas at an exact pixel size → PNG/JPEG,
   plus a hand-built print PDF (TrimBox + BleedBox + crop marks) and a
   minimal store-only ZIP packer for the two-file download.
   ========================================================================== */
(function (global) {
  "use strict";

  const MM_PER_IN = 25.4;
  const PT_PER_MM = 72 / MM_PER_IN;
  const BLEED = 3;

  /* --------------------------------------------------------------------
     inline the computed style of every element in the subtree
     -------------------------------------------------------------------- */
  const PROPS = [
    "display", "position", "top", "right", "bottom", "left", "z-index", "float", "box-sizing",
    "width", "height", "min-width", "min-height", "max-width", "max-height",
    "margin-top", "margin-right", "margin-bottom", "margin-left",
    "padding-top", "padding-right", "padding-bottom", "padding-left",
    "border-top-width", "border-right-width", "border-bottom-width", "border-left-width",
    "border-top-style", "border-right-style", "border-bottom-style", "border-left-style",
    "border-top-color", "border-right-color", "border-bottom-color", "border-left-color",
    "border-top-left-radius", "border-top-right-radius", "border-bottom-left-radius", "border-bottom-right-radius",
    "background-color", "background-image", "background-repeat", "background-size", "background-position",
    "background-clip", "background-origin", "box-shadow", "opacity", "overflow",
    "transform", "transform-origin", "filter", "clip-path", "mix-blend-mode",
    "color", "font-family", "font-size", "font-weight", "font-style", "font-variant",
    "line-height", "letter-spacing", "word-spacing", "text-align", "text-transform", "text-decoration",
    "text-indent", "white-space", "overflow-wrap", "word-break", "text-wrap",
    "direction", "vertical-align", "list-style",
    "flex-direction", "flex-wrap", "flex-grow", "flex-shrink", "flex-basis",
    "align-items", "align-self", "align-content", "justify-content", "justify-items", "place-items",
    "gap", "row-gap", "column-gap", "order",
    "grid-template-columns", "grid-template-rows", "grid-auto-flow", "grid-auto-columns", "grid-auto-rows",
    "grid-column-start", "grid-column-end", "grid-row-start", "grid-row-end",
    "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "stroke-dasharray",
    "paint-order", "visibility"
  ];

  function inlineTree(node, src) {
    const cs = getComputedStyle(src);
    let css = "";
    for (let i = 0; i < PROPS.length; i++) {
      const v = cs.getPropertyValue(PROPS[i]);
      if (v && v !== "none" || PROPS[i] === "display") css += PROPS[i] + ":" + v + ";";
    }
    // keep custom properties the artwork depends on
    css += "--p:" + cs.getPropertyValue("--p").trim() + ";";
    node.setAttribute("style", css);
    const kids = src.children, knodes = node.children;
    for (let i = 0; i < kids.length && i < knodes.length; i++) inlineTree(knodes[i], kids[i]);
  }

  /* --------------------------------------------------------------------
     build the export DOM for one side
     -------------------------------------------------------------------- */
  function buildCard(state, theme, size, side, pxPerMm) {
    const stage = document.getElementById("exportStage");
    const html = global.CardTemplates.card(state, theme, side, size, { pxPerMm });
    stage.innerHTML = html;
    const el = stage.firstElementChild;
    // allow layout + fonts
    el.getBoundingClientRect();
    global.CardFit.fitCard(el);
    return el;
  }

  async function ensureFonts() {
    try { await document.fonts.ready; } catch (e) { }
    // force each face to actually load at the sizes we use
    const faces = ["Fraunces", "Inter", "Baloo 2", "Caveat", "Great Vibes"];
    await Promise.all(faces.map((f) => Promise.all([
      document.fonts.load('400 64px "' + f + '"'), document.fonts.load('600 24px "' + f + '"'),
      document.fonts.load('800 24px "' + f + '"'), document.fonts.load('500 24px "' + f + '"')
    ]).catch(() => { })));
  }

  function fontsCss() {
    if (global.CARD_FONTS_CSS) return global.CARD_FONTS_CSS;
    let out = [];
    const walk = (rules) => {
      for (const r of rules) {
        if (r.constructor.name === "CSSFontFaceRule") out.push(r.cssText);
        else if (r.cssRules) walk(r.cssRules);
      }
    };
    for (const s of document.styleSheets) { try { walk(s.cssRules); } catch (e) { } }
    return out.join("\n");
  }

  /* --------------------------------------------------------------------
     rasterise an element at W×H pixels
     -------------------------------------------------------------------- */
  function rasterize(el, W, H) {
    return new Promise((resolve, reject) => {
      const clone = el.cloneNode(true);
      inlineTree(clone, el);
      clone.style.position = "relative";
      clone.style.left = "0";
      clone.style.top = "0";
      clone.style.margin = "0";

      const holder = document.createElement("div");
      holder.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
      holder.style.cssText = "width:" + W + "px;height:" + H + "px;overflow:hidden;background:transparent;";
      const css = fontsCss();
      const styleEl = document.createElement("style");
      styleEl.textContent =
        "*{box-sizing:border-box}" +
        "html,body{margin:0;padding:0}" +
        css;
      holder.appendChild(styleEl);
      holder.appendChild(clone);

      const xml = new XMLSerializer().serializeToString(holder);
      const svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
        '<foreignObject x="0" y="0" width="' + W + '" height="' + H + '">' + xml + "</foreignObject></svg>";

      /* A data: URL keeps the canvas origin-clean (blob: URLs taint it, which
         would make toBlob() throw). Chrome allows very large data URLs, and the
         markup stays small because every measurement is in millimetres. */
      const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = W; canvas.height = H;
          const ctx = canvas.getContext("2d", { alpha: false });
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
          ctx.fillStyle = theme_paper(el);
          ctx.fillRect(0, 0, W, H);
          ctx.drawImage(img, 0, 0, W, H);
          /* prove the canvas is readable before handing it back */
          ctx.getImageData(0, 0, 1, 1);
          resolve(canvas);
        } catch (err) { reject(err); }
      };
      img.onerror = () => reject(new Error("SVG rasterisation failed"));
      img.src = url;
    });
  }

  function theme_paper(el) {
    const c = getComputedStyle(el).getPropertyValue("--paper").trim();
    return c || "#ffffff";
  }

  /* --------------------------------------------------------------------
     public: render one side to a canvas at a given DPI
     -------------------------------------------------------------------- */
  async function renderSide(side, opts) {
    const { state, theme, size } = opts;
    const dpi = opts.dpi || 300;
    const pxPerMm = dpi / MM_PER_IN;

    await ensureFonts();
    const el = buildCard(state, theme, size, side, pxPerMm);
    const W = Math.round(el.offsetWidth);
    const H = Math.round(el.offsetHeight);
    const canvas = await rasterize(el, W, H);
    document.getElementById("exportStage").innerHTML = "";
    canvas._dpi = dpi;
    canvas._pxPerMm = pxPerMm;
    canvas._mm = { w: size.w + BLEED * 2, h: size.h + BLEED * 2 };
    return canvas;
  }

  /* --------------------------------------------------------------------
     embed the physical resolution so the file itself carries its DPI
     -------------------------------------------------------------------- */
  function pngWithDpi(bytes, dpi) {
    const ppu = Math.round(dpi / 0.0254);
    const chunk = new Uint8Array(21);            // len(4) + type(4) + data(9) + crc(4)
    const dv = new DataView(chunk.buffer);
    dv.setUint32(0, 9);
    chunk.set([0x70, 0x48, 0x59, 0x73], 4);      // "pHYs"
    dv.setUint32(8, ppu);
    dv.setUint32(12, ppu);
    chunk[16] = 1;                               // unit = metre
    dv.setUint32(17, crc32(chunk.subarray(4, 17)));
    const head = bytes.subarray(0, 8);
    const ihdrLen = new DataView(bytes.buffer, bytes.byteOffset + 8, 4).getUint32(0);
    const cut = 8 + 12 + ihdrLen;                // after IHDR chunk
    const out = new Uint8Array(bytes.length + chunk.length);
    out.set(head, 0);
    out.set(bytes.subarray(8, cut), 8);
    out.set(chunk, cut);
    out.set(bytes.subarray(cut), cut + chunk.length);
    return out;
  }

  function jpegWithDpi(bytes, dpi) {
    const d = Math.min(65535, Math.round(dpi));
    // patch an existing JFIF APP0 if present
    if (bytes[2] === 0xFF && bytes[3] === 0xE0 && bytes[6] === 0x4A && bytes[7] === 0x46) {
      const out = bytes.slice();
      out[13] = 1;                     // units = dots per inch
      out[14] = (d >> 8) & 0xFF; out[15] = d & 0xFF;
      out[16] = (d >> 8) & 0xFF; out[17] = d & 0xFF;
      return out;
    }
    // otherwise insert a JFIF APP0 straight after SOI
    const app0 = new Uint8Array([
      0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01,
      (d >> 8) & 0xFF, d & 0xFF, (d >> 8) & 0xFF, d & 0xFF, 0x00, 0x00
    ]);
    const out = new Uint8Array(bytes.length + app0.length);
    out.set(bytes.subarray(0, 2), 0);
    out.set(app0, 2);
    out.set(bytes.subarray(2), 2 + app0.length);
    return out;
  }

  /* --------------------------------------------------------------------
     canvas → blob (with DPI metadata baked in)
     -------------------------------------------------------------------- */
  function toBlob(canvas, format, quality, dpi) {
    const d = dpi || canvas._dpi || 300;
    return new Promise((resolve) => {
      const finish = async (blob) => {
        try {
          const bytes = new Uint8Array(await blob.arrayBuffer());
          const tagged = format === "jpeg" ? jpegWithDpi(bytes, d) : pngWithDpi(bytes, d);
          resolve(new Blob([tagged], { type: blob.type }));
        } catch (e) { resolve(blob); }
      };
      if (format === "jpeg") canvas.toBlob(finish, "image/jpeg", quality || 0.95);
      else canvas.toBlob(finish, "image/png");
    });
  }

  function fileName(state, side, opts) {
    const size = opts.size;
    const slug = (s) => (s || "").toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 28);
    const who = slug(state.recipient) || "card";
    return "card-" + side + "_" + who + "_" + size.w + "x" + size.h + "mm_bleed3mm_" + opts.dpi + "dpi." + (opts.format === "jpeg" ? "jpg" : "png");
  }

  /* --------------------------------------------------------------------
     minimal ZIP (stored, no compression) — for the "both sides" download
     -------------------------------------------------------------------- */
  const CRC_TABLE = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })();

  function crc32(bytes) {
    let c = 0xFFFFFFFF;
    for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
    return (c ^ 0xFFFFFFFF) >>> 0;
  }

  function dosTime(d) {
    return {
      time: ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() / 2)) & 0xFFFF,
      date: (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xFFFF
    };
  }

  function zip(files) {
    const enc = new TextEncoder();
    const chunks = [];
    const central = [];
    let offset = 0;
    const now = dosTime(new Date());

    files.forEach((f) => {
      const nameBytes = enc.encode(f.name);
      const data = f.bytes;
      const crc = crc32(data);
      const local = new Uint8Array(30 + nameBytes.length);
      const dv = new DataView(local.buffer);
      dv.setUint32(0, 0x04034b50, true);
      dv.setUint16(4, 20, true);
      dv.setUint16(6, 0x0800, true);
      dv.setUint16(8, 0, true);            // stored
      dv.setUint16(10, now.time, true);
      dv.setUint16(12, now.date, true);
      dv.setUint32(14, crc, true);
      dv.setUint32(18, data.length, true);
      dv.setUint32(22, data.length, true);
      dv.setUint16(26, nameBytes.length, true);
      dv.setUint16(28, 0, true);
      local.set(nameBytes, 30);
      chunks.push(local, data);

      const cen = new Uint8Array(46 + nameBytes.length);
      const cdv = new DataView(cen.buffer);
      cdv.setUint32(0, 0x02014b50, true);
      cdv.setUint16(4, 20, true);
      cdv.setUint16(6, 20, true);
      cdv.setUint16(8, 0x0800, true);
      cdv.setUint16(10, 0, true);
      cdv.setUint16(12, now.time, true);
      cdv.setUint16(14, now.date, true);
      cdv.setUint32(16, crc, true);
      cdv.setUint32(20, data.length, true);
      cdv.setUint32(24, data.length, true);
      cdv.setUint16(28, nameBytes.length, true);
      cdv.setUint16(30, 0, true);
      cdv.setUint16(32, 0, true);
      cdv.setUint16(34, 0, true);
      cdv.setUint16(36, 0, true);
      cdv.setUint32(38, 0, true);
      cdv.setUint32(42, offset, true);
      cen.set(nameBytes, 46);
      central.push(cen);

      offset += local.length + data.length;
    });

    let cenSize = 0;
    central.forEach((c) => (cenSize += c.length));
    const end = new Uint8Array(22);
    const edv = new DataView(end.buffer);
    edv.setUint32(0, 0x06054b50, true);
    edv.setUint16(8, files.length, true);
    edv.setUint16(10, files.length, true);
    edv.setUint32(12, cenSize, true);
    edv.setUint32(16, offset, true);

    return new Blob(chunks.concat(central, [end]), { type: "application/zip" });
  }

  /* --------------------------------------------------------------------
     minimal PDF writer with TrimBox / BleedBox + crop marks
     -------------------------------------------------------------------- */
  function pad(n, w) { const s = String(n); return s.length >= w ? s : "0".repeat(w - s.length) + s; }

  function makePDF(jpegBytes, mediaWpt, mediaHpt, bleedWpt, bleedHpt, marginPt, info) {
    const enc = new TextEncoder();
    const parts = [];
    let len = 0;
    const push = (x) => { const b = typeof x === "string" ? enc.encode(x) : x; parts.push(b); len += b.length; return b.length; };

    const offsets = [];
    const obj = (body) => { offsets.push(len); push(body); };

    const trimW = bleedWpt - 2 * (3 * PT_PER_MM);
    const trimH = bleedHpt - 2 * (3 * PT_PER_MM);
    const tx = marginPt + 3 * PT_PER_MM;
    const ty = marginPt + 3 * PT_PER_MM;

    // crop marks
    const m = marginPt;                 // space outside the bleed
    const gap = Math.min(2, m * 0.35);  // gap between bleed edge and mark
    const markLen = Math.max(3, m - gap);
    const positions = [
      [tx, ty], [tx + trimW, ty], [tx, ty + trimH], [tx + trimW, ty + trimH]
    ];
    let content = "0.5 w 0 G\n";
    positions.forEach(([x, y], i) => {
      const left = i === 0 || i === 2, bottom = i < 2;
      const sx = left ? -1 : 1, sy = bottom ? -1 : 1;
      // horizontal arm
      content += `${(x + sx * gap).toFixed(3)} ${y.toFixed(3)} m ${(x + sx * (gap + markLen)).toFixed(3)} ${y.toFixed(3)} l S\n`;
      // vertical arm
      content += `${x.toFixed(3)} ${(y + sy * gap).toFixed(3)} m ${x.toFixed(3)} ${(y + sy * (gap + markLen)).toFixed(3)} l S\n`;
    });

    push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

    obj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    obj("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
    obj(
      "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + mediaWpt.toFixed(3) + " " + mediaHpt.toFixed(3) + "]" +
      " /BleedBox [" + marginPt.toFixed(3) + " " + marginPt.toFixed(3) + " " + (marginPt + bleedWpt).toFixed(3) + " " + (marginPt + bleedHpt).toFixed(3) + "]" +
      " /TrimBox [" + tx.toFixed(3) + " " + ty.toFixed(3) + " " + (tx + trimW).toFixed(3) + " " + (ty + trimH).toFixed(3) + "]" +
      " /ArtBox [" + tx.toFixed(3) + " " + ty.toFixed(3) + " " + (tx + trimW).toFixed(3) + " " + (ty + trimH).toFixed(3) + "]" +
      " /Resources << /XObject << /Im0 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>\nendobj\n"
    );

    const imgHead = "4 0 obj\n<< /Type /XObject /Subtype /Image /Width " + info.pxW + " /Height " + info.pxH +
      " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " + jpegBytes.length + " >>\nstream\n";
    offsets.push(len); push(imgHead); push(jpegBytes); push("\nendstream\nendobj\n");

    const drawCmd =
      "q\n" + bleedWpt.toFixed(3) + " 0 0 " + bleedHpt.toFixed(3) + " " + marginPt.toFixed(3) + " " + marginPt.toFixed(3) + " cm\n/Im0 Do\nQ\n";
    const full = bufferConcat([enc.encode(content), enc.encode(drawCmd)]);
    obj("5 0 obj\n<< /Length " + full.length + " >>\nstream\n");
    push(full); push("\nendstream\nendobj\n");

    obj("6 0 obj\n<< /Title (" + info.title.replace(/[()\\]/g, " ") + ") /Producer (Cardstock print studio) /Creator (Cardstock) >>\nendobj\n");

    const xrefStart = len;
    let xref = "xref\n0 7\n0000000000 65535 f \n";
    for (let i = 0; i < offsets.length; i++) xref += pad(offsets[i], 10) + " 00000 n \n";
    push(xref);
    push("trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n" + xrefStart + "\n%%EOF\n");

    return new Blob(parts, { type: "application/pdf" });
  }

  function bufferConcat(arrs) {
    let n = 0; arrs.forEach((a) => (n += a.length));
    const out = new Uint8Array(n);
    let o = 0; arrs.forEach((a) => { out.set(a, o); o += a.length; });
    return out;
  }

  /* --------------------------------------------------------------------
     download helper
     -------------------------------------------------------------------- */
  function save(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name; a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1200);
  }

  /* --------------------------------------------------------------------
     high-level API used by the UI
     -------------------------------------------------------------------- */
  async function exportFiles(opts) {
    // opts: {state, theme, size, dpi, format, sides:['front','back'], onProgress}
    const results = [];
    for (const side of opts.sides) {
      if (opts.onProgress) opts.onProgress(side);
      const canvas = await renderSide(side, opts);
      const blob = await toBlob(canvas, opts.format, 0.96, opts.dpi);
      results.push({ side, blob, canvas, name: fileName(opts.state, side, opts) });
    }
    return results;
  }

  async function exportPDF(opts) {
    const out = [];
    const list = (opts.sides && opts.sides.length) ? opts.sides : ["front", "back"];
    for (const side of list) {
      if (opts.onProgress) opts.onProgress(side);
      const canvas = await renderSide(side, opts);
      const blob = await toBlob(canvas, "jpeg", 0.96, opts.dpi);
      const bytes = new Uint8Array(await blob.arrayBuffer());
      const dpi = opts.dpi;
      const bleedW = (opts.size.w + 2 * BLEED) / MM_PER_IN * 72;
      const bleedH = (opts.size.h + 2 * BLEED) / MM_PER_IN * 72;
      const margin = 6 * PT_PER_MM;
      const pdfBlob = makePDF(bytes, bleedW + margin * 2, bleedH + margin * 2, bleedW, bleedH, margin, {
        pxW: canvas.width, pxH: canvas.height,
        title: "Card " + side + " — " + (opts.state.recipient || "untitled") + " — " + opts.size.w + "x" + opts.size.h + "mm +3mm bleed"
      });
      out.push({
        side, blob: pdfBlob, canvas,
        name: "card-" + side + "_" + opts.size.w + "x" + opts.size.h + "mm_bleed3mm_cropmarks.pdf"
      });
    }
    return out;
  }

  function sizeFor(size, dpi) {
    const ppm = dpi / MM_PER_IN;
    return { w: Math.round((size.w + 2 * BLEED) * ppm), h: Math.round((size.h + 2 * BLEED) * ppm) };
  }

  global.CardExport = { renderSide, toBlob, exportFiles, exportPDF, save, zip, sizeFor, fileName, BLEED, PT_PER_MM, MM_PER_IN };
})(window);
