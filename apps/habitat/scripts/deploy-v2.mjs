// Executed only inside the isolated AISO bridge job. No credentials are persisted.
import {readFileSync,appendFileSync} from 'node:fs';
const account=process.env.CLOUDFLARE_ACCOUNT_ID,token=process.env.CLOUDFLARE_API_TOKEN,sha=process.env.HABITAT_SHA;
if(!account||!token||!sha||!/^[a-f0-9]{40}$/.test(sha))throw Error('Missing bridge credentials or pinned source commit');
const name='habitat-v2-preview',dbName='habitat-v2-preview';
async function cf(path,method='GET',body){const r=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${path}`,{method,headers:{Authorization:`Bearer ${token}`,...(body&&!(body instanceof FormData)?{'Content-Type':'application/json'}:{})},...(body?{body:body instanceof FormData?body:JSON.stringify(body)}:{})});const b=await r.json();if(!r.ok||!b.success)throw Error(`Cloudflare ${method} ${path}: HTTP ${r.status}; codes ${(b.errors||[]).map(e=>e.code).join(',')}`);return b.result;}
const sub=await cf('/workers/subdomain');if(!/^[a-z0-9-]+$/.test(sub.subdomain))throw Error('Invalid account subdomain');
const databases=await cf('/d1/database?per_page=100');let db=databases.find(d=>d.name===dbName);if(!db)db=await cf('/d1/database','POST',{name:dbName});if(db.name!==dbName||!db.uuid)throw Error('Dedicated HABITAT database unavailable');
const sql=readFileSync('migrations/0001.sql','utf8');await cf('/d1/database/'+db.uuid+'/query','POST',{sql});
const metadata={main_module:'worker.js',compatibility_date:'2025-11-01',bindings:[{type:'d1',name:'DB',id:db.uuid},{type:'plain_text',name:'BUILD_SHA',text:sha}]};
const data=new FormData();data.set('metadata',new Blob([JSON.stringify(metadata)],{type:'application/json'}));for(const f of ['worker.js','engineering.js','priority.js','assets.js'])data.set(f,new Blob([readFileSync('dist/'+f)],{type:'application/javascript+module'}),f);
const result=await cf('/workers/scripts/'+name,'PUT',data);await cf('/workers/scripts/'+name+'/subdomain','POST',{enabled:true,previews_enabled:false});// No new account-wide Cron Trigger: expiry is enforced on access and cleanup runs before provisioning.
const url=`https://${name}.${sub.subdomain}.workers.dev`;
console.log(JSON.stringify({url,commit:sha,worker:name,database:dbName,version:result.deployment_id||result.id}));
if(process.env.GITHUB_ENV)appendFileSync(process.env.GITHUB_ENV,`HABITAT_URL=${url}\n`);
if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,`\nHABITAT V2 synthetic preview: ${url}\nSource commit: ${sha}\nWorker: ${name}; D1: ${dbName}\n`);
let healthy=false;for(let i=0;i<15;i++){try{const r=await fetch(url+'/api/health');const b=await r.json();if(r.ok&&b.ok&&b.build===sha){healthy=true;break;}}catch{}await new Promise(r=>setTimeout(r,2000));}if(!healthy)throw Error('Deployed but health/build not verified');

