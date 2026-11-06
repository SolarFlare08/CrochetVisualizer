import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parsePattern,advanceProgress} from '../src/pattern.js';
import {solveFabric} from '../src/fabricSolver.js';
import {workActions,migrateProgress} from '../src/workActions.js';
const pattern='R1: 6 sc in MR (6)\nR2: inc x6 (12)\nR3: [sc, inc] x6 (18)';
test('standard SC disc stays planar and circular',()=>{
  const solution=solveFabric(parsePattern(pattern).rounds);
  const ys=solution.nodes.map(n=>n.y);
  assert.ok(Math.max(...ys)-Math.min(...ys)<1e-5);
  solution.rings.forEach(ring=>{
    const radii=ring.map(id=>Math.hypot(solution.nodes[id].x,solution.nodes[id].z));
    assert.ok(Math.max(...radii)-Math.min(...radii)<1e-5);
  });
});
test('equal-count courses still build height',()=>{
  const solution=solveFabric(parsePattern(pattern+'\nR4-6: sc around (18)').rounds);
  const average=ring=>ring.reduce((n,id)=>n+solution.nodes[id].y,0)/ring.length;
  assert.ok(average(solution.rings.at(-1))-average(solution.rings[2])>.5);
});
test('decreases gain height while contracting instead of forming horizontal shelves',()=>{
  const parsed=parsePattern(pattern+'\nR4-6: sc around (18)\nR7: [sc, dec] x6 (12)\nR8: sc around (12)\nR9: dec x6 (6)');
  assert.deepEqual(parsed.issues,[]);
  const solution=solveFabric(parsed.rounds);
  const mean=(ri,fn)=>solution.rings[ri].reduce((sum,id)=>sum+fn(solution.nodes[id]),0)/solution.rings[ri].length;
  for(const ri of [6,8]){
    assert.ok(mean(ri,n=>n.y)-mean(ri-1,n=>n.y)>.2);
    assert.ok(mean(ri,n=>Math.hypot(n.x,n.z))<mean(ri-1,n=>Math.hypot(n.x,n.z)));
  }
  assert.ok(solution.nodes.every(n=>Number.isFinite(n.x+n.y+n.z)));
});
test('increases are one work action with two fabric outputs',()=>{
  const rounds=parsePattern(pattern).rounds;
  assert.deepEqual(rounds.map(r=>workActions(r).length),[6,6,12]);
  assert.deepEqual(rounds.map(r=>r.count),[6,12,18]);
  const actions=rounds.map(r=>({...r,count:workActions(r).length}));
  assert.deepEqual(advanceProgress({round:1,stitch:5},actions),{round:2,stitch:0});
  assert.deepEqual(workActions(rounds[1])[1],{label:'INC',output:2,made:2});
  assert.deepEqual(migrateProgress({round:1,stitch:4},rounds),{round:1,stitch:2});
});
