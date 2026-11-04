import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
mkdirSync('dist',{recursive:true});
const assets=Object.fromEntries(['index.html','app.js','style.css'].map(p=>['/'+(p==='index.html'?'':p),readFileSync('public/'+p,'utf8')]));
writeFileSync('dist/assets.js','export default '+JSON.stringify(assets)+';');
for(const p of ['worker.js','engineering.js','priority.js'])writeFileSync('dist/'+p,readFileSync('src/'+p));
console.log('Built Worker modules and self-contained assets');

