import React from 'react';
import {workActions} from './workActions.js';
import './totalProgress.css';

export function projectProgress(rounds,progress){
  const actions=rounds.map(workActions),total=actions.reduce((n,r)=>n+r.length,0);
  const ri=Math.max(0,Math.min(progress.round,rounds.length-1)),current=Math.max(0,Math.min(progress.stitch,actions[ri]?.length||0));
  const worked=actions.slice(0,ri).reduce((n,r)=>n+r.length,0)+current;
  const outputs=actions.slice(0,ri).flat().concat((actions[ri]||[]).slice(0,current)).reduce((n,a)=>n+a.made,0);
  return {total,worked,outputs,roundsDone:ri+(actions[ri]?.length>0&&current===actions[ri].length?1:0),percent:total?Math.floor(worked/total*1000)/10:0};
}
export default function TotalProgress({rounds,progress,enabled}){
  const p=projectProgress(rounds,progress);
  return <footer className="total-progress"><div className="total-progress-info"><strong>Project progress</strong><span>{enabled?`${p.worked} / ${p.total} actions · ${p.roundsDone} / ${rounds.length} rounds complete · ${p.outputs} stitches made`:'Validate your pattern to track progress'}</span></div><div className="total-progress-track" role="progressbar" aria-label="Total project progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={enabled?p.percent:0}><span style={{width:`${enabled?p.percent:0}%`}}/></div><b>{enabled?p.percent:0}%</b></footer>;
}
