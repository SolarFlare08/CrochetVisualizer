import React,{useState,useEffect} from 'react';
import {Timer,Play,Pause,RotateCcw} from 'lucide-react';
import {elapsedSession,changeSession,restoreSession,formatSession} from './sessionTimer.js';
import './sessionTimer.css';
const KEY='loop-studio-session-timer-v1';

export default function SessionTimer(){
  const [timer,setTimer]=useState(()=>{try{return restoreSession(JSON.parse(localStorage.getItem(KEY)));}catch{return restoreSession(null);}});
  const [now,setNow]=useState(Date.now),[storageError,setStorageError]=useState(false);
  const running=timer.startedAt!==null,elapsed=elapsedSession(timer,now);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(timer));setStorageError(false);}catch{setStorageError(true);}},[timer]);
  useEffect(()=>{
    if(!running)return;
    const tick=()=>setNow(Date.now());tick();
    const interval=setInterval(tick,250);document.addEventListener('visibilitychange',tick);
    return()=>{clearInterval(interval);document.removeEventListener('visibilitychange',tick);};
  },[running]);
  function act(action){const time=Date.now();setNow(time);setTimer(previous=>changeSession(previous,action,time));}
  return <section className="session-timer" aria-label="Session timer"><div className="session-timer-caption"><Timer size={12}/><span>Session</span><small>{running?'Running':elapsed>0?'Paused':'Ready'}</small></div><div className="session-timer-controls"><time aria-label="Session elapsed time">{formatSession(elapsed)}</time><button type="button" aria-label={running?'Pause session timer':elapsed>0?'Resume session timer':'Start session timer'} title={running?'Pause timer':'Start or resume timer'} onClick={()=>act(running?'pause':'resume')}>{running?<Pause size={13}/>:<Play size={13}/>}<span>{running?'Pause':elapsed>0?'Resume':'Start'}</span></button><button type="button" className="session-restart" aria-label="Restart session timer" title="Restart timer at zero" onClick={()=>act('restart')}><RotateCcw size={13}/></button></div>{storageError&&<small role="status">Timer cannot be saved on this device.</small>}</section>;
}
