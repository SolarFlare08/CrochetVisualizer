import React,{useState,useEffect} from 'react';
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
  return <section className="preview-settings" aria-label="Preview settings"><div className="preview-settings-title"><SlidersHorizontal size={12}/><span>View settings</span></div><label className="surface-opacity-label" htmlFor="surface-opacity">Surface <output htmlFor="surface-opacity">{Math.round(value.opacity*100)}%</output></label><input id="surface-opacity" aria-label="Surface opacity" type="range" min="0" max="100" step="1" value={Math.round(value.opacity*100)} onChange={e=>onChange({...value,opacity:Number(e.target.value)/100})}/><label className="hide-future-label"><span>Hide future rounds</span><input type="checkbox" checked={value.hideFuture} onChange={e=>onChange({...value,hideFuture:e.target.checked})}/></label></section>;
}
