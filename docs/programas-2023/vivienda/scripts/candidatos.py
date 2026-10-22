import json,re,sys,math,glob,unicodedata,collections,random
S=sys.argv[1]
pool=json.load(open(f"{S}/viv/pool.json")); T=json.load(open(f"{S}/viv/textos_anon.json"))
def norm(s): return unicodedata.normalize("NFKD",s.lower()).encode("ascii","ignore").decode()
STOP=set("de la el los las y en a por para con del al que se un una su sus o e lo como mas sobre entre sin".split())
tok=lambda s:[w for w in re.findall(r"[a-z0-9]+",norm(s)) if w not in STOP and len(w)>2]
docs=[tok(v["titulo"]+" "+v["texto"]+" "+T.get(v["exp"],"")[:1500]) for v in pool]
N=len(docs); avg=sum(map(len,docs))/N; df=collections.Counter(w for d in docs for w in set(d))
tf=[collections.Counter(d) for d in docs]
def bm25(q,i,k1=1.4,b=.75):
    s=0
    for w in set(q):
        if w in tf[i]:
            idf=math.log(1+(N-df[w]+.5)/(df[w]+.5)); f=tf[i][w]
            s+=idf*f*(k1+1)/(f+k1*(1-b+b*len(docs[i])/avg))
    return s
P=[p for f in sorted(glob.glob(f"{S}/viv/promesas_*.json")) for p in json.load(open(f))["promesas"]]
jobs=[]
for p in P:
    if p["competencia"]=="ninguna": continue
    q=tok(p["resumen"]+" "+p["objeto"]+" "+" ".join(p.get("palabras_clave",[])))
    sc=sorted(((bm25(q,i),i) for i in range(N)),reverse=True)[:12]
    jobs.append({"pid":p["id"],"promesa":p["resumen"],"objeto":p["objeto"],"candidatas":[pool[i]["id"] for s,i in sc if s>0]})
random.seed(1); random.shuffle(jobs)  # mezclar partidos
json.dump(jobs,open(f"{S}/viv/jobs.json","w"),ensure_ascii=False)
votes={v["id"]:{"tipo":v["tipo"],"fecha":v["fecha"],"titulo":v["titulo"],"exp":v["exp"]} for v in pool}
json.dump({"votaciones":votes,"textos_por_expediente":T},open(f"{S}/viv/votaciones_ciegas.json","w"),ensure_ascii=False,indent=0)
print(len(P),"promesas,",len(jobs),"a juzgar,",sum(len(j["candidatas"]) for j in jobs),"pares")
