import {operation} from './language.js';

export function workActions(round){
  let output=0;
  return (round?.ops||[]).map(op=>{
    const spec=operation(op),start=output;output+=spec.made;
    return {output:start,made:spec.made,label:spec.made>1?'INC':spec.used>1?'DEC':spec.type.toUpperCase()};
  });
}
export function migrateProgress(progress,rounds){
  const ri=Math.max(0,Math.min(progress?.round||0,rounds.length-1));
  const actions=workActions(rounds[ri]);
  const old=progress?.stitch||0;
  const index=actions.findIndex(a=>old<a.output+a.made);
  return {round:ri,stitch:index<0?actions.length:index};
}
