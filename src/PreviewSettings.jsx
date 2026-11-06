import React,{useState,useEffect,useRef} from 'react';
import {SlidersHorizontal} from 'lucide-react';
import './previewSettings.css';
const KEY='loop-studio-preview-settings-v1';
export function usePreviewSettings(){
  const [settings,setSettings]=useState(()=>{
    try{const value=JSON.parse(localStorage.getItem(KEY));return {opacity:Number.isFinite(value?.opacity)?Math.max(0,Math.min(1,value.opacity)):.32,hideFuture:value?.hideFuture===true};}catch{return {opacity:.32,hideFuture:false};}
  });
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(settings));}catch{}},[settings]);
  return [settings,setSettings];
}
export default function PreviewSettings({value,onChange}){
  const [open,setOpen]=useState(false),root=useRef(null);
  useEffect(()=>{const close=e=>{if(!root.current?.contains(e.target))setOpen(false);};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close);},[]);
  return <div ref={root} className="preview-settings-menu" onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);root.current.querySelector('button').focus();}}}><button type="button" className="preview-tool-circle" aria-label="View settings" aria-expanded={open} aria-controls="preview-settings-popover" title="View settings" onClick={()=>setOpen(v=>!v)}><SlidersHorizontal size={17}/></button>{open&&<section id="preview-settings-popover" className="preview-settings" aria-label="Preview settings"><div className="preview-settings-title"><SlidersHorizontal size={12}/><span>View settings</span></div><label className="surface-opacity-label" htmlFor="surface-opacity">Surface <output htmlFor="surface-opacity">{Math.round(value.opacity*100)}%</output></label><input id="surface-opacity" aria-label="Surface opacity" type="range" min="0" max="100" step="1" value={Math.round(value.opacity*100)} onChange={e=>onChange({...value,opacity:Number(e.target.value)/100})}/><label className="hide-future-label"><span>Hide future rounds</span><input type="checkbox" checked={value.hideFuture} onChange={e=>onChange({...value,hideFuture:e.target.checked})}/></label></section>}</div>;
}
