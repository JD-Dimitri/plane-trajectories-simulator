#!/usr/bin/env python3
"""Assemble index.html = src/base.html (moteur du simulateur) + les modules src/addons/*.js (V8.x).

Usage :
  python3 tools/build.py          -> écrit index.html (version publiée)
  python3 tools/build.py --test   -> écrit aussi tests/final.html avec three.js local (tests hors ligne)
"""
import pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ORDER = ["audio", "brief", "bubble", "drag", "close", "view", "frames", "scn", "exam", "acad", "models", "decor", "zoom", "guard", "vis", "jump", "fms", "b777", "c172", "menu2", "systems", "systems2", "systems4", "sysc172", "systems3", "back", "check", "manual", "duree", "docs", "physics", "fog", "crash", "map", "brand", "parity", "ppl", "cockpit3d", "legend", "calc"]   # l'ordre compte : chaque module s'appuie sur les précédents
ANCHOR = "/*FIN-BASE*/\n\n</script>"
CDN = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"

base = (ROOT / "src/base.html").read_text(encoding="utf-8")
if base.count(ANCHOR) != 1:
    sys.exit("Point d'insertion introuvable dans src/base.html")
add = "".join(f"\n<script>\n{(ROOT / 'src/addons' / (n + '.js')).read_text(encoding='utf-8')}\n</script>" for n in ORDER)
html = base.replace(ANCHOR, ANCHOR + add)
(ROOT / "index.html").write_text(html, encoding="utf-8")
print(f"index.html : {len(html):,} caractères")
if "--test" in sys.argv:
    (ROOT / "tests/final.html").write_text(html.replace(CDN, "node_modules/three/build/three.min.js"), encoding="utf-8")
    print("tests/final.html écrit (three.js local)")
