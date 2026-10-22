# Tablas del dashboard y lista de revisión a partir de resultados.json.
import json,glob,sys,collections,re
S,D=sys.argv[1],sys.argv[2]
R=json.load(open(f"{S}/full/resultados.json"))
G={"a_favor_cumple":"Votó a favor de lo que defiende","a_favor_avanza":"Votó a favor de lo que defiende","en_contra_contradice":"Votó a favor de lo que defiende","en_contra_cumple":"Votó en contra de lo que defiende","en_contra_avanza":"Votó en contra de lo que defiende","a_favor_contradice":"Votó en contra de lo que defiende","abstencion":"Abstención o dividido","distinto_sentido":"Abstención o dividido","sin_votacion":"Sin votación relacionada"}
gen={}
for p in ["PP","PSOE","VOX","SUMAR"]:
    for f in sorted(glob.glob(f"{S}/full/pos/{p}.json")+glob.glob(f"{S}/full/pos/{p}_?.json")):
        for t in json.load(open(f))["temas"]: gen[(p,t["tema"])]=t.get("posicion_general","")
c=collections.Counter((o["partido"],o["tema"],G[o["resultado"]]) for o in R)
pos=[{"partido":p,"tema":t,"posicion_general":g,"frases":sum(1 for o in R if o["partido"]==p and o["tema"]==t),"a_favor_de_lo_que_defiende":c[(p,t,"Votó a favor de lo que defiende")],"en_contra_de_lo_que_defiende":c[(p,t,"Votó en contra de lo que defiende")],"abstencion_o_dividido":c[(p,t,"Abstención o dividido")],"sin_votacion":c[(p,t,"Sin votación relacionada")]} for (p,t),g in sorted(gen.items())]
fr=[]
for o in R:
    v=o["votaciones"][0] if o["votaciones"] else {}
    fr.append({"id":o["id"],"partido":o["partido"],"tema":o["tema"],"subtema":o["subtema"],"cita":o["cita"],"pagina":o["pagina"],"postura":o["postura"],"resultado":G[o["resultado"]],"votacion":v.get("id",""),"fecha":v.get("fecha",""),"titulo":v.get("titulo",""),"url":v.get("url",""),"relacion":v.get("relacion",""),"motivo":v.get("motivo",""),"voto_partido":v.get("voto_partido",""),"otras_votaciones":max(0,len(o["votaciones"])-1)})
json.dump(pos,open(f"{S}/dash/posiciones.json","w"),ensure_ascii=False); json.dump(fr,open(f"{S}/dash/frases.json","w"),ensure_ascii=False)
json.dump(pos,open(f"{D}/posiciones_generales.json","w"),ensure_ascii=False,indent=1)
tot=collections.Counter((o["partido"],G[o["resultado"]]) for o in R)
for p in ["PP","PSOE","SUMAR","VOX"]: print(p,sum(1 for o in R if o["partido"]==p),[tot[(p,k)] for k in ["Votó a favor de lo que defiende","Votó en contra de lo que defiende","Abstención o dividido","Sin votación relacionada"]])
# revisión
C={"en_contra_cumple","en_contra_avanza","a_favor_contradice"}
B=json.load(open(f"{S}/full/votos_ciegos.json"))["votaciones"]
mism={"164-19","164-23","89-3","193-8","34-1"}|{f"169-{i}" for i in range(1,80)}
def notas(v):
    n=[]
    if v["tipo"] in("Moción","Proposición no de ley"): n.append("moción/PNL: no obliga")
    if v["relacion"]=="avanza": n.append("solo «avanza»")
    if v["id"] in mism: n.append("texto del BOCG no casa con el título")
    if not B.get(v["id"],{}).get("exp"): n.append("juzgada solo por el título")
    return "; ".join(n)
P={"PP":"PP","PSOE":"PSOE","SUMAR":"Sumar","VOX":"Vox"}
esc=lambda s:(s or "").replace("|","/").replace("\n"," ")
head="| Frase | Partido | Tema | Lo que defiende | Votación | Votó | Relación y motivo | Revisar |\n| --- | --- | --- | --- | --- | --- | --- | --- |"
row=lambda o,v: f'| {o["id"]} | {P[o["partido"]]} | {o["tema"]} | {esc(o["postura"])} | [{v["id"]}]({v["url"]}) {esc(v["titulo"][:90])} | {v["voto_partido"]} | {v["relacion"]}: {esc(v["motivo"])} | {notas(v)} |'
L=["# Revisión de resultados (PP, PSOE, Sumar, Vox)","","Generado de `resultados.json` tras las correcciones (ver README). «Revisar» son avisos automáticos.","","## 1. Casos en que el partido votó en contra de lo que defiende","",head]
L+=[row(o,o["votaciones"][0]) for o in sorted([o for o in R if o["resultado"] in C],key=lambda o:(o["partido"],o["tema"]))]
flag={"135-1","116-1","111-2","29-46","146-56","130-9","200-2","109-8","164-23","89-3","193-8","154-6","171-1","169-53","130-10","79-25","89-1","136-93","141-3","40-9","21-2"}
L+=["","## 2. Resultados que dependen de juicios dudosos","",head]
L+=[row(o,o["votaciones"][0]) for o in sorted([o for o in R if o["resultado"] not in C and o["resultado"]!="sin_votacion" and o["votaciones"][0]["id"] in flag],key=lambda o:(o["votaciones"][0]["id"],o["partido"]))]
open(f"{D}/revision.md","w").write("\n".join(L)+"\n")
print(sum(1 for o in R if o["resultado"] in C),"en contra")
