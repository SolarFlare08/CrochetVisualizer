import React,{useState,useRef,useEffect} from 'react';
import {Sun,Moon,Ghost,Leaf,TreePine,Waves,Flower2} from 'lucide-react';
import {APPEARANCES} from './appearances.js';
import './appearancePicker.css';
const icons={sun:Sun,moon:Moon,ghost:Ghost,leaf:Leaf,tree:TreePine,waves:Waves,flower:Flower2};
export default function AppearancePicker({value,onChange}){
  const [open,setOpen]=useState(false),root=useRef(null),trigger=useRef(null),leave=useRef(null);
  useEffect(()=>{const close=e=>{if(!root.current?.contains(e.target))setOpen(false);};document.addEventListener('pointerdown',close);return()=>{document.removeEventListener('pointerdown',close);clearTimeout(leave.current);};},[]);
  const Icon=icons[value.icon];
  return <div ref={root} className={`appearance-picker ${open?'open':''}`} onMouseEnter={()=>{clearTimeout(leave.current);setOpen(true);}} onMouseLeave={()=>{leave.current=setTimeout(()=>setOpen(false),250);}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);trigger.current.focus();}}}>
    <button ref={trigger} type="button" className="preview-tool-circle appearance-trigger" aria-label={`Appearance: ${value.label}`} aria-expanded={open} aria-controls="appearance-orbit" title="Choose appearance" onClick={()=>setOpen(v=>!v)}><Icon size={17}/></button>
    <div id="appearance-orbit" className="appearance-orbit" role="group" aria-label="Choose appearance" aria-hidden={!open}>{APPEARANCES.map((theme,i)=>{
      const Symbol=icons[theme.icon],angle=-Math.PI/2+i*Math.PI*2/APPEARANCES.length;
      return <button key={theme.id} type="button" tabIndex={open?0:-1} className={`appearance-choice ${value.id===theme.id?'selected':''}`} style={{'--orbit-x':`${Math.cos(angle)*62}px`,'--orbit-y':`${Math.sin(angle)*62}px`,background:theme.panel,color:theme.accent,borderColor:theme.border}} aria-label={`${theme.label} appearance`} aria-pressed={value.id===theme.id} title={theme.label} onClick={()=>{onChange(theme.id);setOpen(false);trigger.current.focus();}}><Symbol size={17}/><span>{theme.label}</span></button>;
    })}</div>
  </div>;
}
