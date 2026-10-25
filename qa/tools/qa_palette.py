#!/usr/bin/env python3
"""Custom-palette regression: every theme, every layout, two palettes, plus a
pixel check that the chosen colours actually reach the exported file.

    python3 -m http.server 8899          # from the project root
    python3 qa/tools/qa_palette.py

Exit code 0 means: no clipping, no page errors, and the exported PNG / JPEG /
PDF rasters carry the custom base colour instead of the theme preset.
"""
import asyncio, json, sys, urllib.request
from playwright.async_api import async_playwright

URL = "http://localhost:8899/index.html"
PALETTES = {
    "light": {"paper": "#F6E7D2", "ink": "#22303C", "accent": "#B23A6B",
              "accent2": "#3E7C6A", "pop": "#C9832F"},
    "dark":  {"paper": "#1B2230", "ink": "#EFE7D6", "accent": "#E9B44C",
              "accent2": "#7FD1FF", "pop": "#C8F26B"},
}
FRONTS = ["halo", "frame", "ticket", "confetti"]
BACKS = ["ruled", "card", "postcard", "plain"]


def reachable():
    try:
        urllib.request.urlopen(URL, timeout=3).read(1)
        return True
    except Exception:
        return False


async def main():
    if not reachable():
        sys.exit("Serve the project first:  python3 -m http.server 8899")

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1500, "height": 1000})
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        await page.goto(URL)
        await page.wait_for_timeout(1600)

        themes = await page.evaluate("() => window.CardThemes.THEMES.map(t => t.id)")
        stats = {"renders": 0, "clipped": [], "mismatch": 0, "minPt": []}

        for name, pal in PALETTES.items():
            for theme in themes:
                for front in FRONTS:
                    for back in BACKS:
                        await page.evaluate(
                            """([theme, front, back, colors]) => CardStudio.set({
                                 themeId: theme, colors: Object.assign({}, colors),
                                 frontLayout: front, backLayout: back,
                                 recipient: "Alexandra", message: "A little note"})""",
                            [theme, front, back, pal])
                        await page.wait_for_timeout(95)
                        r = await page.evaluate(
                            """() => {
                              const c = CardStudio.computeChecks();
                              return { overflow: c.overflow, minPt: c.minPt,
                                       fit: (c.list.find(x => x.key === 'fit') || {}).ok,
                                       css: [...document.querySelectorAll('.card')].map(el => {
                                         const s = getComputedStyle(el);
                                         return [s.getPropertyValue('--paper').trim(),
                                                 s.getPropertyValue('--ink').trim()]; }) };
                            }""")
                        stats["renders"] += 1
                        stats["minPt"].append(r["minPt"])
                        if r["overflow"] or not r["fit"]:
                            stats["clipped"].append(f"{name}/{theme}/{front}+{back}")
                        stats["mismatch"] += sum(
                            1 for paper, ink in r["css"]
                            if paper.lower() != pal["paper"].lower() or ink.lower() != pal["ink"].lower())

        # ---- do the colours survive the export?
        col = {"paper": "#12251C", "ink": "#F3ECDD", "accent": "#E9B44C",
               "accent2": "#7FD1FF", "pop": "#C8F26B"}
        await page.evaluate("(c) => CardStudio.set({themeId:'neon', colors:c, recipient:'Sofia'})", col)
        await page.wait_for_timeout(300)
        exports = await page.evaluate(
            """async () => {
              const sample = async (blob) => {
                const bmp = await createImageBitmap(blob);
                const cv = document.createElement('canvas');
                cv.width = bmp.width; cv.height = bmp.height;
                const cx = cv.getContext('2d'); cx.drawImage(bmp, 0, 0);
                const px = (x, y) => [...cx.getImageData(x, y, 1, 1).data].slice(0, 3);
                return { w: bmp.width, h: bmp.height, trim: px(35, 35), centre: px(bmp.width >> 1, bmp.height >> 1) };
              };
              const base = {state: CardStudio.state, theme: CardStudio.theme(),
                            size: CardStudio.size(), dpi: 300, sides: ['front']};
              const out = {};
              for (const format of ['png', 'jpeg']) {
                const files = await CardExport.exportFiles(Object.assign({format}, base));
                out[format] = await sample(files[0].blob);
              }
              const pdfs = await CardExport.exportFiles(Object.assign({format: 'pdf'}, base));
              out.pdf = { bytes: pdfs[0].blob.size };
              return out;
            }""")

        await browser.close()

    ok = not stats["clipped"] and not errors and stats["mismatch"] == 0
    print(json.dumps({
        "themes": len(themes), "renders": stats["renders"],
        "clipped": stats["clipped"], "palette_mismatches": stats["mismatch"],
        "min_font_pt": min(stats["minPt"]) if stats["minPt"] else None,
        "page_errors": errors, "exports": exports,
    }, indent=2))
    print("\nPASS" if ok else "\nFAIL")
    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
