import {test} from 'node:test';
import assert from 'node:assert/strict';
import {estimateRemaining,formatRemaining} from '../src/paceEstimate.js';
test('estimate waits for measured work and counts remaining actions',()=>{
  assert.equal(estimateRemaining([],10),null);assert.equal(estimateRemaining([10000,10000],10),null);
  assert.equal(estimateRemaining([10000,10000,10000],6),60000);
  assert.equal(estimateRemaining([],0),0);
});
test('idle gaps, invalid samples and outliers do not dominate pace',()=>{
  assert.equal(estimateRemaining([10000,10000,10000,300000,NaN,-10],6),60000);
  assert.equal(estimateRemaining([...Array(10).fill(10000),120000],6),60000);
});
test('remaining time formatting clearly indicates an estimate',()=>{
  assert.equal(formatRemaining(0),'Finished');assert.equal(formatRemaining(10000),'~1 min');assert.equal(formatRemaining(3660000),'~1h 1m');
});
