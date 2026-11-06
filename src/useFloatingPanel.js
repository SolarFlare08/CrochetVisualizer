import {useRef,useState,useLayoutEffect} from 'react';
const KEY='loop-studio-timer-position-v1';
export function clampPanel(position,width,height,panelWidth,panelHeight){
  return {x:Math.max(8,Math.min(position.x,Math.max(8,width-panelWidth-8))),y:Math.max(8,Math.min(position.y,Math.max(8,height-panelHeight-8)))};
}
export function useFloatingPanel(){
  const ref=useRef(null),drag=useRef(null),current=useRef(null);
  const [position,setPosition]=useState(null),[dragging,setDragging]=useState(false);
  function persist(value){try{localStorage.setItem(KEY,JSON.stringify(value));}catch{}}
  function move(value,save=false){
    const el=ref.current,parent=el?.parentElement;if(!el||!parent)return;
    const next=clampPanel(value,parent.clientWidth,parent.clientHeight,el.offsetWidth,el.offsetHeight);
    if(current.current?.x!==next.x||current.current?.y!==next.y){current.current=next;setPosition(next);}
    if(save)persist(next);
  }
  useLayoutEffect(()=>{
    const el=ref.current,parent=el.parentElement;
    let saved;try{saved=JSON.parse(localStorage.getItem(KEY));}catch{}
    const valid=saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.y);
    move(valid?saved:{x:parent.clientWidth-el.offsetWidth-20,y:parent.clientHeight-el.offsetHeight-130});
    const observer=new ResizeObserver(()=>move(current.current||{x:8,y:8}));
    observer.observe(parent);observer.observe(el);return()=>observer.disconnect();
  },[]);
  function finish(e){
    if(drag.current?.id!==e.pointerId)return;
    drag.current=null;setDragging(false);if(current.current)persist(current.current);
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
  }
  const handle={
    onPointerDown:e=>{
      if(e.button!==0||drag.current)return;e.preventDefault();e.stopPropagation();
      e.currentTarget.focus();e.currentTarget.setPointerCapture(e.pointerId);
      drag.current={id:e.pointerId,x:e.clientX,y:e.clientY,start:current.current};setDragging(true);
    },
    onPointerMove:e=>{const d=drag.current;if(!d||d.id!==e.pointerId)return;e.preventDefault();move({x:d.start.x+e.clientX-d.x,y:d.start.y+e.clientY-d.y});},
    onPointerUp:finish,onPointerCancel:finish,onLostPointerCapture:finish,
    onKeyDown:e=>{
      if(e.key===' '){e.preventDefault();e.stopPropagation();return;}
      const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];if(!delta)return;
      e.preventDefault();e.stopPropagation();const amount=e.shiftKey?1:10,p=current.current;
      if(p)move({x:p.x+delta[0]*amount,y:p.y+delta[1]*amount},true);
    },
  };
  return {ref,handle,dragging,style:position?{left:position.x,top:position.y,right:'auto',bottom:'auto'}:{visibility:'hidden'}};
}
