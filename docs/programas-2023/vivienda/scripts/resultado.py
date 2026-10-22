# Cruza promesas, juicios a ciegas y voto real. Reglas de escano/promesas.py (Escaño Abierto).
import json,glob,re,sys,collections
S,DATA=sys.argv[1],sys.argv[2]
FORM={"PP":["PP"],"PSOE":["PSOE","PSC-PSOE","PsdeG-PSOE","PSE-EE (PSOE)","PSIB-PSOE","PSN-PSOE"],"VOX":["VOX"],"SUMAR":["SUMAR"],"ERC":["ERC"],"JUNTS":["JxCAT-JUNTS"],"BILDU":["EH Bildu"],"PNV":["EAJ-PNV"],"BNG":["BNG"],"UPN":["UPN"]}
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
def resultado(prom,rel):
    if prom["competencia"]=="ninguna": return "sin_competencia",[]
    u=[(a,r,p) for a,r,p in rel if r in("cumple","avanza","contradice") and p]
    if not u: return "no_votada",[]
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
P={p["id"]:dict(p,partido=json.load(open(f))["party"]) for f in glob.glob(f"{S}/viv/promesas_*.json") for p in json.load(open(f))["promesas"]}
J={j["pid"]:j["relaciones"] for f in glob.glob(f"{S}/viv/juicios_*.json") for j in json.load(open(f))}
L={"S":"A favor","N":"En contra","A":"Abstención","D":"Dividido"}
out=[]
for pid,p in P.items():
    rel=[(V[r["id"]],r["relacion"],posicion(V[r["id"]]["v"],IND[p["partido"]])) for r in J.get(pid,[])]
    res,u=resultado(p,rel)
    mot={r["id"]:r.get("motivo","") for r in J.get(pid,[])}
    out.append({"id":pid,"partido":p["partido"],"pagina":p["pagina"],"cita":p["cita"],"resumen":p["resumen"],"objeto":p["objeto"],"tipo":p["tipo"],"competencia":p["competencia"],"resultado":res,
      "votaciones":[{"id":a["id"],"fecha":a["fecha"],"tipo":a["tipo"],"titulo":a["titulo"],"url":a.get("json",""),"relacion":r,"motivo":mot.get(a["id"],""),"voto_partido":L.get(pp,"")} for a,r,pp in u]})
json.dump(out,open(f"{S}/viv/resultados.json","w"),ensure_ascii=False,indent=1)
c=collections.Counter((o["partido"],o["resultado"]) for o in out)
R=["a_favor_cumple","a_favor_avanza","en_contra_contradice","en_contra_cumple","en_contra_avanza","a_favor_contradice","abstencion","distinto_sentido","no_votada","sin_competencia"]
print("partido".ljust(7)+" ".join(r[:12].rjust(12) for r in R))
for g in sorted(FORM): print(g.ljust(7)+" ".join(str(c[(g,r)]).rjust(12) for r in R))
print(collections.Counter(o["resultado"] for o in out))
