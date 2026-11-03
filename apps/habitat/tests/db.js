import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
export function database(path=':memory:'){
 const sqlite=new DatabaseSync(path);sqlite.exec(readFileSync('migrations/0001.sql','utf8'));
 const wrap=(sql,args=[])=>({bind(...values){return wrap(sql,values.map(v=>Array.isArray(v)?new Uint8Array(v):v));},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){const r=sqlite.prepare(sql).run(...args);return {meta:{changes:Number(r.changes)}};}});
 return {prepare:sql=>wrap(sql),async batch(stmts){sqlite.exec('BEGIN');try{const out=[];for(const s of stmts)out.push(await s.run());sqlite.exec('COMMIT');return out;}catch(e){sqlite.exec('ROLLBACK');throw e;}},close:()=>sqlite.close()};
}
