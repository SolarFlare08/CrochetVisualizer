import React from 'react';
import {Check,Minus,Plus,RotateCcw,CheckCircle2} from 'lucide-react';
import './counter.css';

export default function CounterPanel({round,roundIndex,totalRounds,stitch,done,enabled,onStep,onResume,onComplete,onReset,message}){
  const total=round?.count||0,percent=total?Math.min(100,stitch/total*100):0;
  return <aside className="panel user-counter counter-panel">
    <div className="counter-heading"><h2>On your hook</h2><span className="counter-round">Round {round?.number??'—'} <span>/ {totalRounds}</span></span></div>
    <div className="counter-readout"><span className="counter-caption">{done?'PROJECT COMPLETE':'STITCHES WORKED'}</span><div className="user-count" aria-live="polite">{String(stitch).padStart(2,'0')}<small>/ {total||'—'}</small></div><div className="counter-meter" role="progressbar" aria-label="Current round progress" aria-valuemin={0} aria-valuemax={total||1} aria-valuenow={stitch}><span style={{width:`${percent}%`}}/></div><p>{done?'Every stitch, made by you.':`${Math.max(0,total-stitch)} stitches left this round`}</p></div>
    <div className="counter-buttons"><button disabled={!enabled||(!roundIndex&&!stitch)} aria-label="Previous stitch" onClick={()=>onStep(-1)}><Minus size={18}/></button><button disabled={!enabled||done} className="counter-plus" onClick={()=>onStep(1)}><Plus size={18}/> Next stitch</button></div>
    <p className="counter-shortcut">or press <kbd>Space</kbd></p>
    <section className="counter-instruction"><span className="counter-caption">{done?'FINISHED':`CURRENT ROUND · R${round?.number??'—'}`}</span><p>{round?.instruction||'Add a pattern to get started.'}</p></section>
    <div className="counter-stitch-heading"><span>Stitch progress</span><span>{stitch} of {total}</span></div>
    <div className="stitch-strip" aria-label="Stitches in current round">{Array.from({length:Math.min(total,240)},(_,n)=><button key={n} disabled={!enabled} aria-label={`Resume before stitch ${n+1}`} aria-current={n===stitch?'step':undefined} className={n<stitch?'worked':n===stitch?'next':''} onClick={()=>onResume(n)}>{n<stitch?<Check size={12}/>:n+1}</button>)}</div>
    <button disabled={!enabled||done} className="complete-button" onClick={onComplete}><Check size={16}/>{done?'Project complete':'Complete round'}</button>
    <button className="counter-reset" onClick={onReset}><RotateCcw size={13}/> Reset progress</button>
    <footer className="counter-save"><span role="status"><CheckCircle2 size={13}/>{message}</span><p>Space adds a stitch outside text fields and controls. Your place saves automatically.</p></footer>
  </aside>;
}
