# Cardstock — print-ready card studio

A single-page web app for designing a two-sided **vertical (portrait)** card at
**62 × 89 mm (2.44 × 3.5 in)** with a **3 mm bleed** on every edge, and exporting it at
**300–1200 DPI** for a print shop.

Open `index.html` in any modern browser. No build step, no server, no network needed — fonts,
icons and the whole renderer are bundled locally.

---

## What it does

**13 theme presets**, each with its own paper, ink, accent palette, type pairing, decoration system
and icon family:

| Theme | Family | Feel |
|---|---|---|
| Neon Night | drink / bar / party | dark navy, magenta & lime neon, cocktails and disco ball |
| Tiki Sunset | drink / bar / party | warm cream, terracotta, palm trees and paper umbrellas |
| Bubble Party | party | confetti, balloons, cake and a hand-drawn squiggle |
| Bichon Cloud | dog | soft blush, an illustrated Bichon with a bow, paw prints, bones, daisies |
| Bichon Pawty | dog | mint & coral, party-hat Bichon, bones, confetti |
| Wanderlust | general | atlas paper, route lines, plane / globe / compass / palm |
| Golden Holiday | general | deep forest, gold foil lines, gifts, cake, bunting |
| Everyday Joy | general | hobbies and movement — bike, dumbbell, yoga, books, art, coffee, chess |
| Race Day | sport | asphalt black, chequered-flag edge strips, race red — helmet, flag, tyre, stopwatch, pit tools |
| Petal Press | flowers | pressed-rose pink on warm cream, double-rule frame, roses, tulips, sprigs, a visiting bee |
| Wildflower | flowers | meadow green, scatter of poppies and lavender, grass drawn along the foot of the card |
| Catnap | cat | ginger cat with a bow, warm paper — paws, yarn, fish, milk, a cardboard box, a crescent moon |
| Lucky Maneki | japanese cat | a beckoning maneki-neko with a koban, seigaiha waves at the foot, sakura, torii, koi |

**Front** — the receiver's name sits at the optical centre in a plate, with theme icons arranged
around it. Four layouts: `Halo` (icon ring), `Frame` (classic double rule with corner ornaments),
`Ticket` (angled perforated band) and `Confetti` (scattered icon play on a paper blob).
Four type styles (Elegant / Playful / Classic / Modern) and an accent-colour override.

**Back** — deliberately quiet, built around one message block. Four layouts: `Ruled` (soft writing
guides), `Note` (tinted panel), `Postcard` (framed note with stamp) and `Minimal`. Optional
handwriting face for the message and a script sign-off.

---

## Print specification

| | |
|---|---|
| Trim size | 62 × 89 mm (portrait) — or 61 × 88.9 mm for the exact 2.4 × 3.5 in, switchable |
| Orientation | Vertical — 62 mm wide, 89 mm tall |
| Bleed | 3 mm all round |
| Full artwork size | 68 × 95 mm (67 × 94.9 mm for the exact-inch option) |
| Safe margin | 3.5 mm inside the trim line |
| Minimum type | 8 pt — enforced, messages auto-fit down to the floor and never below it |
| Export resolution | 300 / 600 / 1200 DPI (default 300) |
| Colour | sRGB, tagged with DPI in the file |

The on-screen preview draws the **bleed band (dashed magenta)**, **trim line (blue)** and
**safe area (dotted green)**. Guides are a preview aid only — they are never included in exports.

### Exports

Pick a **file format** (PNG, JPEG or PDF) and a **resolution** (300 / 600 / 1200 DPI) in the export
dialog, then choose which sides to export. The format selector applies to *every* export button:

| | Front only | Back only | Both sides |
|---|---|---|---|
| **PNG** | `card-front_…png` | `card-back_…png` | ZIP with both PNGs + `PRINT-SPEC.txt` |
| **JPEG** | `card-front_…jpg` | `card-back_…jpg` | ZIP with both JPEGs + `PRINT-SPEC.txt` |
| **PDF** | `card-front_…_cropmarks.pdf` | `card-back_…_cropmarks.pdf` | ZIP with both PDFs + `PRINT-SPEC.txt` |

* **PNG** — lossless raster at the chosen DPI, DPI written into the file (`pHYs`).
* **JPEG** — smaller file at 96% quality, DPI written into the JFIF header.
* **PDF** — print-ready page per side with vector crop marks and real `TrimBox` / `BleedBox` /
  `ArtBox` entries, so the printer's software knows exactly where to cut.
* Every file name carries the trim size, bleed and DPI, e.g.
  `card-front_sofia_62x89mm_bleed3mm_300dpi.png`.
* After exporting, a result panel shows thumbnails of both sides, the format badge, and
  **Save file** buttons — useful when the app is inside an embedded preview that blocks automatic
  downloads.

### Checking the file before you send it

300 DPI at 68 × 95 mm should measure **803 × 1122 px** — portrait, not landscape (the studio prints
this in the export dialog, and a live checklist confirms DPI, bleed, smallest type size and text fit).