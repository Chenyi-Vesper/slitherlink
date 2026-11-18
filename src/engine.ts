export function geometry(n:number){const edges:number[][]=[],cells:number[][]=[];for(let y=0;y<=n;y++)for(let x=0;x<n;x++)edges.push([y*(n+1)+x,y*(n+1)+x+1]);for(let y=0;y<n;y++)for(let x=0;x<=n;x++)edges.push([y*(n+1)+x,(y+1)*(n+1)+x]);for(let y=0;y<n;y++)for(let x=0;x<n;x++)cells.push([y*n+x,(y+1)*n+x,n*(n+1)+y*(n+1)+x,n*(n+1)+y*(n+1)+x+1]);return {edges,cells};}
export function won(n:number,clues:number[],chosen:number[]){const {edges,cells}=geometry(n);if(!cells.every((c,i)=>clues[i]<0||c.reduce((s,e)=>s+chosen[e],0)===clues[i]))return false;const adj:number[][]=Array.from({length:(n+1)**2},()=>[]);edges.forEach(([a,b],i)=>{if(chosen[i]){adj[a].push(b);adj[b].push(a)}});const active=adj.map((a,i)=>a.length?i:-1).filter(i=>i>=0);if(!active.length||active.some(i=>adj[i].length!==2))return false;const seen=new Set<number>(),stack=[active[0]];while(stack.length){const v=stack.pop()!;if(seen.has(v))continue;seen.add(v);stack.push(...adj[v]);}return seen.size===active.length;}
export function countSolutions(n:number,clues:number[],deadline:number){const {edges,cells}=geometry(n);const groups=cells.map((es,i)=>({es,min:clues[i],max:clues[i]})).filter(g=>g.min>=0);for(let v=0;v<(n+1)**2;v++)groups.push({es:edges.flatMap((e,i)=>e.includes(v)?[i]:[]),min:-1,max:2});let count=0,nodes=0;function search(a:number[]){if(++nodes%16===0&&Date.now()>deadline)throw Error('timeout');let change=true;while(change){change=false;for(const g of groups){const on=g.es.filter(e=>a[e]===1).length,u=g.es.filter(e=>a[e]===-1);const allowed=g.min<0?[0,2]:[g.min];const possible=allowed.filter(t=>t>=on&&t<=on+u.length);if(!possible.length)return; if(u.length&&(possible.every(t=>t===on)||possible.every(t=>t===on+u.length))){const val=possible[0]===on?0:1;u.forEach(e=>a[e]=val);change=true;}}}let e=a.indexOf(-1);if(e<0){if(won(n,clues,a))count++;return;}for(const v of [0,1]){const b=a.slice();b[e]=v;search(b);if(count>=2)return;}}search(Array(edges.length).fill(-1));return count;}
export function generate(n:number){
 const end=Date.now()+3500,{edges,cells}=geometry(n);
 for(let attempt=0;attempt<30&&Date.now()<end;attempt++){
  const region=new Set<number>();
  const left=Math.floor(Math.random()*(n-3)),top=Math.floor(Math.random()*(n-3));
  const right=left+2+Math.floor(Math.random()*(n-left-2)),bottom=top+2+Math.floor(Math.random()*(n-top-2));
  for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++)region.add(y*n+x);
  const boundary=()=>{const a=Array(edges.length).fill(0);region.forEach(i=>cells[i].forEach(e=>a[e]^=1));return a;};
  // Local changes are accepted only when the boundary remains one simple loop.
  for(let k=0;k<n*n*5;k++){
   const i=Math.floor(Math.random()*n*n),had=region.has(i);
   if(had)region.delete(i);else region.add(i);
   if(!won(n,Array(n*n).fill(-1),boundary())){if(had)region.add(i);else region.delete(i);}
  }
  const answer=boundary(),clues=cells.map(c=>c.reduce((s,e)=>s+answer[e],0));
  try{if(countSolutions(n,clues,Math.min(end,Date.now()+180))!==1)continue;}catch{continue;}
  const order=Array.from({length:n*n},(_,i)=>i);
  for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
  let removed=0;const target=Math.ceil(n*n*.38);
  for(const i of order){
   if(removed>=target||Date.now()>end-100)break;
   const old=clues[i];clues[i]=-1;
   try{if(countSolutions(n,clues,Math.min(end-50,Date.now()+70))===1){removed++;continue;}}catch{}
   clues[i]=old;
  }
  if(removed>0)return clues;
 }
 throw Error('生成超时，请重试');
}

