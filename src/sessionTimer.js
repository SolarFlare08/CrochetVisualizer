export function elapsedSession(timer,now=Date.now()){
  return timer.elapsed+(timer.startedAt===null?0:Math.max(0,now-timer.startedAt));
}
export function changeSession(timer,action,now=Date.now()){
  if(action==='pause')return {elapsed:elapsedSession(timer,now),startedAt:null};
  if(action==='resume')return timer.startedAt===null?{elapsed:timer.elapsed,startedAt:now}:timer;
  if(action==='restart')return {elapsed:0,startedAt:timer.startedAt===null?null:now};
  return timer;
}
export function restoreSession(value){
  if(!value||!Number.isFinite(value.elapsed)||value.elapsed<0||!(value.startedAt===null||(Number.isFinite(value.startedAt)&&value.startedAt>0)))return {elapsed:0,startedAt:null};
  return {elapsed:value.elapsed,startedAt:value.startedAt};
}
export function formatSession(milliseconds){
  const seconds=Math.floor(milliseconds/1000);
  return [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
}
