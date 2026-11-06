export function estimateRemaining(samples,remaining){
  if(remaining<=0)return 0;
  const valid=samples.filter(ms=>Number.isFinite(ms)&&ms>=100&&ms<=120000).slice(-30);
  if(valid.length<3||valid.reduce((n,ms)=>n+ms,0)<5000)return null;
  const sorted=[...valid].sort((a,b)=>a-b);
  // Trim outliers once enough actions are available.
  const trim=sorted.length>=10?Math.floor(sorted.length*.1):0;
  const values=sorted.slice(trim,trim?sorted.length-trim:undefined);
  return values.reduce((sum,n)=>sum+n,0)/values.length*remaining;
}
export function formatRemaining(ms){
  if(ms===0)return 'Finished';
  const minutes=Math.max(1,Math.ceil(ms/60000));
  if(minutes<60)return `~${minutes} min`;
  return `~${Math.floor(minutes/60)}h ${minutes%60}m`;
}
