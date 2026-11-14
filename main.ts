import { cpSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-board.ts';
import { boardIssue, buildBoard, dataScript, parseSnapshot } from './lib/model.ts';

const root=dirname(fileURLToPath(import.meta.url));
const args=process.argv.slice(2); const at=args.indexOf('--input');
const given=at>=0?args[at+1]:'/input';
const input=resolve(given.endsWith('.json')?given:`${given}/snapshot.json`);
const out=resolve(process.env.MAKEFUN_OUTPUT_DIR??'/output');
const snapshot=parseSnapshot(input);
const rows=buildBoard(snapshot); const issue=boardIssue(rows);
if(issue) { console.error(issue); process.exit(1); }
mkdirSync(out,{recursive:true}); mkdirSync(resolve(out,'dashboard'),{recursive:true}); mkdirSync(resolve(out,'screenshots'),{recursive:true});
writeFileSync(resolve(out,'board.json'),JSON.stringify({rows},null,2)+'\n');
const script=dataScript(snapshot,rows); writeFileSync(resolve(out,'data.js'),script);
cpSync(resolve(root,'dashboard'),resolve(out,'dashboard'),{recursive:true,force:true});
cpSync(resolve(root,'screenshots'),resolve(out,'screenshots'),{recursive:true,force:true});
if(readdirSync(resolve(out,'screenshots')).filter(n=>/\.(?:png|jpe?g)$/i.test(n)).length<3){console.error('fewer than 3 screenshots');process.exit(1);}
const dossier=buildDossier(out,{text_max_bytes:65536}); writeFileSync(resolve(out,'dossier.json'),dossier);
console.log(JSON.stringify({rows:rows.length,watchlist:rows.filter(r=>r.watchlist).length,board_tvl:rows.reduce((n,r)=>n+r.tvl_usd,0),top:rows.slice(0,15).map(r=>[r.name,r.implied]),out}));
