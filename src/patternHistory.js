const LIMIT=100;
export function createPatternHistory(current){
  return {current,past:[],future:[],group:null};
}
export function patternHistory(state,action){
  const {current,past,future}=state;
  switch(action.type){
    case 'paste':return {...state,current:{...current,paste:action.value}};
    case 'progress':return {...state,group:null,current:{...current,progress:typeof action.value==='function'?action.value(current.progress):action.value}};
    case 'break':return {...state,group:null};
    case 'edit':{
      if(action.value===current.text)return state;
      const grouped=action.typing&&state.group?.kind===action.kind&&action.time-state.group.time<700;
      return {
        current:{...current,text:action.value,progress:{round:0,stitch:0}},
        past:grouped?past:[...past,current].slice(-LIMIT),future:[],
        group:action.typing?{kind:action.kind,time:action.time}:null,
      };
    }
    case 'replace':return {current:action.value,past:[...past,current].slice(-LIMIT),future:[],group:null};
    case 'undo':return past.length?{current:past.at(-1),past:past.slice(0,-1),future:[current,...future].slice(0,LIMIT),group:null}:state;
    case 'redo':return future.length?{current:future[0],past:[...past,current].slice(-LIMIT),future:future.slice(1),group:null}:state;
    default:return state;
  }
}
