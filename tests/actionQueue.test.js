import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePattern} from '../src/pattern.js';
import {readSequence} from '../src/language.js';
import {buildActionTimeline,queuePosition,queueWindow} from '../src/actionQueue.js';
const source='R1: 6 sc in MR (6)\nR2: inc x6 (12)\nR3: [sc, inc] x6 (18)\nR4: [2 sc, inc] x6 (24)\nR5-6: sc around (24)';
test('repeat position follows actions rather than produced stitches',()=>{
  const {rounds}=parsePattern(source),r=rounds[2];
  assert.deepEqual(r.repeatContexts[3][0],{pattern:'SC, INC',iteration:2,total:6,step:2,length:2});
  assert.equal(rounds[1].repeatContexts.length,6);
  assert.equal(rounds[1].repeatContexts[5][0].iteration,6);
  assert.equal(rounds[3].repeatContexts[2][0].step,3);
  assert.deepEqual(rounds[5].roundRepeat,{start:5,end:6,iteration:2,total:2});
});
test('nested and prefixed repeat groups preserve their context hierarchy',()=>{
  const trace=[];const ops=readSequence('3([sc, sc] x2, inc)',null,0,trace);
  assert.equal(ops.length,15);assert.equal(trace.length,ops.length);
  assert.equal(trace[6][0].iteration,2);assert.equal(trace[6][0].length,5);
  assert.equal(trace[6][1].iteration,1);assert.equal(trace[6][1].step,2);
});
test('queue crosses rounds and keeps INC as one action',()=>{
  const {rounds}=parsePattern(source),timeline=buildActionTimeline(rounds);
  const position=queuePosition(rounds,1,5),window=queueWindow(timeline,position);
  assert.deepEqual(window.filter(item=>item.slot>=0).map(item=>item.label),['INC','SC','INC','SC']);
  assert.equal(window.find(item=>item.slot===1).roundNumber,3);
  assert.equal(queuePosition(rounds,2,0),12);
  assert.equal(timeline[7].made,2);
});
test('end of pattern keeps four slots without inventing extra stitches',()=>{
  const timeline=buildActionTimeline(parsePattern(source).rounds);
  const last=queueWindow(timeline,timeline.length-1).filter(item=>item.slot>=0);
  assert.deepEqual(last.map(i=>i.label),['SC','DONE','—','—']);
  const done=queueWindow(timeline,timeline.length).filter(item=>item.slot>=0);
  assert.equal(done[0].label,'DONE');assert.ok(done.every(i=>i.end));
});
