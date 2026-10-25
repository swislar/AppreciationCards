"""Render every asset class at 300/600/1200 DPI through the real export pipeline."""
import asyncio, base64, os, json
from playwright.async_api import async_playwright

OUT = "/home/user/cardstudio/qa/renders"
os.makedirs(OUT, exist_ok=True)

# (label, theme, side, extra state) — chosen to cover text, line icons, mascot, script, gradients
CASES = [
    ("neon-front", "neon", "front", {}),
    ("neon-back",  "neon", "back",  {}),
    ("cloud-front","cloud","front", {}),          # mascot illustration + tiny paw/bone icons
    ("cloud-back", "cloud","back",  {}),
    ("joy-front",  "joy",  "front", {}),          # line icons incl. thin strokes
    ("golden-frame","golden","front",{"frontLayout":"frame"}),   # hairline frame rules + garland
    ("tiki-ticket","tiki", "front", {"frontLayout":"ticket"}),   # reversed text on solid band
    ("neon-hand",  "neon", "back",  {"handFont": True, "messageSize": 11}),  # handwriting face
]

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width":1500,"height":950})
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("http://localhost:8899/index.html")
        await pg.wait_for_timeout(1500)
        meta = []
        for label, theme, side, extra in CASES:
            for dpi in (300, 600, 1200):
                data = await pg.evaluate("""async ([theme, side, extra, dpi]) => {
                  CardStudio.set(Object.assign({themeId: theme, recipient:'Sofia', sender:'Alex',
                     message:"Thank you for always being the first to say yes — to the trip, to the second round, to the very bad idea. Here's to many more.",
                     icons:null, accentOverride:"", messageSize:10, handFont:false}, extra));
                  await new Promise(r=>setTimeout(r, 120));
                  const st = CardStudio.state;
                  const cv = await CardExport.renderSide(side, {state: st, theme: CardStudio.theme(), size: CardStudio.size(), dpi});
                  return {url: cv.toDataURL('image/png'), w: cv.width, h: cv.height};
                }""", [theme, side, extra, dpi])
                fn = f"{OUT}/{label}_{dpi}.png"
                open(fn, "wb").write(base64.b64decode(data["url"].split(",")[1]))
                meta.append({"label": label, "side": side, "theme": theme, "dpi": dpi,
                             "w": data["w"], "h": data["h"], "file": os.path.basename(fn)})
                print(f"{label:14} {dpi:5}dpi  {data['w']}x{data['h']}")
        json.dump(meta, open(f"{OUT}/meta.json","w"), indent=1)
        print("errors:", errs[:5])
        await b.close()

asyncio.run(main())
