import {useState,useEffect} from 'react';
const KEY='loop-studio-theme-v1';
export function useTheme(){
  const [dark,setDark]=useState(()=>{try{const saved=localStorage.getItem(KEY);if(saved==='dark'||saved==='light')return saved==='dark';}catch{}return window.matchMedia?.('(prefers-color-scheme: dark)').matches||false;});
  useEffect(()=>{try{localStorage.setItem(KEY,dark?'dark':'light');}catch{}},[dark]);
  return [dark,()=>setDark(value=>!value)];
}
