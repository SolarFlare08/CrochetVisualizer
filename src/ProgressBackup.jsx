import React,{useRef,useState} from 'react';
import {Download,Upload} from 'lucide-react';
import {createProgressBackup,readProgressBackup} from './progressBackup.js';
import './progressBackup.css';

export default function ProgressBackup({text,paste,progress,onImport}){
  const input=useRef(null),[draft,setDraft]=useState(null),[status,setStatus]=useState(''),[error,setError]=useState('');
  function download(){try{
    const value=createProgressBackup(text,paste,progress),url=URL.createObjectURL(new Blob([JSON.stringify(value,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=`loop-progress-${new Date().toISOString().slice(0,10)}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setError('');setStatus('Backup exported: pattern and saved position.');
  }catch(e){setError(e.message);}}
  async function upload(e){
    const file=e.target.files?.[0];e.target.value='';if(!file)return;setDraft(null);setError('');setStatus('');
    try{if(file.size>512000)throw Error('Choose a progress backup smaller than 500 KB.');const data=readProgressBackup(JSON.parse(await file.text()));setDraft(data);}
    catch(e){setError(e instanceof SyntaxError?'That file is not readable JSON. Choose an exported progress backup.':e.message);}
  }
  return <section className="progress-backup"><span>Keep your place</span><div><button onClick={download}><Download size={13}/> Export progress</button><button onClick={()=>input.current.click()}><Upload size={13}/> Import progress</button></div><input ref={input} type="file" accept=".json,application/json" hidden onChange={upload}/>{error&&<p role="alert">{error}</p>}{status&&<p role="status">{status}</p>}{draft&&<div className="backup-review"><p>Resume round {draft.roundNumber}, after action {draft.progress.stitch}. This replaces the current pattern and position.</p><button onClick={()=>{onImport(draft);setDraft(null);setStatus('Progress restored.');}}>Restore this backup</button><button onClick={()=>setDraft(null)}>Cancel</button></div>}</section>;
}
