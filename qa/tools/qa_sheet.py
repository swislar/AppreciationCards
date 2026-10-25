import json, numpy as np
from PIL import Image, ImageDraw, ImageFont

QA = "/home/user/cardstudio/qa"
R  = QA + "/renders"
meta = json.load(open(f"{R}/meta.json"))
rows = {r["asset"]: r for r in json.load(open(f"{QA}/measure.json"))}
def load(case, dpi):
    m = next(x for x in meta if x["label"] == case and x["dpi"] == dpi)
    return Image.open(f"{R}/{m['file']}").convert("RGB")
def crop_mm(im, dpi, cx, cy, w, h):
    k = dpi/25.4
    return im.crop((int((cx-w/2)*k), int((cy-h/2)*k), int((cx+w/2)*k), int((cy+h/2)*k)))

PANEL = 420                        # px
W_MM = PANEL / (1200/25.4)         # 8.89 mm -> 1200 dpi crop is exactly 1:1 at PANEL px
BG, CARD, INK, DIM, ACC = (18,20,24), (26,29,35), (238,240,244), (140,148,160), (120,200,255)

SHOW = [
  ("Display name · Fraunces",             5.6, "cap"),
  ("Inline SVG icon (stroke)",             5.6, "cap"),
  ("Mascot illustration · SVG",            8.9, "cap"),
  ("Body message · Inter",                 5.0, "top"),
  ("Handwriting · Caveat",                 6.2, "top"),
  ("Hairline frame rule",                  5.0, "left"),
]
def window(box, h_mm, anchor):
    cx = box["x"] + box["w"]/2; cy = box["y"] + box["h"]/2
    if anchor == "left":
        cx = box["x"] + W_MM*0.45
    else:
        cx = min(max(cx, W_MM/2 + 0.3), 68 - W_MM/2 - 0.3)
        if anchor == "top": cy = box["y"] + h_mm*0.55
    return cx, cy

F   = lambda s: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", s)
FB  = lambda s: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", s)
FM  = lambda s: ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf", s)

MARGIN, GAP, ROW_CAP = 44, 26, 112
ROWS = []
for label, h_mm, anchor in SHOW:
    r = rows[label]
    cx, cy = window(r["box"], h_mm, anchor)
    big = crop_mm(load(r["case"], 1200), 1200, cx, cy, W_MM, h_mm)
    small = crop_mm(load(r["case"], 300), 300, cx, cy, W_MM, h_mm)
    big = big.resize((PANEL, int(PANEL*h_mm/W_MM)), Image.LANCZOS) if big.size[0] != PANEL else big
    small = small.resize((PANEL, big.size[1]), Image.NEAREST)    # exact 4x nearest = "what 300 dpi holds"
    ROWS.append((label, r, small, big))

HEAD = 236
body_h = sum(r[3].size[1] + ROW_CAP for r in ROWS)
TABLE_H = 60 + 19*len(rows) + 56
SHEET_W = MARGIN*2 + PANEL*2 + GAP
SHEET_H = HEAD + body_h + TABLE_H + MARGIN
sheet = Image.new("RGB", (SHEET_W, SHEET_H), BG)
d = ImageDraw.Draw(sheet)

d.text((MARGIN, 34), "Asset quality at print resolution", font=FB(34), fill=INK)
d.text((MARGIN, 80), "62 × 89 mm card  ·  68 × 95 mm with 3 mm bleed  ·  1200 DPI export = 3213 × 4488 px",
       font=F(15), fill=DIM)
par = [
 "Every icon, letter and illustration is re-laid-out at the export resolution — pxPerMm = dpi ÷ 25.4 — then rasterised.",
 "Nothing is drawn once at screen size and scaled up. Left: the same 8.9 mm of card as 300 DPI would hold it,",
 "pixels enlarged 4× with nearest neighbour. Right: the 1200 DPI export at 1:1. Same millimetres, same on-screen size.",
]
for i, l in enumerate(par): d.text((MARGIN, 112 + i*21), l, font=F(14), fill=(196,203,214))

y = HEAD
for label, r, small, big in ROWS:
    h = big.size[1]
    for x0, im, ttl, sub, col in (
        (MARGIN, small, "300 DPI  ·  enlarged 4×", "pixels you would have at 300 DPI", (255,160,120)),
        (MARGIN+PANEL+GAP, big, "1200 DPI  ·  native 1:1", "same card, exported at 1200 DPI", ACC)):
        sheet.paste(im, (x0, y))
        d.rectangle([x0-1, y-1, x0+PANEL, y+h], outline=(60,66,78))
        d.text((x0, y - 44), ttl, font=FB(15), fill=col)
        d.text((x0, y - 24), sub, font=F(12), fill=DIM)
    e = r["edge"]
    d.text((MARGIN, y - ROW_CAP + 26), "", font=F(12), fill=INK)
    cap = (f"{label}   —   edge {e[0]:.0f} → {e[2]:.0f} µm   ·   {r['lap_gain']:.0f}× the fine-detail "
           f"energy of a 300 DPI upscale")
    d.text((MARGIN, y + h + 14), cap, font=F(14), fill=INK)
    d.text((MARGIN, y + h + 36), f"ink coverage {r['ink'][0]:.1f}% / {r['ink'][1]:.1f}% / {r['ink'][2]:.1f}% at 300 / 600 / 1200 DPI — same artwork, denser sampling",
           font=F(12), fill=DIM)
    y += h + ROW_CAP

# ---- summary table
ty = y + 44
d.line([MARGIN, ty-18, SHEET_W-MARGIN, ty-18], fill=(60,66,78))
d.text((MARGIN, ty), "All measured assets", font=FB(20), fill=INK)
cols = [("asset", MARGIN), ("edge 300", MARGIN+330), ("edge 600", MARGIN+430), ("edge 1200", MARGIN+530),
        ("detail vs 300↑", MARGIN+640), ("ink drift", MARGIN+790)]
ty += 34
for name, x in cols: d.text((x, ty), name, font=FB(12), fill=DIM)
ty += 20
for key, r in rows.items():
    e = r["edge"]; ink = r["ink"]
    d.text((MARGIN, ty), key, font=F(12), fill=INK)
    for i, x in enumerate((MARGIN+330, MARGIN+430, MARGIN+530)):
        d.text((x, ty), ("—" if e[i] != e[i] else f"{e[i]:.0f} µm"), font=FM(12), fill=INK)
    d.text((MARGIN+640, ty), f"{r['lap_gain']:.0f}×", font=FM(12), fill=ACC)
    d.text((MARGIN+790, ty), f"{max(ink)-min(ink):.2f} pts", font=FM(12), fill=INK)
    ty += 19

sheet.save(f"{QA}/asset-quality-proof.png")
print("sheet:", sheet.size, f"{QA}/asset-quality-proof.png")
