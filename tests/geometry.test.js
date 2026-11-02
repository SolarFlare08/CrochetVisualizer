import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStitchGeometry, stitchConnections } from '../src/stitchGeometry.js';

test('increases share one input and decreases join two inputs', () => {
  assert.deepEqual(stitchConnections({ops:['sc','inc','dec']}), [
    {output:0,inputs:[0],op:'sc'},
    {output:1,inputs:[1],op:'inc'},
    {output:2,inputs:[1],op:'inc'},
    {output:3,inputs:[2,3],op:'dec'},
  ]);
});
test('yarn stitch has finite geometry at supported gauge extremes', () => {
  for (const [w,h] of [[.125,2.5],[2.5,.125],[.5,.416]]) {
    const g = createStitchGeometry(w,h);
    assert.ok(g.attributes.position.count > 100);
    assert.ok([...g.attributes.position.array].every(Number.isFinite));
    assert.ok([...g.attributes.normal.array].every(Number.isFinite));
    g.dispose();
  }
});
