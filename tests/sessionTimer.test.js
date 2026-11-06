import {test} from 'node:test';
import assert from 'node:assert/strict';
import {elapsedSession,changeSession,restoreSession,formatSession} from '../src/sessionTimer.js';
test('pause and resume accumulate only running time',()=>{
  let timer=changeSession(restoreSession(null),'resume',1000);
  assert.equal(elapsedSession(timer,6500),5500);
  timer=changeSession(timer,'pause',6500);
  assert.equal(elapsedSession(timer,20000),5500);
  timer=changeSession(timer,'resume',20000);
  assert.equal(elapsedSession(timer,22000),7500);
});
test('restoring a running timer preserves its timestamp and restarting preserves run/pause state',()=>{
  let timer=restoreSession(JSON.parse(JSON.stringify({elapsed:1500,startedAt:1000})));
  assert.equal(elapsedSession(timer,3000),3500);
  timer=changeSession(timer,'restart',3000);assert.deepEqual(timer,{elapsed:0,startedAt:3000});
  timer=changeSession(timer,'pause',4000);timer=changeSession(timer,'restart',5000);
  assert.deepEqual(timer,{elapsed:0,startedAt:null});
});
test('invalid storage is reset and hour formatting does not wrap at a day',()=>{
  for(const value of [null,{}, {elapsed:-1,startedAt:null},{elapsed:0,startedAt:'bad'}])assert.deepEqual(restoreSession(value),{elapsed:0,startedAt:null});
  assert.equal(formatSession(3661000),'01:01:01');assert.equal(formatSession(90000000),'25:00:00');
});
