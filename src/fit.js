/* ==========================================================================
   Cardstock — text fitting
   Names, eyebrows and messages are measured in the real DOM and scaled with
   a --fit multiplier until they sit inside their box. Nothing is ever scaled
   below the print-legibility floor (8 pt unless stated otherwise).
   ========================================================================== */
(function (global) {
  "use strict";

  const MM_PER_PT = 25.4 / 72; // 0.352777…

  function pxPerMm(el) {
    const v = parseFloat(getComputedStyle(el).getPropertyValue("--p"));
    return isFinite(v) && v > 0 ? v : 1;
  }

  /** font size of an element, expressed in real typographic points */
  function fontPt(el) {
    const px = parseFloat(getComputedStyle(el).fontSize) || 0;
    return px / (pxPerMm(el) * MM_PER_PT);
  }

  /* How far over the box is the content?
     - width: exact — a wrapped line never reports a scrollWidth larger than
       the client box, so there are no false positives;
     - height: measured against the height the element is *allowed* to occupy.
       Elements that cap themselves with max-height (the name, the eyebrow)
       may grow up to that cap, and a small font-relative slack absorbs the
       line-box rounding that otherwise reports one or two stray pixels. */
  const ratio = (el) => {
    const cs = getComputedStyle(el);
    const w = el.clientWidth || 1;
    const maxH = parseFloat(cs.maxHeight);
    const allowed = isFinite(maxH) && maxH > 0 ? maxH : (el.clientHeight || 1);
    const wRatio = el.scrollWidth / w;
    const slack = Math.max(1.5, (parseFloat(cs.fontSize) || 12) * 0.12);
    const hRatio = el.scrollHeight - allowed > slack ? el.scrollHeight / allowed : 1;
    return Math.max(wRatio, hRatio);
  };

  function setFit(el, f) {
    el.style.setProperty("--fit", Math.max(0.2, f).toFixed(3));
  }

  /** run the shrink/grow solve for one element */
  function solve(el, basePt, minF) {
    let f = 1;
    el.style.removeProperty("--fit");
    setFit(el, 1);

    /* shrink — ratio based, converges in a handful of reflows */
    for (let i = 0; i < 12; i++) {
      const over = ratio(el);
      if (over <= 1.004) break;
      const next = Math.max(minF, f / (over * 1.012));
      if (Math.abs(f - next) < 0.004) { f = next; setFit(el, f); break; }
      f = next; setFit(el, f);
    }

    /* grow back in fine steps so we never waste vertical space */
    for (let i = 0; i < 20; i++) {
      if (f >= 1) break;
      const nf = Math.min(1, f + 0.012);
      setFit(el, nf);
      if (ratio(el) > 1.004) { setFit(el, f); break; }
      f = nf;
    }

    const over = ratio(el) > 1.004;
    return { fit: f, over: over };
  }

  function fitOne(el) {
    if (!el || !el.isConnected) return;
    const minPt = parseFloat(el.dataset.min || "0");
    el.style.removeProperty("--fit");
    if (!el.clientWidth || !el.clientHeight) return;

    const basePt = fontPt(el);
    const minF = minPt > 0 && basePt > 0 ? Math.min(1, minPt / basePt) : 0.22;

    /* Display names prefer one line: try the single-line solve first and only
       fall back to wrapping (and a bigger size) if it would end up too small. */
    let result = null;
    if (el.dataset.pref === "single") {
      const singleMin = parseFloat(el.dataset.singleMin || "15");
      const prevWS = el.style.whiteSpace;
      el.style.whiteSpace = "nowrap";
      result = solve(el, basePt, minF);
      const pt = parseFloat(el.getAttribute("data-fitpt") || "0");
      if (!result.over && pt >= singleMin) {
        el.style.whiteSpace = prevWS;
        el.removeAttribute("data-wrapped");
      } else {
        el.style.whiteSpace = prevWS;
        el.setAttribute("data-wrapped", "1");
        result = solve(el, basePt, minF);
      }
    } else {
      result = solve(el, basePt, minF);
    }

    if (el.getAttribute("data-fitpt") == null) el.setAttribute("data-fitpt", fontPt(el).toFixed(1));
    if (result && result.over) el.setAttribute("data-overflow", "1");
    else el.removeAttribute("data-overflow");
    el.setAttribute("data-fitpt", fontPt(el).toFixed(1));
  }

  function fitCard(root) {
    if (!root) return;
    root.querySelectorAll('[data-fit="name"],[data-fit="line"],[data-fit="msg"],[data-fit="sign"]')
      .forEach(fitOne);
  }

  /** smallest type size actually used on a card, in points */
  function minFontPt(card, onlySide) {
    const ppm = pxPerMm(card);
    let min = Infinity;
    card.querySelectorAll("*").forEach((el) => {
      if (el.closest(".guides")) return;
      const hasText = Array.prototype.some.call(el.childNodes, (n) => n.nodeType === 3 && n.textContent.trim());
      if (!hasText) return;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") return;
      const pt = (parseFloat(cs.fontSize) || 0) / (ppm * MM_PER_PT);
      if (pt > 0 && pt < min) min = pt;
    });
    return min === Infinity ? 0 : min;
  }

  global.CardFit = { fitCard, fitOne, fontPt, pxPerMm, minFontPt, MM_PER_PT };
})(window);
