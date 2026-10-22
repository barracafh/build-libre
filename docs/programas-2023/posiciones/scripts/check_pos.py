import json,glob,re,sys,collections,unicodedata
S=sys.argv[1]; D={"PP":"pp","PSOE":"psoe","VOX":"vox","SUMAR":"sumar"}
c=lambda s: re.sub(r"\s+"," ",unicodedata.normalize("NFC",s)).strip()
for p,d in D.items():
    fs=sorted(glob.glob(f"{S}/full/pos/{p}.json")+glob.glob(f"{S}/full/pos/{p}_?.json"))
    if not fs: print(p,"pendiente"); continue
    temas=[t for f in fs for t in json.load(open(f))["temas"]]
    bad=[x["id"] for t in temas for x in t["posicionamientos"] if c(x["cita"]) not in c(open(f"{S}/pages/{d}/{x['pagina']:03d}.txt").read())]
    n=sum(len(t["posicionamientos"]) for t in temas)
    print(f"{p}: {len(temas)} temas, {n} frases, sin contenido={[t['tema'] for t in temas if t.get('sin_contenido')]}, no literales={bad}")
