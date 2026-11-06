import AppearancePicker from './AppearancePicker';
import {appearanceStyle} from './appearances';
import './appearanceSkin.css';
import PreviewSettings,{usePreviewSettings} from './PreviewSettings';
import {useTheme} from './useTheme';
import './darkMode.css';
import PatternPanel from './PatternPanel';
import SessionTimer from './SessionTimer.jsx';
import {usePatternHistory} from './usePatternHistory';
import ProgressBackup from './ProgressBackup.jsx';
import {workActions,migrateProgress} from './workActions';
import TotalProgress,{projectProgress} from './TotalProgress';
import CounterPanel from './CounterPanel';
import React,{useState,useMemo,useEffect} from 'react';
import Preview from './Preview';
import {SAMPLE,parsePattern,advanceProgress} from './pattern';
import {solveFabric} from './fabricSolver';
import './user.css';
import './previewPolish.css';
import './previewSettings.css';
import './orbitMotion.css';
import './seasonalAccents.css';
const KEY='loop-user-workspace-v1';
export default function UserWorkspace(){
  const [saved,setSaved]=useState(()=>{try{return JSON.parse(localStorage.getItem(KEY))||{};}catch{return {};}});
  const initial=useMemo(()=>({text:saved.text||SAMPLE,paste:saved.paste||'',progress:saved.progressUnit==='action'?saved.progress:migrateProgress(saved.progress,parsePattern(saved.text||SAMPLE).rounds)}),[saved]);
  const history=usePatternHistory(initial);
  const {text,paste,progress,setPaste,setProgress}=history;
  const [message,setMessage]=useState(''),[camera,setCamera]=useState('orbit'),[resetCamera,setResetCamera]=useState(0);
  const [theme,setTheme]=useTheme();
  useEffect(()=>{const previous=document.title;document.title='Loop & Orbit · Crochet workspace';return()=>{document.title=previous;};},[]);
  const dark=theme.dark;
  const [viewSettings,setViewSettings]=usePreviewSettings();
  const parsed=useMemo(()=>parsePattern(text),[text]);
  const allowed=parsed.supported&&parsed.rounds.every(r=>!r.rowMode&&r.ops.every(op=>['sc','inc','dec','sc2inc','sc2tog','sc2dec'].includes(op)));
  const solution=useMemo(()=>allowed?solveFabric(parsed.rounds):null,[parsed,allowed]);
  const ri=Math.min(progress.round,Math.max(0,parsed.rounds.length-1)),round=parsed.rounds[ri],done=ri===parsed.rounds.length-1&&progress.stitch===round?.ops.length;
  const actions=workActions(round),action=actions[progress.stitch],output=action?.output??round?.count??0;
  const actionRounds=useMemo(()=>parsed.rounds.map(r=>({...r,count:r.ops.length})),[parsed]);
  const totals=projectProgress(parsed.rounds,progress);
  const step=dir=>setProgress(p=>advanceProgress(p,actionRounds,dir));
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify({text,paste,progress,progressUnit:'action'}));setMessage('Saved on this device');}catch{setMessage('Storage unavailable');}},[text,paste,progress]);
  useEffect(()=>{const key=e=>{if(e.code!=='Space'||e.repeat||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,button,select,[contenteditable="true"]'))return;if(allowed&&!done){e.preventDefault();step(1);}};addEventListener('keydown',key);return()=>removeEventListener('keydown',key);},[allowed,done,parsed]);
  useEffect(()=>{
    const shortcut=e=>{
      if(e.isComposing||e.altKey||!(e.ctrlKey||e.metaKey))return;
      const key=e.key.toLowerCase(),undo=key==='z'&&!e.shiftKey,redo=(key==='z'&&e.shiftKey)||(key==='y'&&!e.shiftKey);
      if(!undo&&!redo)return;
      const target=e.target;
      if(target.closest('input,textarea,select,[contenteditable="true"]')&&!target.matches('[data-pattern-editor]'))return;
      e.preventDefault();
      if(undo)history.undo();else history.redo();
    };
    addEventListener('keydown',shortcut);return()=>removeEventListener('keydown',shortcut);
  },[history.undo,history.redo]);
  return <div className="user-workspace" data-theme={dark?'dark':'light'} data-appearance={theme.id} style={appearanceStyle(theme)}><main>
    <PatternPanel history={history} parsed={parsed} allowed={allowed}/>
    <section className="panel user-preview"><div className="user-preview-label"><strong>Your crochet, stitch by stitch</strong><span>{done?'All stitches complete':`Next: ${action?.label||'—'} · stitch ${progress.stitch+1} · round ${round?.number??'—'}`}</span></div><div className="preview-legend"><span><i className="legend-next"/>Next</span><span><i className="legend-worked"/>Worked</span><span><i className="legend-pending"/>Pending</span></div>{allowed&&!solution?.error?<Preview palette={theme} surfaceOpacity={viewSettings.opacity} hideFutureRounds={viewSettings.hideFuture} dark={dark} rounds={parsed.rounds} solution={solution} color="#7f90b4" gauge={20} rowGauge={24} widthScale={1} heightScale={1} currentRound={ri} currentStitch={output} activeOutputCount={action?.made||1} actionLabel={action?.label} actionNumber={progress.stitch+1} view="sketch" camera={camera} resetCamera={resetCamera} cutaway={false}/>:<div className="solver-empty">{solution?.error||'Resolve the pattern instructions to calculate its construction.'}</div>}<div className="user-camera">{[['orbit','Overview'],['front','Front'],['top','Top'],['stitch','Follow stitch']].map(([c,label])=><button key={c} aria-pressed={camera===c} className={camera===c?'selected':''} onClick={()=>{setCamera(c);setResetCamera(n=>n+1);}}>{label}</button>)}</div><div className="preview-guidance"><span>Drag to rotate · Scroll to zoom</span><details><summary>About this sketch</summary><p>Approximate relaxed stitch network. Yarn tension and stuffing can change the final shape.</p><p>240 relaxation passes · mean length error {solution?.strain!==undefined?(solution.strain*100).toFixed(1):'—'}%</p></details></div><div className="preview-tools"><AppearancePicker value={theme} onChange={setTheme}/><PreviewSettings value={viewSettings} onChange={setViewSettings}/></div><SessionTimer pattern={text} completed={totals.worked} total={totals.total} valid={allowed}/><TotalProgress rounds={parsed.rounds} progress={progress} enabled={allowed}/></section>
    <CounterPanel actionCount={actions.length} actionLabel={action?.label} round={round} roundIndex={ri} totalRounds={parsed.rounds.length} stitch={progress.stitch} done={done} enabled={allowed} onStep={step} onResume={n=>setProgress({round:ri,stitch:n})} onComplete={()=>setProgress(ri<parsed.rounds.length-1?{round:ri+1,stitch:0}:{round:ri,stitch:round.ops.length})} onReset={()=>setProgress({round:0,stitch:0})} message={message} backup={<ProgressBackup text={text} paste={paste} progress={progress} onImport={value=>history.replace({text:value.text,paste:value.paste,progress:value.progress})}/>}/>
  </main></div>;
}
