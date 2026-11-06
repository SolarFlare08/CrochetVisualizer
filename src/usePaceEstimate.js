import {useState,useRef,useEffect} from 'react';
import {estimateRemaining} from './paceEstimate.js';
const KEY='loop-studio-pace-v1';
export function usePaceEstimate({pattern,completed,total,elapsed,running}){
  const [pace,setPace]=useState(()=>{try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved?.pattern===pattern&&Array.isArray(saved.samples))return {pattern,samples:saved.samples.filter(n=>Number.isFinite(n)&&n>=100&&n<=120000).slice(-30)};}catch{}return {pattern,samples:[]};});
  const checkpoint=useRef(null);
  useEffect(()=>{
    const previous=checkpoint.current;
    if(previous&&previous.pattern===pattern&&previous.running&&running&&completed-previous.completed===1){
      const duration=elapsed-previous.elapsed;
      if(duration>=100&&duration<=120000)setPace(p=>({pattern,samples:[...(p.pattern===pattern?p.samples:[]),duration].slice(-30)}));
    }
    if(pace.pattern!==pattern)setPace({pattern,samples:[]});
    checkpoint.current={pattern,completed,elapsed,running};
    // Checkpoints follow work actions and pause/resume, rather than timer ticks.
  },[pattern,completed,running]);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(pace));}catch{}},[pace]);
  function resetPace(){checkpoint.current={pattern,completed,elapsed:0,running};setPace({pattern,samples:[]});}
  return {remaining:estimateRemaining(pace.pattern===pattern?pace.samples:[],Math.max(0,total-completed)),resetPace};
}
