import React,{useMemo} from 'react';
import {ArrowRight,Check,Repeat2} from 'lucide-react';
import {buildActionTimeline,queuePosition,queueWindow,repeatPatternLabel} from './actionQueue.js';
import './actionQueue.css';
const descriptions={SC:'Single crochet',INC:'2 SC in the same stitch',DEC:'Work 2 stitches together'};

function RepeatTracker({item}){
  const repeat=item?.repeats?.[0],range=item?.roundRepeat;
  if(!repeat&&!range)return null;
  return <section className="repeat-tracker" aria-label="Current repeat">{repeat&&<><div className="repeat-tracker-heading"><Repeat2 size={12}/><span>Repeat</span><strong>{repeat.iteration} <span>/ {repeat.total}</span></strong></div><code>{repeatPatternLabel(repeat.pattern)}</code><div className="repeat-meter"><span style={{width:`${((repeat.iteration-1)+((repeat.step-1)/repeat.length))/repeat.total*100}%`}}/></div><p>Action {repeat.step} of {repeat.length} in this repeat</p>{item.repeats.length>1&&<small>Within: {repeatPatternLabel(item.repeats.at(-1).pattern)} · {item.repeats.at(-1).iteration} / {item.repeats.at(-1).total}</small>}</>}{range&&<small className="repeat-round-block">Rounds {range.start}–{range.end} · round {range.iteration} of {range.total}</small>}</section>;
}
export default function ActionQueue({rounds,roundIndex,stitch,enabled,done}){
  const timeline=useMemo(()=>enabled?buildActionTimeline(rounds):[],[rounds,enabled]);
  const position=Math.min(timeline.length,queuePosition(rounds,roundIndex,stitch));
  const entries=queueWindow(timeline,position),current=timeline[position];
  return <section className="action-queue" aria-label="Stitch action queue"><div className="action-queue-heading"><span>{done?'All done':'Up next'}</span><small>4-action view</small></div><div className="queue-window" role="list" aria-label="Upcoming actions">{entries.map(item=><div role="listitem" aria-hidden={item.slot<0} aria-current={item.slot===0?'step':undefined} key={item.key} className={`queue-card ${item.slot===0?'is-current':''} ${item.slot<0?'is-leaving':''} ${item.end?'is-end':''}`} style={{transform:`translateY(${item.slot*46}px)`,opacity:item.slot<0?0:1}}><div className="queue-card-content"><span className="queue-position">{item.end?(item.label==='DONE'?<Check size={14}/>:null):item.slot===0?<ArrowRight size={14}/>:`+${item.slot}`}</span><div className="queue-action-name"><strong>{enabled?item.label:'—'}</strong><span>{!enabled?'Add a valid pattern':item.end?(item.label==='DONE'?'End of pattern':''):descriptions[item.label]||item.label}</span></div>{!item.end&&<small>R{item.roundNumber}<span>#{item.actionIndex+1}</span></small>}</div></div>)}</div><span className="queue-announcement" aria-live="polite">{enabled?(current?`Next: ${current.label}, round ${current.roundNumber}, action ${current.actionIndex+1}`:'Pattern complete'):'Pattern unavailable'}</span>{enabled&&current&&<RepeatTracker item={current}/>}</section>;
}
