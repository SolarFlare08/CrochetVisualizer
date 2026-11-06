import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createPatternHistory,patternHistory} from '../src/patternHistory.js';
const original={text:'R1: 6 sc in MR',paste:'original source',progress:{round:0,stitch:4}};
const edit=(value,time=0)=>({type:'edit',value,time,typing:true,kind:'insertText'});

test('a typing burst undoes together and restores the pre-edit crochet position',()=>{
  let state=createPatternHistory(original);
  state=patternHistory(state,edit('R1: 7 sc in MR',10));
  state=patternHistory(state,edit('R1: 8 sc in MR',200));
  assert.equal(state.past.length,1);
  assert.deepEqual(state.current.progress,{round:0,stitch:0});
  state=patternHistory(state,{type:'undo'});
  assert.deepEqual(state.current,original);
  state=patternHistory(state,{type:'redo'});
  assert.equal(state.current.text,'R1: 8 sc in MR');
  assert.deepEqual(state.current.progress,{round:0,stitch:0});
});
test('pauses and navigation separate edits and new edits clear redo',()=>{
  let state=patternHistory(createPatternHistory(original),edit('a',0));
  state=patternHistory(state,edit('b',1000));
  state=patternHistory(state,{type:'break'});
  state=patternHistory(state,edit('c',1100));
  assert.equal(state.past.length,3);
  state=patternHistory(state,{type:'undo'});
  assert.equal(state.current.text,'b');
  state=patternHistory(state,edit('d',1200));
  assert.equal(state.future.length,0);
  assert.equal(patternHistory(state,{type:'redo'}),state);
});
test('AI/sample replacements and imported progress can be undone and redone',()=>{
  let state=patternHistory(createPatternHistory(original),{type:'edit',value:'AI conversion'});
  const imported={text:'imported pattern',paste:'imported source',progress:{round:2,stitch:3}};
  state=patternHistory(state,{type:'replace',value:imported});
  state=patternHistory(state,{type:'undo'});assert.equal(state.current.text,'AI conversion');
  state=patternHistory(state,{type:'redo'});assert.deepEqual(state.current,imported);
});
test('counter changes do not create pattern edits but are retained when redoing',()=>{
  let state=patternHistory(createPatternHistory(original),{type:'edit',value:'new pattern'});
  state=patternHistory(state,{type:'progress',value:p=>({...p,stitch:2})});
  assert.equal(state.past.length,1);
  state=patternHistory(state,{type:'undo'});assert.deepEqual(state.current,original);
  state=patternHistory(state,{type:'redo'});assert.equal(state.current.progress.stitch,2);
});
test('history is bounded and identical edits do not reset progress',()=>{
  let state=createPatternHistory(original);
  assert.equal(patternHistory(state,{type:'edit',value:original.text}),state);
  for(let i=0;i<120;i++)state=patternHistory(state,{type:'edit',value:String(i)});
  assert.equal(state.past.length,100);
});
