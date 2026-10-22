# Candidatas por posicionamiento (BM25 dentro del mismo tema) y lotes ciegos agrupados por tema.
import json,re,sys,math,glob,unicodedata,collections,os
S=sys.argv[1]; PARTIES=["PP","PSOE","VOX","SUMAR"]; K=8; PER_JOB=650
B=json.load(open(f"{S}/full/votos_ciegos.json")); V,T=B["votaciones"],B["textos"]
def norm(s): return unicodedata.normalize("NFKD",s.lower()).encode("ascii","ignore").decode()
STOP=set("de la el los las y en a por para con del al que se un una su sus o e lo como mas sobre entre sin gobierno congreso insta ley".split())
tok=lambda s:[w for w in re.findall(r"[a-z0-9]+",norm(s)) if w not in STOP and len(w)>2]
ids=list(V); docs={i:tok(V[i]["titulo"]+" "+V[i]["texto"]+" "+T.get(V[i]["exp"],"")[:2500]) for i in ids}
N=len(ids); avg=sum(map(len,docs.values()))/N; df=collections.Counter(w for d in docs.values() for w in set(d)); tf={i:collections.Counter(d) for i,d in docs.items()}
def bm25(q,i,k1=1.4,b=.75):
    s=0
    for w in set(q):
        f=tf[i].get(w)
        if f: s+=math.log(1+(N-df[w]+.5)/(df[w]+.5))*f*(k1+1)/(f+k1*(1-b+b*len(docs[i])/avg))
    return s
stm=[]
for p in PARTIES:
    for f in sorted(glob.glob(f"{S}/full/pos/{p}*.json")):
        for t in json.load(open(f))["temas"]:
            for x in t["posicionamientos"]: stm.append(dict(x,partido=p,tema=t["tema"]))
bytema=collections.defaultdict(list)
for i in ids:
    for t in V[i]["tm"]: bytema[t].append(i)
items=[]
for s in stm:
    q=tok(s["subtema"]+" "+s["postura"]+" "+" ".join(s.get("palabras_clave",[])))
    sc=sorted(((bm25(q,i),i) for i in bytema[s["tema"]]),reverse=True)[:K]
    items.append({"sid":s["id"],"tema":s["tema"],"subtema":s["subtema"],"postura":s["postura"],"candidatas":[i for x,i in sc if x>0]})
json.dump(stm,open(f"{S}/full/posicionamientos.json","w"),ensure_ascii=False)
# lotes: por tema, sin partido, mezclados dentro del tema
os.makedirs(f"{S}/full/jobs",exist_ok=True)
for f in glob.glob(f"{S}/full/jobs/*"): os.remove(f)
jobs=[];cur=[];n=0
import random; random.seed(7)
for t in sorted({i["tema"] for i in items}):
    its=[i for i in items if i["tema"]==t]; random.shuffle(its)
    for it in its:
        if n+len(it["candidatas"])>PER_JOB and cur: jobs.append(cur);cur=[];n=0
        cur.append(it); n+=len(it["candidatas"])
if cur: jobs.append(cur)
for k,j in enumerate(jobs,1):
    vids=sorted({c for it in j for c in it["candidatas"]})
    exps=sorted({V[c]["exp"] for c in vids if V[c]["exp"]})
    keys={}
    for n0,it in enumerate(j): keys["P%02d-%03d"%(k,n0)]=it["sid"]
    inv={v:kk for kk,v in keys.items()}
    blob={"items":[{"key":inv[it["sid"]],**{kk:it[kk] for kk in ("tema","subtema","postura","candidatas")}} for it in j],
          "votaciones":{c:{kk:V[c][kk] for kk in ("tipo","fecha","titulo","exp")} for c in vids},"textos":{e:T[e] for e in exps}}
    json.dump(keys,open(f"{S}/full/jobs/keys_{k:02d}.map","w"))
    json.dump(blob,open(f"{S}/full/jobs/job_{k:02d}.json","w"),ensure_ascii=False)
print(len(stm),"posicionamientos;",sum(len(i["candidatas"]) for i in items),"pares;",len(jobs),"lotes")
for k,j in enumerate(jobs,1): print(k,len(j),sum(len(i["candidatas"]) for i in j),os.path.getsize(f"{S}/full/jobs/job_{k:02d}.json")//1000,"KB",sorted({i['tema'] for i in j}))
