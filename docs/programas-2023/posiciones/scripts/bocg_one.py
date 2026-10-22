# Descarga el texto BOCG de un expediente: python3 -I bocg_one.py <dir> <exp>
import sys,re,os,subprocess,urllib.parse,json,fcntl
D,e=sys.argv[1],sys.argv[2]
out=f"{D}/bocg_txt/{e.replace('/','_')}.json"
if os.path.exists(out): sys.exit()
url="https://www.congreso.es/es/busqueda-de-iniciativas?p_p_id=iniciativas&p_p_lifecycle=0&p_p_state=normal&p_p_mode=view&_iniciativas_mode=mostrarDetalle&_iniciativas_legislatura=XV&_iniciativas_id="+urllib.parse.quote(e,safe="")
h=subprocess.run(["curl","-s","-m","40","-A","Mozilla/5.0",url],capture_output=True,text=True).stdout
links=re.findall(r'href="(/public_oficiales/L15/CONG/BOCG/[^"#]+\.PDF)#page=(\d+)"',h)
res={"exp":e,"links":links,"texto":""}
if links:
    path,page=links[0]; page=int(page)
    f=f"{D}/bocg_pdf/{os.path.basename(path)}"
    lock=open(f+".lock","w"); fcntl.flock(lock,fcntl.LOCK_EX)
    if not os.path.exists(f) or os.path.getsize(f)==0:
        subprocess.run(["curl","-s","-m","180","-A","Mozilla/5.0","-o",f,"https://www.congreso.es"+path])
    fcntl.flock(lock,fcntl.LOCK_UN)
    t=subprocess.run(["pdftotext","-f",str(page),"-l",str(page+8),"-enc","UTF-8",f,"-"],capture_output=True,text=True).stdout
    i=max(t.find(e),0); seg=t[i:]
    m=re.search(r"\n\s*\d{3}/\d{6}\s*\n",seg[20:])
    if m: seg=seg[:20+m.start()]
    res["texto"]=re.sub(r"[ \t]+"," ",seg).strip()[:30000]
json.dump(res,open(out,"w"),ensure_ascii=False)
