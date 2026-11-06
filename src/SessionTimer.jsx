import {usePaceEstimate} from './usePaceEstimate';
import {formatRemaining} from './paceEstimate';
import {useFloatingPanel} from './useFloatingPanel';
import React,{useState,useEffect} from 'react';
import {Timer,Play,Pause,RotateCcw,GripHorizontal} from 'lucide-react';
import {elapsedSession,changeSession,restoreSession,formatSession} from './sessionTimer.js';
import './sessionTimer.css';
const KEY='loop-studio-session-timer-v1';

export default function SessionTimer({pattern='',completed=0,total=0,valid=true}){
  const floating=useFloatingPanel();
  const [timer,setTimer]=useState(()=>{try{return restoreSession(JSON.parse(localStorage.getItem(KEY)));}catch{return restoreSession(null);}});
  const [now,setNow]=useState(Date.now),[storageError,setStorageError]=useState(false);
  const running=timer.startedAt!==null,elapsed=elapsedSession(timer,now);
  const pace=usePaceEstimate({pattern,completed,total,elapsed:elapsedSession(timer),running:running&&valid});
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(timer));setStorageError(false);}catch{setStorageError(true);}},[timer]);
  useEffect(()=>{
    if(!running)return;
    const tick=()=>setNow(Date.now());tick();
    const interval=setInterval(tick,250);document.addEventListener('visibilitychange',tick);
    return()=>{clearInterval(interval);document.removeEventListener('visibilitychange',tick);};
  },[running]);
  function act(action){if(action==='restart')pace.resetPace();const time=Date.now();setNow(time);setTimer(previous=>changeSession(previous,action,time));}
  return <section ref={floating.ref} style={floating.style} className={`session-timer ${floating.dragging?'is-dragging':''}`} aria-label="Session timer"><div className="session-timer-caption" role="button" tabIndex={0} aria-label="Move session timer" title="Drag to move · Arrow keys move 10px · Shift+Arrow moves 1px" {...floating.handle}><Timer size={12}/><span>Session</span><small>{running?'Running':elapsed>0?'Paused':'Ready'}</small><GripHorizontal size={13}/></div><div className="session-timer-controls"><time aria-label="Session elapsed time">{formatSession(elapsed)}</time><button type="button" aria-label={running?'Pause session timer':elapsed>0?'Resume session timer':'Start session timer'} title={running?'Pause timer':'Start or resume timer'} onClick={()=>act(running?'pause':'resume')}>{running?<Pause size={13}/>:<Play size={13}/>}<span>{running?'Pause':elapsed>0?'Resume':'Start'}</span></button><button type="button" className="session-restart" aria-label="Restart session timer" title="Restart timer at zero" onClick={()=>act('restart')}><RotateCcw size={13}/></button></div><div className="session-eta" title="Estimated from your last 30 timed actions. Skipped rounds and jumps are excluded; pause the timer during breaks."><span>Est. remaining</span><strong>{!valid?'—':pace.remaining!==null?formatRemaining(pace.remaining):running||elapsed>0?'Learning your pace…':'Start timer to estimate'}</strong></div>{storageError&&<small role="status">Timer cannot be saved on this device.</small>}</section>;
}
