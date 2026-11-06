import ProgressBackup from './ProgressBackup.jsx';
import {workActions,migrateProgress} from './workActions';
import TotalProgress from './TotalProgress';
import {stitchDescription} from './stitchDescription';
import AIFormatter from './AIFormatter';
import CounterPanel from './CounterPanel';
import React,{useState,useMemo,useEffect} from 'react';
import Preview from './Preview';
import {SAMPLE,parsePattern,advanceProgress} from './pattern';
import {operation} from './language';
import {solveFabric,formatPattern} from './fabricSolver';
import './user.css';
import './previewPolish.css';
const KEY='loop-user-workspace-v1';
export default function UserWorkspace(){
  const [saved,setSaved]=useState(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return {};}});
  const [text,setText]=useState(saved.text||SAMPLE),[paste,setPaste]=useState(saved.paste||''),[progress,setProgress]=useState(()=>saved.progressUnit==='action'?saved.progress:migrateProgress(saved.progress,parsePattern(saved.text||SAMPLE).rounds)),[message,setMessage]=useState(''),[camera,setCamera]=useState('orbit'),[resetCamera,setResetCamera]=useState(0);
  const parsed=useMemo(()=>parsePattern(text),[text]);
  const allowed=parsed.supported&&parsed.rounds.every(r=>!r.rowMode&&r.ops.every(op=>['sc','inc','dec','sc2inc','sc2tog','sc2dec'].includes(op)));
  const solution=useMemo(()=>allowed?solveFabric(parsed.rounds):null,[parsed,allowed]);
  const ri=Math.min(progress.round,Math.max(0,parsed.rounds.length-1)),round=parsed.rounds[ri],done=ri===parsed.rounds.length-1&&progress.stitch===round?.ops.length;
  const actions=workActions(round),action=actions[progress.stitch],output=action?.output??round?.count??0;
  const actionRounds=useMemo(()=>parsed.rounds.map(r=>({...r,count:r.ops.length})),[parsed]);
  const step=dir=>setProgress(p=>advanceProgress(p,actionRounds,dir));
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify({text,paste,progress,progressUnit:'action'}));setMessage('Saved on this device');}catch{setMessage('Storage unavailable');}},[text,paste,progress]);
  useEffect(()=>{const key=e=>{if(e.code!=='Space'||e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,button,select,[contenteditable="true"]'))return;if(allowed&&!done){e.preventDefault();step(1);}};addEventListener('keydown',key);return()=>removeEventListener('keydown',key);},[allowed,done,parsed]);
  function edit(value){setText(value);setProgress({round:0,stitch:0});}
  return <div className="user-workspace"><header><a className="brand" href="?">loop<span className="brand-light">studio</span></a><span>Make · your crochet companion</span><a className="button secondary" href="?mode=lab#projects">Experimental studio →</a></header><main>
    <aside className="panel user-pattern"><h2>Your pattern</h2><label>Paste a pattern<textarea value={paste} onChange={e=>setPaste(e.target.value)} placeholder="Round 1: 6 single crochet in magic ring…"/></label><button className="button secondary" onClick={()=>{const result=formatPattern(paste);edit(result.text);setMessage(result.notes.length?'Some lines need review':'Formatted. Review the instructions below.');}}>Format into stitch notation</button><small>The button above uses local rules.</small><AIFormatter source={paste} onApply={edit}/><label>Editable instructions<textarea aria-label="Crochet pattern" value={text} onChange={e=>edit(e.target.value)}/></label><button onClick={()=>edit(SAMPLE)}>Load little pear sample</button><div role="status">{!parsed.supported?parsed.issues.map((issue,i)=><p key={i}>{issue.message}</p>):!allowed?<p>This workspace supports SC, INC, DEC and magic rings in continuous rounds. Use Experimental studio for other notation.</p>:<p>Counts validated · {parsed.stitches} stitches</p>}</div></aside>
    <section className="panel user-preview"><div className="user-preview-label"><strong>Your crochet, stitch by stitch</strong><span>{done?'All stitches complete':`Next: ${action?.label||'—'} · stitch ${progress.stitch+1} · round ${round?.number??'—'}`}</span></div><div className="preview-legend"><span><i className="legend-next"/>Next stitch</span><span><i className="legend-worked"/>Worked</span><span><i className="legend-pending"/>Remaining</span></div>{allowed&&!solution?.error?<Preview rounds={parsed.rounds} solution={solution} color="#7f90b4" gauge={20} rowGauge={24} widthScale={1} heightScale={1} currentRound={ri} currentStitch={output} activeOutputCount={action?.made||1} actionLabel={action?.label} actionNumber={progress.stitch+1} view="sketch" camera={camera} resetCamera={resetCamera} cutaway={false}/>:<div className="solver-empty">{solution?.error||'Resolve the pattern instructions to calculate its construction.'}</div>}<div className="user-camera">{[['orbit','Overview'],['front','Front'],['top','Top'],['stitch','Follow stitch']].map(([c,label])=><button key={c} aria-pressed={camera===c} className={camera===c?'selected':''} onClick={()=>{setCamera(c);setResetCamera(n=>n+1);}}>{label}</button>)}</div><div className="preview-guidance"><span>Drag to rotate · Scroll to zoom</span><details><summary>About this sketch</summary><p>Approximate relaxed stitch network. Yarn tension and stuffing can change the final shape.</p><p>240 relaxation passes · mean length error {solution?.strain!==undefined?(solution.strain*100).toFixed(1):'—'}%</p></details></div><TotalProgress rounds={parsed.rounds} progress={progress} enabled={allowed}/></section>
    <CounterPanel actionCount={actions.length} actionLabel={action?.label} round={round} roundIndex={ri} totalRounds={parsed.rounds.length} stitch={progress.stitch} done={done} enabled={allowed} onStep={step} onResume={n=>setProgress({round:ri,stitch:n})} onComplete={()=>setProgress(ri<parsed.rounds.length-1?{round:ri+1,stitch:0}:{round:ri,stitch:round.ops.length})} onReset={()=>setProgress({round:0,stitch:0})} message={message} backup={<ProgressBackup text={text} paste={paste} progress={progress} onImport={value=>{setText(value.text);setPaste(value.paste);setProgress(value.progress);}}/>}/>
  </main></div>;
}
