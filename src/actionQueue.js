import {workActions} from './workActions.js';
export function buildActionTimeline(rounds){
  return rounds.flatMap((round,ri)=>workActions(round).map((action,index)=>({...action,key:`${round.number}:${index}`,roundIndex:ri,roundNumber:round.number,actionIndex:index,repeats:round.repeatContexts?.[index]||[],roundRepeat:round.roundRepeat})));
}
export function queuePosition(rounds,roundIndex,stitch){return rounds.slice(0,roundIndex).reduce((sum,r)=>sum+r.ops.length,0)+stitch;}
export function queueWindow(timeline,position,size=4){
  const items=[];
  for(let slot=-1;slot<size;slot++){
    const index=position+slot;if(index<0)continue;
    const item=timeline[index];
    items.push(item?{...item,slot}:{key:`end:${index-timeline.length}`,slot,label:index===timeline.length?'DONE':'—',end:true});
  }
  return items;
}
export function repeatPatternLabel(text){return text.replace(/SC2INC\b/g,'INC').replace(/SC2(?:TOG|DEC)\b/g,'DEC').replace(/(\d+)\s*(SC|INC|DEC)\b/g,'$1 $2');}
