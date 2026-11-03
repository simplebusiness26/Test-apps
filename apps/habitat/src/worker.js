import assets from './assets.js';
import {analyse,simulate,VERSION} from './engineering.js';
const encoder=new TextEncoder();
const id=()=>crypto.randomUUID();
const token=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
const hash=async v=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',typeof v==='string'?encoder.encode(v):v)),n=>n.toString(16).padStart(2,'0')).join('');
class Failure extends Error{constructor(status,message){super(message);this.status=status;}}
const fail=(status,message)=>{throw new Failure(status,message)};
const json=(data,status=200,headers={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json',...headers}});
function text(v,name,max=2000){if(typeof v!=='string'||!v.trim()||v.length>max)fail(400,`${name} is required (maximum ${max} characters)`);return v.trim();}
const query=(db,sql,...params)=>db.prepare(sql).bind(...params);
async function body(req,max=20000){const reader=req.body?.getReader();if(!reader)fail(400,'Request body required');let n=0,parts=[];while(true){const r=await reader.read();if(r.done)break;n+=r.value.length;if(n>max){await reader.cancel();fail(413,'Request too large');}parts.push(r.value);}const bytes=new Uint8Array(n);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}return bytes;}
async function input(req){try{return JSON.parse(new TextDecoder().decode(await body(req)));}catch(e){if(e instanceof Failure)throw e;fail(400,'Invalid JSON');}}
async function limit(db,key,max){const now=Date.now(),bucket=Math.floor(now/3600000);const row=await query(db,'INSERT INTO limits(key,count,expires) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count',key+':'+bucket,now+7200000).first();if(row.count>max)fail(429,'Hourly pilot limit reached. Try again later.');}
async function identity(req,db){const cookie=req.headers.get('Cookie')||'',raw=cookie.match(/(?:^|; )habitat=([a-f0-9]{64})(?:;|$)/)?.[1];if(!raw)fail(401,'Sign in to continue');const u=await query(db,'SELECT i.*,o.expires AS org_expires FROM sessions s JOIN identities i ON i.id=s.identity JOIN organisations o ON o.id=i.org WHERE s.hash=? AND s.expires>? AND o.expires>?',await hash(raw),Date.now(),Date.now()).first();if(!u)fail(401,'Session expired. Use your access key or start a new demo.');return u;}
async function property(db,u,p){const row=await query(db,'SELECT * FROM properties WHERE id=? AND org=?',p,u.org).first();if(!row||(u.role==='resident'&&row.resident!==u.id))fail(404,'Property not found');return row;}
async function report(db,u,r){const row=await query(db,'SELECT r.*,p.org,p.label,p.resident FROM reports r JOIN properties p ON p.id=r.property WHERE r.id=? AND p.org=?',r,u.org).first();if(!row||(u.role==='resident'&&row.resident!==u.id))fail(404,'Report not found');return row;}
function manager(u){if(u.role!=='manager')fail(403,'A manager must record this action');}
const event=(db,r,u,kind,note)=>query(db,'INSERT INTO events VALUES(?,?,?,?,?,?)',id(),r,u.id,kind,note,Date.now());
function cleanReport(r){const {org,resident,...rest}=r;return {...rest,measurements:r.measurements?JSON.parse(r.measurements):null,analysis:r.analysis?JSON.parse(r.analysis):null};}
function cookie(value,maxAge=43200){return `habitat=${value}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`;}
async function route(req,env){const url=new URL(req.url),path=url.pathname,method=req.method,db=env.DB;
  if(method==='GET'&&path in assets)return new Response(assets[path],{headers:{'Content-Type':path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':'text/html'}});
  if(!path.startsWith('/api/'))fail(404,'Not found');
  if(method!=='GET'&&req.headers.get('Origin')!==url.origin)fail(403,'Same-origin request required');
  if(path==='/api/health'){await db.prepare('SELECT id FROM organisations LIMIT 1').first();return json({ok:true,mode:'synthetic-pilot',model:VERSION,build:env.BUILD_SHA||'local'});}
  if(method==='POST'&&path==='/api/demo'){
    const b=await input(req);if(b.synthetic!==true)fail(400,'Confirm synthetic data only');
    await limit(db,'create:'+await hash(req.headers.get('CF-Connecting-IP')||'local'),5);
    const count=await db.prepare('SELECT count(*) AS n FROM organisations').first();if(count.n>=100)fail(429,'Pilot capacity reached');
    const org=id(),resident=id(),mgr=id(),p=id(),now=Date.now(),residentKey=token(),managerKey=token();
    await db.batch([query(db,'INSERT INTO organisations VALUES(?,?,?)',org,now,now+7*86400000),query(db,'INSERT INTO identities VALUES(?,?,?,?)',resident,org,'resident',await hash(residentKey)),query(db,'INSERT INTO identities VALUES(?,?,?,?)',mgr,org,'manager',await hash(managerKey)),query(db,'INSERT INTO properties VALUES(?,?,?,?)',p,org,'Demo home · Flat 1',resident),query(db,'INSERT INTO properties VALUES(?,?,?,?)',id(),org,'Demo home · Flat 2',null)]);
    return json({residentKey,managerKey,expires:now+7*86400000},201);
  }
  if(method==='POST'&&path==='/api/login'){
    await limit(db,'login:'+await hash(req.headers.get('CF-Connecting-IP')||'local'),40);
    const b=await input(req);if(typeof b.key!=='string'||!/^[a-f0-9]{64}$/.test(b.key))fail(401,'Invalid access key');
    const u=await query(db,'SELECT i.* FROM identities i JOIN organisations o ON o.id=i.org WHERE key_hash=? AND o.expires>?',await hash(b.key),Date.now()).first();if(!u)fail(401,'Invalid or expired access key');
    const raw=token();await query(db,'INSERT INTO sessions VALUES(?,?,?)',await hash(raw),u.id,Date.now()+43200000).run();return json({role:u.role},200,{'Set-Cookie':cookie(raw)});
  }
  const u=await identity(req,db);
  if(method==='POST')await limit(db,'write:'+u.org,200);
  if(path==='/api/logout'&&method==='POST'){const raw=(req.headers.get('Cookie')||'').match(/habitat=([a-f0-9]{64})/)?.[1];if(raw)await query(db,'DELETE FROM sessions WHERE hash=?',await hash(raw)).run();return json({ok:true},200,{'Set-Cookie':cookie('',0)});}
  if(path==='/api/me'&&method==='GET')return json({role:u.role,expires:u.org_expires});
  if(path==='/api/properties'&&method==='GET'){const rows=await query(db,'SELECT id,label FROM properties WHERE org=? AND (?=\'manager\' OR resident=?)',u.org,u.role,u.id).all();return json(rows.results);}
  if(path==='/api/reports'&&method==='GET'){const rows=await query(db,'SELECT r.id,r.title,r.room,r.status,r.urgent,r.created,p.label FROM reports r JOIN properties p ON p.id=r.property WHERE p.org=? AND (?=\'manager\' OR p.resident=?) ORDER BY r.created DESC LIMIT 100',u.org,u.role,u.id).all();return json(rows.results);}
  if(path==='/api/reports'&&method==='POST'){
    const b=await input(req);await property(db,u,b.property);const n=await query(db,'SELECT count(*) AS n FROM reports r JOIN properties p ON p.id=r.property WHERE p.org=?',u.org).first();if(n.n>=50)fail(429,'Pilot limit: 50 reports per workspace');
    let analysis=null;if(b.measurements!==null&&b.measurements!==undefined){try{analysis=analyse(b.measurements);}catch(e){fail(400,e.message);}}
    const r=id();await db.batch([query(db,'INSERT INTO reports(id,property,author,title,description,room,measurements,analysis,urgent,created) VALUES(?,?,?,?,?,?,?,?,?,?)',r,b.property,u.id,text(b.title,'Title',120),text(b.description,'Description'),text(b.room,'Room',80),analysis?JSON.stringify(b.measurements):null,analysis?JSON.stringify(analysis):null,b.urgent===true?1:0,Date.now()),event(db,r,u,'reported','Resident or manager recorded a synthetic housing concern. Not a legal hazard classification.')]);return json({id:r},201);
  }
  if(path==='/api/simulate'&&method==='POST'){try{return json(simulate(await input(req)));}catch(e){if(e instanceof Failure)throw e;fail(400,e.message);}}
  const match=path.match(/^\/api\/reports\/([a-f0-9-]{36})(?:\/(events|photos|export))?$/);
  if(match){const r=await report(db,u,match[1]),action=match[2];
    if(method==='GET'&&(!action||action==='export')){const events=await query(db,'SELECT e.id,e.kind,e.note,e.created,i.role FROM events e JOIN identities i ON i.id=e.actor WHERE e.report=? ORDER BY e.created,e.rowid',r.id).all(),photos=await query(db,'SELECT id,digest,created FROM photos WHERE report=?',r.id).all();return json({report:cleanReport(r),events:events.results,photos:photos.results,exportedAt:new Date().toISOString(),notice:'Synthetic pilot. Engineering scenarios are not medical or legal determinations.'},200,action?{'Content-Disposition':'attachment; filename="habitat-report.json"'}:{});}
    if(method==='POST'&&action==='events'){
      const b=await input(req);const kinds=['inspection','repair-planned','repair-completed','reviewed','reopened','note'];if(!kinds.includes(b.kind))fail(400,'Unknown action');if(b.kind!=='note'&&b.kind!=='reopened')manager(u);
      const statuses={'inspection':'investigating','repair-planned':'repair planned','repair-completed':'awaiting review','reviewed':'closed','reopened':'reported'};
      if(b.kind==='reviewed'&&r.status!=='awaiting review')fail(409,'Complete a repair before closing after review');
      await db.batch([event(db,r.id,u,b.kind,text(b.note,'Action details')), ...(statuses[b.kind]?[query(db,'UPDATE reports SET status=? WHERE id=?',statuses[b.kind],r.id)]:[])]);return json({ok:true});
    }
    if(method==='POST'&&action==='photos'){
      const bytes=await body(req,180000);if(req.headers.get('Content-Type')!=='image/jpeg'||bytes.length<4||bytes[0]!==255||bytes[1]!==216||bytes.at(-2)!==255||bytes.at(-1)!==217)fail(400,'A JPEG image under 180 kB is required');
      const photo=id(),digest=await hash(bytes);
      const inserted=await query(db,'INSERT INTO photos SELECT ?,?,?,?,? WHERE (SELECT count(*) FROM photos WHERE report=?)<3',photo,r.id,Array.from(bytes),digest,Date.now(),r.id).run();if(inserted.meta.changes!==1)fail(409,'Maximum three photographs per report');
      await event(db,r.id,u,'photo-added','Evidence image added; SHA-256 '+digest).run();return json({id:photo},201);
    }
  }
  const pm=path.match(/^\/api\/photos\/([a-f0-9-]{36})$/);if(pm&&method==='GET'){const p=await query(db,'SELECT * FROM photos WHERE id=?',pm[1]).first();if(!p)fail(404,'Photo not found');await report(db,u,p.report);return new Response(new Uint8Array(p.bytes),{headers:{'Content-Type':'image/jpeg','Content-Disposition':'inline; filename="evidence.jpg"'}});}
  fail(404,'Not found');
}
export default {async fetch(req,env){let response;try{response=await route(req,env);}catch(e){response=json({error:e instanceof Failure?e.message:'Service unavailable. Please retry; your unsaved form has not been cleared.'},e instanceof Failure?e.status:503);if(!(e instanceof Failure))console.error('HABITAT request failed',e.name);}
  const headers=new Headers(response.headers);headers.set('Cache-Control','no-store');headers.set('X-Content-Type-Options','nosniff');headers.set('Referrer-Policy','no-referrer');headers.set('X-Frame-Options','DENY');headers.set('Content-Security-Policy',"default-src 'self'; img-src 'self' blob:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');headers.set('Strict-Transport-Security','max-age=31536000');return new Response(response.body,{status:response.status,headers});},async scheduled(_,env){await env.DB.batch([query(env.DB,'DELETE FROM sessions WHERE expires<?',Date.now()),query(env.DB,'DELETE FROM organisations WHERE expires<?',Date.now()),query(env.DB,'DELETE FROM limits WHERE expires<?',Date.now())]);}};
