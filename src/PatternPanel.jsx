import React,{useState} from 'react';
import {FileText,ClipboardPaste,CheckCircle2,AlertCircle,ChevronRight,Orbit,FlaskConical} from 'lucide-react';
import PatternHistoryControls from './PatternHistoryControls';
import AIFormatter from './AIFormatter';
import {SAMPLE} from './pattern';
import {formatPattern} from './fabricSolver';
import './patternPanel.css';

export default function PatternPanel({history,parsed,allowed}){
  const [tab,setTab]=useState('edit'),[notes,setNotes]=useState([]);
  const {text,paste,setPaste}=history;
  function apply(value){history.edit(value);setTab('edit');}
  return <aside className="panel user-pattern pattern-panel-clean"><div className="workspace-identity"><a href="?" aria-label="Loop and Orbit"><Orbit size={23}/><strong>loop <i>&</i> orbit</strong></a><a className="workspace-lab-link" href="?mode=lab#projects" aria-label="Experimental studio" title="Experimental studio"><FlaskConical size={16}/></a></div>
    <div className="pattern-panel-title"><div><FileText size={17}/><h2>Your pattern</h2></div><span className="pattern-terms">US TERMS</span></div>
    <div className="pattern-panel-tabs" role="tablist" aria-label="Pattern tools"><button id="edit-pattern-tab" role="tab" aria-selected={tab==='edit'} aria-controls="edit-pattern-panel" onClick={()=>setTab('edit')}><FileText size={14}/> Pattern</button><button id="paste-pattern-tab" role="tab" aria-selected={tab==='paste'} aria-controls="paste-pattern-panel" onClick={()=>setTab('paste')}><ClipboardPaste size={14}/> Add pattern</button></div>
    <div id="edit-pattern-panel" role="tabpanel" aria-labelledby="edit-pattern-tab" hidden={tab!=='edit'} className="pattern-edit-tab">
      <div className="pattern-editor-toolbar"><span>Round-by-round instructions</span><PatternHistoryControls undo={history.undo} redo={history.redo} canUndo={history.canUndo} canRedo={history.canRedo}/></div>
      <textarea className="pattern-main-editor" data-pattern-editor aria-label="Crochet pattern" spellCheck={false} value={text} onChange={e=>{const kind=e.nativeEvent.inputType||'typing';history.edit(e.target.value,{typing:!['insertFromPaste','insertFromDrop','insertReplacementText'].includes(kind),kind});}} onBlur={history.breakGroup} onMouseDown={history.breakGroup} onPaste={history.breakGroup} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End','PageUp','PageDown'].includes(e.key))history.breakGroup();}}/>
      <div className={`pattern-check ${allowed?'ready':'needs-review'}`} role="status">{allowed?<><CheckCircle2 size={14}/><span>{parsed.rounds.length} rounds <i>·</i> {parsed.stitches} stitches</span><b>Ready</b></>:<><AlertCircle size={14}/><span>{parsed.issues.length?`${parsed.issues.length} issues to review`:'Unsupported stitches'}</span></>}</div>
      {!allowed&&<div className="pattern-error-list">{parsed.issues.map((issue,i)=><p key={i}>{issue.message}</p>)}{parsed.supported&&<p>Use SC, INC, DEC and MR here. Other stitches belong in Experimental studio.</p>}</div>}
      <div className="pattern-panel-footer"><button onClick={()=>apply(SAMPLE)}>Try sample <ChevronRight size={12}/></button><details><summary>Notation & shortcuts</summary><p>SC · single crochet<br/>INC · increase<br/>DEC · decrease<br/>MR · magic ring</p><pre>{'R1: 6 sc in MR (6)\nR2: inc x6 (12)'}</pre><p>Ctrl+Z to undo · Ctrl+Shift+Z to redo.<br/>Pattern edits reset the counter; undo restores its previous position.</p></details></div>
    </div>
    <div id="paste-pattern-panel" role="tabpanel" aria-labelledby="paste-pattern-tab" hidden={tab!=='paste'} className="pattern-paste-tab">
      <h3>Bring in a pattern</h3><p>Paste instructions, then choose how to format them.</p><label htmlFor="pattern-source">Original text</label><textarea id="pattern-source" spellCheck={false} value={paste} onChange={e=>setPaste(e.target.value)} placeholder={'Round 1: 6 single crochet in a magic ring…'}/>
      <button className="pattern-quick-format" disabled={!paste.trim()} onClick={()=>{const result=formatPattern(paste);setNotes(result.notes);apply(result.text);}}>Quick format <ChevronRight size={14}/></button><small>For simple notation · no AI</small>
      <details className="pattern-ai-section"><summary>Format with AI <span>Ollama</span></summary><AIFormatter source={paste} onApply={apply}/></details>
      <button className="pattern-back" onClick={()=>setTab('edit')}>Back to pattern</button>
    </div>
    {tab==='edit'&&notes.length>0&&<details className="pattern-format-notes"><summary>Formatter notes ({notes.length})</summary>{notes.map((note,i)=><p key={i}>{note}</p>)}</details>}
  </aside>;
}
