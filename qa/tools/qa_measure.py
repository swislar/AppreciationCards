"""Definitive asset-quality measurement: DOM-located regions, real-DPI test via FFT bandwidth."""
import asyncio, json, numpy as np
from PIL import Image
from scipy import ndimage
from playwright.async_api import async_playwright

QA = "/home/user/cardstudio/qa"
R  = QA + "/renders"
META = json.load(open(f"{R}/meta.json"))
MSG = "Thank you for always being the first to say yes — to the trip, to the second round, to the very bad idea. Here's to many more."

# (label, case, side, state overrides, selector)
PLAN = [
 ("Display name · Fraunces",      "neon-front",  "front", {"themeId":"neon"},  ".name"),
 ("Script line · Great Vibes",    "neon-front",  "front", {"themeId":"neon"},  ".occasion, .signature"),
 ("Eyebrow caps · Inter",         "neon-front",  "front", {"themeId":"neon"},  ".eyebrow"),
 ("Inline SVG icon (stroke)",     "neon-front",  "front", {"themeId":"neon"},  ".ic svg, .ic"),
 ("Mascot illustration · SVG",    "cloud-front", "front", {"themeId":"cloud"}, ".mascot"),
 ("Hairline frame rule",          "golden-frame","front", {"themeId":"golden","frontLayout":"frame"},".frame-rule.inner"),
 ("Reversed name on colour band", "tiki-ticket", "front", {"themeId":"tiki","frontLayout":"ticket"}, ".band-inner .name, .band .name"),
 ("Body message · Inter",         "neon-back",   "back",  {"themeId":"neon"},  ".msg"),
 ("Handwriting · Caveat",         "neon-hand",   "back",  {"themeId":"neon","handFont":True}, ".msg"),
 ("Glow / gradient field",        "neon-front",  "front", {"themeId":"neon"},  ".art-glow"),
]

async def boxes():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width":1500,"height":950})
        await pg.goto("http://localhost:8899/index.html"); await pg.wait_for_timeout(1400)
        await pg.evaluate("m => window.__MSG = m", "Thank you for always being the first to say yes — to the trip, to the second round, to the very bad idea. Here's to many more.")
        out = {}
        for label, case, side, st, sel in PLAN:
            mm = await pg.evaluate("""([st, side, sel]) => {
              const state = Object.assign({}, CardStudio.state, {recipient:'Sofia', sender:'Alex', messageSize:10,
                message: window.__MSG}, st);
              CardStudio.set(state);
              const pxPerMm = 1200/25.4;
              const stage = document.getElementById('exportStage');
              stage.innerHTML = CardTemplates.card(state, CardStudio.theme(), side, CardStudio.size(), {pxPerMm});
              const el = stage.firstElementChild;
              const node = el.querySelector(sel);
              if (!node) { stage.innerHTML=''; return null; }
              const cr = el.getBoundingClientRect(), r = node.getBoundingClientRect();
              stage.innerHTML = '';
              return {x:(r.left-cr.left)/pxPerMm, y:(r.top-cr.top)/pxPerMm, w:r.width/pxPerMm, h:r.height/pxPerMm};
            }""", [st, side, sel])
            if mm: out[(case,label)] = mm
            else:  print("  !! selector found nothing:", case, label, sel)
        await b.close()
        return out

def load(case, dpi):
    m = next(x for x in META if x["label"] == case and x["dpi"] == dpi)
    return Image.open(f"{R}/{m['file']}").convert("RGB")

CAP_MM = 24.0        # never analyse a window larger than this (keeps FFT memory sane)
def crop(img, dpi, box, pad=0.7):
    k = dpi/25.4
    w = min(box["w"], CAP_MM); h = min(box["h"], CAP_MM)
    # centre the window on the element, but keep it inside the card
    cx = box["x"] + box["w"]/2; cy = box["y"] + box["h"]/2
    if box["w"] > CAP_MM: cx = box["x"] + pad + w/2          # hug the left edge for rules/frames
    if box["h"] > CAP_MM: cy = box["y"] + pad + h/2
    x0 = cx - w/2 - pad; y0 = cy - h/2 - pad
    x1 = cx + w/2 + pad; y1 = cy + h/2 + pad
    return img.crop((max(0,int(x0*k)), max(0,int(y0*k)),
                     min(img.width,int(x1*k)), min(img.height,int(y1*k))))

def ink_density(im):
    g = np.asarray(im.convert("L"), float); bg = np.median(g); d = np.abs(g-bg)
    return 100.0*(d > max(10, np.percentile(d,85))).sum()/d.size

def edge_um(im, dpi):
    g = np.asarray(im.convert("L"), float)
    gx, gy = ndimage.sobel(g,1), ndimage.sobel(g,0); mag = np.hypot(gx,gy)
    thr = np.percentile(mag, 98); ys,xs = np.where(mag>=thr)
    if len(ys)==0: return float("nan")
    h,w = g.shape; widths=[]
    for y,x in list(zip(ys,xs))[::max(1,len(ys)//300)]:
        dx,dy = gx[y,x], gy[y,x]; n = np.hypot(dx,dy)
        if n<1e-6: continue
        dx,dy = dx/n, dy/n; vals=[]
        for t in np.arange(-6,6.001,0.25):
            yy,xx = int(round(y+dy*t)), int(round(x+dx*t))
            if 0<=yy<h and 0<=xx<w: vals.append(g[yy,xx])
        if len(vals)<20: continue
        v = np.array(vals); lo,hi = v.min(), v.max()
        if hi-lo < 25: continue
        idx = np.where((v>=lo+0.1*(hi-lo)) & (v<=lo+0.9*(hi-lo)))[0]
        if len(idx)>=2: widths.append((idx[-1]-idx[0])*0.25)
    return float(np.median(widths))/(dpi/25.4)*1000 if widths else float("nan")

def hf_fraction(im):
    g = np.asarray(im.convert("L"), float); g -= g.mean()
    F = np.fft.fftshift(np.abs(np.fft.fft2(g)))**2
    h,w = F.shape
    yy,xx = np.mgrid[0:h,0:w]; r = np.hypot((yy-h/2)/(h/2),(xx-w/2)/(w/2))
    tot = F[r>0.02].sum()
    return float(F[r>0.25].sum()/tot) if tot>0 else float("nan")

async def main():
    bx = await boxes()
    print(f"{'asset':30}{'dpi':>6}{'edge µm':>9}{'ink%':>7}{'lap.var':>10}{'HF>¼Nyq':>9}")
    print("-"*74)
    rows=[]
    for label, case, side, st, sel in PLAN:
        if (case,label) not in bx: continue
        box = bx[(case,label)]; per={}
        for dpi in (300,600,1200):
            c = crop(load(case,dpi), dpi, box)
            per[dpi] = dict(img=c, edge=edge_um(c,dpi), ink=ink_density(c), hf=hf_fraction(c),
                            lap=float(ndimage.laplace(np.asarray(c.convert("L"),float)).var()))
            p = per[dpi]
            print(f"{label if dpi==300 else '':30}{dpi:6}{p['edge']:9.1f}{p['ink']:7.2f}{p['lap']:10.1f}{p['hf']:9.4f}")
        up = per[300]["img"].resize(per[1200]["img"].size, Image.LANCZOS)
        up_hf = hf_fraction(up); up_lap = float(ndimage.laplace(np.asarray(up.convert("L"),float)).var())
        r = dict(asset=label, case=case, box=box,
                 edge=[per[d]["edge"] for d in (300,600,1200)],
                 ink=[per[d]["ink"] for d in (300,600,1200)],
                 hf1200=per[1200]["hf"], hf300up=up_hf,
                 hf_gain=(per[1200]["hf"]/up_hf if up_hf else None),
                 lap1200=per[1200]["lap"], lap300up=up_lap,
                 lap_gain=(per[1200]["lap"]/up_lap if up_lap else None),
                 px300=per[300]["img"].size, px1200=per[1200]["img"].size)
        rows.append(r)
        print(f"{'':30} 1200 vs 300↑: laplacian ×{r['lap_gain']:.1f} · HF ×{r['hf_gain']:.2f} · "
              f"ink drift {max(r['ink'])-min(r['ink']):.2f} pts · edge {r['edge'][0]:.0f}→{r['edge'][2]:.0f} µm\n")
    json.dump(rows, open(f"{QA}/measure.json","w"), indent=1)
    print("wrote", f"{QA}/measure.json")

# expose MSG to the page
_orig = async_playwright
async def run():
    async with _orig() as p:
        pass
asyncio.run(main())
