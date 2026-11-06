import {test} from 'node:test';
import assert from 'node:assert/strict';
import {stitchDescription} from '../src/stitchDescription.js';

test('output counter labels preserve both halves of increases',()=>{
  const round={ops:['sc','inc','dec','sc2inc']};
  assert.deepEqual(Array.from({length:6},(_,n)=>stitchDescription(round,n)),['SC','INC · 1 of 2','INC · 2 of 2','DEC','INC · 1 of 2','INC · 2 of 2']);
  assert.equal(stitchDescription(round,6),'');
  assert.equal(stitchDescription(undefined,0),'');
});
