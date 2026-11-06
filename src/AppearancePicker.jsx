import React,{useState,useRef,useEffect} from 'react';
import {Sun,Moon,Ghost,Leaf,TreePine,Waves,Flower2} from 'lucide-react';
import {APPEARANCES} from './appearances.js';
import './appearancePicker.css';
const icons={sun:Sun,moon:Moon,ghost:Ghost,leaf:Leaf,tree:TreePine,waves:Waves,flower:Flower2};
const swatches={day:['#fff0c8','#ba7519','#e4bc67'],night:['#1b2028','#c4d1e8','#626e86'],halloween:['#fff0dd','#c46629','#a77dba'],thanksgiving:['#fff7ec','#9d6241','#d9b99b'],christmas:['#fffdf5','#28744b','#dba5a0'],ocean:['#d5f4f4','#097d8e','#70bdc9'],lavender:['#ebddfc','#8851b7','#bc94de']};
export default function AppearancePicker({value,onChange}){
  const [open,setOpen]=useState(false),root=useRef(null),trigger=useRef(null),leave=useRef(null);
  useEffect(()=>{const close=e=>{if(!root.current?.contains(e.target))setOpen(false);};document.addEventListener('pointerdown',close);return()=>{document.removeEventListener('pointerdown',close);clearTimeout(leave.current);};},[]);
  const Icon=icons[value.icon];
  const current=swatches[value.id];
  return <div ref={root} className={`appearance-picker ${open?'open':''}`} onMouseEnter={()=>{clearTimeout(leave.current);setOpen(true);}} onMouseLeave={()=>{leave.current=setTimeout(()=>setOpen(false),250);}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false);}} onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);trigger.current.focus();}}}>
    <button ref={trigger} type="button" className="preview-tool-circle appearance-trigger" style={{background:current[0],color:current[1],borderColor:current[2]}} aria-label={`Appearance: ${value.label}`} aria-expanded={open} aria-controls="appearance-orbit" title="Choose appearance" onClick={e=>setOpen(v=>e.detail===0?!v:true)}><Icon size={17}/></button>
    <div id="appearance-orbit" className="appearance-orbit" role="group" aria-label="Choose appearance" aria-hidden={!open}>{APPEARANCES.map((theme,i)=>{
      const Symbol=icons[theme.icon],angle=-Math.PI/2+i*Math.PI*2/APPEARANCES.length,swatch=swatches[theme.id];
      return <button key={theme.id} type="button" tabIndex={open?0:-1} className={`appearance-choice ${value.id===theme.id?'selected':''}`} style={{'--orbit-x':`${Math.cos(angle)*62}px`,'--orbit-y':`${Math.sin(angle)*62}px`,'--choice-index':i,'--choice-ink':swatch[1],background:swatch[0],color:swatch[1],borderColor:swatch[2]}} aria-label={`${theme.label} appearance`} aria-pressed={value.id===theme.id} title={theme.label} onClick={()=>{onChange(theme.id);setOpen(false);trigger.current.focus();}}><Symbol size={17}/><span>{theme.label}</span></button>;
    })}</div>
  </div>;
}
