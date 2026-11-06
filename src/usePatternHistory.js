import {useReducer} from 'react';
import {createPatternHistory,patternHistory} from './patternHistory.js';

export function usePatternHistory(initial){
  const [state,dispatch]=useReducer(patternHistory,initial,createPatternHistory);
  return {
    ...state.current,
    setPaste:value=>dispatch({type:'paste',value}),
    setProgress:value=>dispatch({type:'progress',value}),
    edit:(value,options={})=>dispatch({type:'edit',value,...options,time:Date.now()}),
    replace:value=>dispatch({type:'replace',value}),
    undo:()=>dispatch({type:'undo'}),redo:()=>dispatch({type:'redo'}),
    breakGroup:()=>dispatch({type:'break'}),
    canUndo:state.past.length>0,canRedo:state.future.length>0,
  };
}
