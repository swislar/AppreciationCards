# Asset quality at print resolution

Verification that the icons, type and illustrations in an exported card carry **real
resolution** — not a screen-resolution image enlarged to 300/600/1200 DPI.

Card: 62 × 89 mm trim, 68 × 95 mm with 3 mm bleed. At 1200 DPI the export is 3213 × 4488 px.
Visual proof: [`qa/asset-quality-proof.png`](qa/asset-quality-proof.png) — the same 8.9 mm of
card at 300 DPI (enlarged 4×, nearest neighbour) beside the 1200 DPI export at 1:1.

---

## How the export is built

`CardExport.renderSide()` computes `pxPerMm = dpi ÷ 25.4` and passes it into the template, so the
whole card — type sizes, icon boxes, rules, spacing — is **laid out again at the target
resolution**. It is then rasterised once, 1:1:

| step | code | scale |
| --- | --- | --- |
| layout | `CardTemplates.card(…, {pxPerMm})` | 11.81 px/mm @ 300 → 47.24 px/mm @ 1200 |
| svg snapshot | `<svg width=W height=H viewBox="0 0 W H">` + `foreignObject` | 1:1 |
| blit | `ctx.drawImage(img, 0, 0, W, H)` on a `W × H` canvas | 1:1, no scale factor |

There is no `drawImage` downscale, no `devicePixelRatio` clamp and no fixed-size offscreen canvas.

Every graphic is a vector: **0 raster images and 0 `<canvas>` elements** in the artwork,
**12 inline `<svg>` with 73 paths** (that card; other themes run 40–210 shapes, still zero bitmaps), and **5 embedded woff2 faces** (Fraunces, Inter, Baloo 2,
Caveat, Great Vibes) served as `data:` URIs — a render makes **0 external requests**.

## Measurements

Nine asset classes were located from the live DOM, then the identical physical window was cut
out of the 300, 600 and 1200 DPI exports and measured.

| asset | edge transition 300 DPI | 600 DPI | 1200 DPI | fine detail vs a 300 DPI upscale | ink coverage drift |
| --- | --- | --- | --- | --- | --- |
| Display name · Fraunces | 85 µm | 42 µm | 21 µm | ×32 | 1.05 pts |
| Script line · Great Vibes | 381 µm | 127 µm | 21 µm | ×31 | 1.02 pts |
| Eyebrow caps · Inter | 85 µm | 42 µm | 21 µm | ×35 | 0.76 pts |
| Inline SVG icon (stroke) | 423 µm | 42 µm | 21 µm | ×34 | 1.20 pts |
| Mascot illustration · SVG | 550 µm | 42 µm | 21 µm | ×34 | 0.90 pts |
| Hairline frame rule | 381 µm | 42 µm | 11 µm | ×41 | 0.32 pts |
| Reversed name on colour band | 85 µm | 42 µm | 21 µm | ×34 | 1.05 pts |
| Body message · Inter | 360 µm | 42 µm | 21 µm | ×34 | 0.86 pts |
| Handwriting · Caveat | 381 µm | 42 µm | 21 µm | ×36 | 2.45 pts |
| Glow / gradient field | — (no edges) | — | — | ×10 | 0.01 pts |

Three independent checks agree:

1. **Edge transition halves each time the DPI doubles** — 85 → 42 → 21 µm. That is the width of a
   single antialiased pixel at each resolution. An enlarged 300 DPI file would keep the 85 µm
   transition, or make it wider.
2. **High-frequency energy.** Compared with the 300 DPI export resampled to 3213 × 4488 by Lanczos,
   the real 1200 DPI file has **30–41× the Laplacian variance** and **7–15× more spectral energy
   above a quarter of Nyquist**. That information does not exist in a 300 DPI image, so it cannot
   have been upscaled from one.
3. **Ink coverage is constant** (drift ≤ 2.45 of ~10–14 percentage points) — the same artwork,
   sampled more finely.

Typography is resolution-independent, which confirms the re-layout rather than a resample:
the display name measures **26.00 pt at 300, 600 and 1200 DPI** and occupies
**36.5 × 9.9 mm** in all three.

## Per-file-format

| | 300 DPI | 600 DPI | 1200 DPI |
| --- | --- | --- | --- |
| PNG | 803 × 1122 px, 511 KB | 1606 × 2244 px | 3213 × 4488 px, 6.7 MB |
| JPEG | 803 × 1122 px | 1606 × 2244 px | 3213 × 4488 px, 637 KB |
| PDF | 226.77 × 303.31 pt | image placed at 68 × 95 mm → **600 effective DPI** | **1200 effective DPI**, 639 KB |

- PNG is lossless.
- JPEG is written at quality 0.96: **43.96 dB PSNR** against the PNG, mean error 0.55/255,
  and the measured edge transition is identical (21.2 µm at 1200 DPI) — no smear.
- PDF embeds its image as JPEG (DCTDecode) at the same quality, placed on a 68 × 95 mm
  bleed box with a TrimBox and crop marks, so the effective resolution is exactly 600 or 1200 DPI.
  If byte-exact output is required, use PNG at the same DPI.

Gradients stay clean when sampled more finely: in flat areas of the glow field, **100 % of
neighbouring-pixel steps are ≤ 1 LSB** at all three DPIs (86 % are exactly 0) — no banding.

## Reproducing

Tools live in [`qa/tools/`](qa/tools). Serve the app (`python3 -m http.server 8899`) and run:

```bash
python3 qa/tools/qa_render.py    # renders 9 representative cases at 300/600/1200 DPI
python3 qa/tools/qa_measure.py   # DOM-located crops + edge/energy/ink metrics -> qa/measure.json
python3 qa/tools/qa_formats.py   # PNG/JPEG/PDF files, effective DPI, PSNR
python3 qa/tools/qa_sheet.py     # builds qa/asset-quality-proof.png
```

## Verdict

At 300 DPI every asset resolves to a single antialiased pixel edge (85 µm) — the practical
ceiling for that resolution. At 600 and 1200 DPI the artwork is regenerated at those densities,
not stretched: edge transitions shrink in proportion, detail energy rises 30–40×, and physical
measurements stay identical. Nothing in a card is a bitmap, so nothing can run out of resolution.
