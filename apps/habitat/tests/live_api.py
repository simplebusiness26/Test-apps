"""Outside-in synthetic checks. No credentials or report bodies printed."""
import os,json,urllib.request,urllib.error,http.cookiejar
BASE=os.environ.get('HABITAT_URL','https://habitat-pilot.ai-seo.workers.dev')
def client():
    opener=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    def call(path,data=None):
        req=urllib.request.Request(BASE+'/api'+path,data=json.dumps(data).encode() if data is not None else None,headers={'Origin':BASE,'Content-Type':'application/json'})
        try:
            with opener.open(req,timeout=30) as r:return r.status,json.load(r)
        except urllib.error.HTTPError as e:
            raw=e.read()
            try: detail=json.loads(raw)
            except ValueError: detail={'error':'Non-JSON upstream response'}
            return e.code,detail
    return call
resident,manager,outsider=client(),client(),client()
status,k=resident('/demo',{'synthetic':True});assert status==201,(status,k)
assert resident('/login',{'key':k['residentKey']})[0]==200
p=resident('/properties')[1];assert len(p)==1
status,r=resident('/reports',{'property':p[0]['id'],'title':'Outside-in synthetic verification','description':'Fictional observation, no personal data.','room':'Demo','measurements':{'temperature':20,'humidity':70,'surface':12}});assert status==201,(status,r)
path='/reports/'+r['id'];assert resident(path)[1]['report']['analysis']['margin']<0
assert resident(path+'/events',{'kind':'inspection','note':'Denied resident inspection'})[0]==403
status,o=outsider('/demo',{'synthetic':True});assert status==201,(status,o)
assert outsider('/login',{'key':o['managerKey']})[0]==200
assert outsider(path)[0]==404
assert outsider(path+'/export')[0]==404
assert manager('/login',{'key':k['managerKey']})[0]==200
assert len(manager('/properties')[1])==2
for kind in ['inspection','repair-planned','repair-completed','reviewed']:
 assert manager(path+'/events',{'kind':kind,'note':'Synthetic verification '+kind})[0]==200
export=resident(path+'/export')[1];assert export['report']['status']=='closed';assert len(export['events'])==5
assert resident('/logout',{})[0]==200
assert resident('/me')[0]==401
print('PASS live D1: persistent report/calculation, resident-manager boundaries, cross-organisation read/export denial, inspection-to-closure history, export and session revocation.')
