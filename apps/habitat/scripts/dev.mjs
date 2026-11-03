import {createServer} from 'node:http';
import {database} from '../tests/db.js';
import worker from '../dist/worker.js';
const DB=database(process.env.DB_PATH||'demo.sqlite');
createServer(async(req,res)=>{const chunks=[];for await(const c of req)chunks.push(c);const request=new Request('http://localhost:8787'+req.url,{method:req.method,headers:req.headers,...(req.method!=='GET'&&req.method!=='HEAD'?{body:Buffer.concat(chunks)}:{})});const response=await worker.fetch(request,{DB});res.writeHead(response.status,Object.fromEntries(response.headers));res.end(Buffer.from(await response.arrayBuffer()));}).listen(8787,()=>console.log('HABITAT local http://localhost:8787'));
