import {useState,useEffect} from 'react';
import {appearanceFor,APPEARANCES} from './appearances.js';
const KEY='loop-studio-theme-v1';
export function useTheme(){
  const [id,setId]=useState(()=>{try{const saved=localStorage.getItem(KEY);if(saved==='dark')return 'night';if(saved==='light')return 'day';if(APPEARANCES.some(t=>t.id===saved))return saved;}catch{}return window.matchMedia?.('(prefers-color-scheme: dark)').matches?'night':'day';});
  useEffect(()=>{try{localStorage.setItem(KEY,id);}catch{}},[id]);
  return [appearanceFor(id),setId];
}
