import {readFile} from 'node:fs/promises';
import {basename,extname} from 'node:path';
const file=process.argv[2];
if(!file || !['.txt','.md'].includes(extname(file).toLowerCase())) throw new Error('Usage : npm run import -- documents/exemple.txt (TXT ou Markdown UTF-8)');
const {SUPABASE_URL:url,SUPABASE_SECRET_KEY:key}=process.env;
if(!url||!key) throw new Error('Configurez .env avant l’import.');
const content=(await readFile(file,'utf8')).trim();
if(!content||content.length>500000) throw new Error('Document vide ou supérieur à 500 000 caractères.');
const source=basename(file);
const chunks=[];
for(let start=0;start<content.length;start+=1400) chunks.push({source,chunk_index:chunks.length,content:content.slice(start,start+1800)});
const headers={apikey:key,...(key.startsWith('sb_secret_')?{}:{Authorization:`Bearer ${key}`}),'Content-Type':'application/json'};
// Une source déjà importée doit être supprimée explicitement avant remplacement.
const response=await fetch(`${url.replace(/\/$/,'')}/rest/v1/document_chunks`,{method:'POST',headers,body:JSON.stringify(chunks),signal:AbortSignal.timeout(30000)});
if(!response.ok) throw new Error(`Import refusé (${response.status}). Vérifiez le schéma et les doublons de nom de fichier.`);
console.log(`${source} : ${chunks.length} passages importés.`);
