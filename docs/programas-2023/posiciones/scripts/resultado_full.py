# Cruza posicionamientos, juicios a ciegas y voto real (reglas de escano/promesas.py, sin el filtro de competencia).
import json,glob,re,sys,collections
S,DATA=sys.argv[1],sys.argv[2]
FORM={"PP":["PP"],"PSOE":["PSOE","PSC-PSOE","PsdeG-PSOE","PSE-EE (PSOE)","PSIB-PSOE","PSN-PSOE"],"VOX":["VOX"],"SUMAR":["SUMAR"]}
idx=json.load(open(f"{DATA}/indice.json"))["diputados"]
IND={p:[i for i,d in enumerate(idx) if d[3] in f] for p,f in FORM.items()}
V={v["id"]:v for f in sorted(glob.glob(f"{DATA}/votaciones/????-??.json")) for v in json.load(open(f))}
def posicion(voto,ind):
    c=collections.Counter(voto[i] for i in ind if i<len(voto) and voto[i] in "SNA")
    if not c: return None
    (x,n),t=c.most_common(1)[0],sum(c.values())
    return x if n/t>=0.8 else "D"
PESO=[(r"conjunto|votación final",0),(r"Convalidación",1),(r"Enmiendas del Senado",2),(r"Dictamen",3),(r"totalidad",4),(r"Toma en consideración",5),(r"Proyecto de ley",3),(r"Moción",7),(r"Proposición no de ley",7)]
peso=lambda a: next((p for pat,p in PESO if re.search(pat,a["tipo"]+" "+a["titulo"],re.I)),6)
def resultado(rel):
    u=[(a,r,p) for a,r,p in rel if r in("cumple","avanza","contradice") and p]
    if not u: return "sin_votacion",[]
    u.sort(key=lambda x:(x[1]=="avanza",peso(x[0]),x[0]["fecha"]))
    sent=lambda r,p: None if p in("A","D") else ("coherente" if (r=="contradice")==(p=="N") else "contrario")
    ss={sent(r,p) for _,r,p in u if r!="avanza" or len(u)==1}-{None}
    if len(ss)>1: return "distinto_sentido",u
    a,r,p=u[0]
    if p=="A": return "abstencion",u
    if p=="D": return "distinto_sentido",u
    if r=="contradice": return ("en_contra_contradice" if p=="N" else "a_favor_contradice"),u
    if p=="S": return ("a_favor_cumple" if r=="cumple" else "a_favor_avanza"),u
    return ("en_contra_cumple" if r=="cumple" else "en_contra_avanza"),u
KEY={}
for f in glob.glob(f"{S}/full/jobs/keys_*.map"): KEY.update(json.load(open(f)))
J={}
for f in glob.glob(f"{S}/full/jobs/juicio_*.json"):
    for it in json.load(open(f)): J[KEY[it["key"]]]=it["relaciones"]
P={s["id"]:s for s in json.load(open(f"{S}/full/posicionamientos.json"))}
# Correcciones tras la revisión (22/10/2026).
# 1. Una moción o PNL votada entera con dos o más puntos no puede atribuirse a uno de ellos:
#    su relación baja a «relacionada» y no decide el resultado.
NPTS=json.load(open(f"{S}/full/puntos_enteras.json"))
# 2. Correcciones a mano: (frase, votación) -> (relación, motivo).
MANUAL={("PP-justicia-09","154-3"):("relacionada","Retirar el proyecto del Gobierno no se opone a aprobar otra LECrim.")}
CORREGIDOS=[]
def corregir(sid,r):
    r=dict(r); k=(sid,r["id"])
    if k in MANUAL:
        r["relacion"],r["motivo"]=MANUAL[k]; CORREGIDOS.append((sid,r["id"],"manual"))
    elif r["relacion"] in("cumple","avanza","contradice") and NPTS.get(r["id"],0)>=2:
        r["motivo"]="[votada en bloque, %d puntos; antes: %s] %s"%(NPTS[r["id"]],r["relacion"],r.get("motivo",""))
        r["relacion"]="relacionada"; CORREGIDOS.append((sid,r["id"],"bloque"))
    return r
L={"S":"A favor","N":"En contra","A":"Abstención","D":"Dividido"}
out=[]
for sid,s in P.items():
    rels=J.get(sid)
    if rels is None: continue
    rels=[corregir(sid,r) for r in rels]
    mot={r["id"]:r.get("motivo","") for r in rels}
    rel=[(V[r["id"]],r["relacion"],posicion(V[r["id"]]["v"],IND[s["partido"]])) for r in rels]
    res,u=resultado(rel)
    out.append({k:s[k] for k in ("id","partido","tema","subtema","cita","pagina","postura","direccion")}|{"resultado":res,
      "relacionadas":sum(1 for _,r,_ in rel if r=="relacionada"),
      "votaciones":[{"id":a["id"],"fecha":a["fecha"],"tipo":a["tipo"],"titulo":a["titulo"],"url":a.get("json",""),"relacion":r,"motivo":mot.get(a["id"],""),"voto_partido":L.get(p,"")} for a,r,p in u]})
json.dump(out,open(f"{S}/full/resultados.json","w"),ensure_ascii=False,indent=1)
json.dump(CORREGIDOS,open(f"{S}/full/corregidos.json","w"),ensure_ascii=False)
print(len(CORREGIDOS),"relaciones corregidas:",collections.Counter(c[2] for c in CORREGIDOS))
G={"a_favor_cumple":"coherente","a_favor_avanza":"coherente","en_contra_contradice":"coherente","en_contra_cumple":"contrario","en_contra_avanza":"contrario","a_favor_contradice":"contrario","abstencion":"abst_div","distinto_sentido":"abst_div","sin_votacion":"sin_votacion"}
c=collections.Counter((o["partido"],G[o["resultado"]]) for o in out)
print(len(out),"juzgados de",len(P))
for p in sorted(FORM): print(p, {k:c[(p,k)] for k in ("coherente","contrario","abst_div","sin_votacion")})
