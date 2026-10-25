import asyncio, base64, json, os, numpy as np
from PIL import Image
from scipy import ndimage
from playwright.async_api import async_playwright
QA="/home/user/cardstudio/qa"
R = QA + "/renders"
rows = {r["asset"]: r for r in json.load(open(f"{QA}/measure.json"))}

def gray(im): return np.asarray(im.convert("L"), float)
def edge_um(im, dpi):
    g=gray(im); gx,gy=ndimage.sobel(g,1),ndimage.sobel(g,0); mag=np.hypot(gx,gy)
    thr=np.percentile(mag,98); ys,xs=np.where(mag>=thr)
    if len(ys)==0: return float("nan")
    h,w=g.shape; widths=[]
    for y,x in list(zip(ys,xs))[::max(1,len(ys)//300)]:
        dx,dy=gx[y,x],gy[y,x]; n=np.hypot(dx,dy)
        if n<1e-6: continue
        dx,dy=dx/n,dy/n; vals=[]
        for t in np.arange(-6,6.001,0.25):
            yy,xx=int(round(y+dy*t)),int(round(x+dx*t))
            if 0<=yy<h and 0<=xx<w: vals.append(g[yy,xx])
        if len(vals)<20: continue
        v=np.array(vals); lo,hi=v.min(),v.max()
        if hi-lo<25: continue
        idx=np.where((v>=lo+0.1*(hi-lo))&(v<=lo+0.9*(hi-lo)))[0]
        if len(idx)>=2: widths.append((idx[-1]-idx[0])*0.25)
    return float(np.median(widths))/(dpi/25.4)*1000 if widths else float("nan")

async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); pg=await b.new_page(viewport={"width":1500,"height":950})
        errs=[]; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("http://localhost:8899/index.html"); await pg.wait_for_timeout(1400)
        out={}
        # simpler: use exportFiles with a page-side helper
        await pg.evaluate("""() => {
            window.__b64 = async blob => {
              const buf = new Uint8Array(await blob.arrayBuffer());
              let s=''; for (let i=0;i<buf.length;i+=8192) s+=String.fromCharCode.apply(null, buf.subarray(i,i+8192));
              return btoa(s);
            };
            return true;
        }""")
        for fmt, dpi in (("png",300),("png",1200),("jpeg",1200),("pdf",600),("pdf",1200)):
            files = await pg.evaluate("""async ([fmt,dpi]) => {
              CardStudio.set({themeId:'neon', recipient:'Sofia', sender:'Alex', messageSize:10,
                message:"Thank you for always being the first to say yes — to the trip, to the second round, to the very bad idea. Here's to many more."});
              const o = {state:CardStudio.state, theme:CardStudio.theme(), size:CardStudio.size(), dpi, sides:['front']};
              const list = fmt === 'pdf' ? await CardExport.exportPDF(o)
                                         : await CardExport.exportFiles(Object.assign({format:fmt}, o));
              const out=[]; for (const f of list) out.push({name:f.name, b64: await window.__b64(f.blob)}); return out;
            }""", [fmt,dpi])
            for f in files:
                ext = f["name"].rsplit(".",1)[-1].lower()
                path = f"{R}/fmt_{fmt}_{dpi}.{ext}"
                open(path,"wb").write(base64.b64decode(f["b64"]))
                out[f"{fmt}@{dpi}"] = dict(path=path, name=f["name"], bytes=os.path.getsize(path))
                print(f"{fmt:4} {dpi:5}  {f['name']:52} {os.path.getsize(path)/1024:8.0f} KB")
        print("errors:", errs[:3])
        await b.close()

    # --- inspect the files
    import fitz
    print("\n--- embedded image resolution ---")
    for dpi in (600,1200):
        p = out[f"pdf@{dpi}"]["path"]
        doc = fitz.open(p); page = doc[0]
        imgs = page.get_images(full=True)
        print(f"PDF {dpi} dpi: page {page.rect.width:.2f}x{page.rect.height:.2f} pt, {len(imgs)} image(s)")
        for im in imgs:
            xref = im[0]; w,h = im[2], im[3]
            # placement rect of the image
            rects = page.get_image_rects(xref)
            for r in rects:
                eff_x = w/(r.width/72); eff_y = h/(r.height/72)
                print(f"   image {w}x{h} px placed {r.width/72*25.4:.2f}x{r.height/72*25.4:.2f} mm "
                      f"-> effective {eff_x:.0f} x {eff_y:.0f} DPI")
        doc.close()

    print("\n--- edge sharpness per container ---")
    box = rows["Display name · Fraunces"]["box"]
    def cropf(im, k):
        x0=int((box["x"]-0.7)*k); y0=int((box["y"]-0.7)*k)
        return im.crop((x0,y0,int((box["x"]+box["w"]+0.7)*k),int((box["y"]+box["h"]+0.7)*k)))
    for key in ("png@300","png@1200","jpeg@1200"):
        im = Image.open(out[key]["path"]).convert("RGB")
        k = 1200/25.4 if "1200" in key else 300/25.4
        e = edge_um(cropf(im,k), 1200 if "1200" in key else 300)
        print(f"{key:10} {im.width}x{im.height}  name edge transition {e:.1f} µm")
asyncio.run(main())
