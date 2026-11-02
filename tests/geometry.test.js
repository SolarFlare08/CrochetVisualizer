import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStitchGeometry, stitchConnections, createFabricProfile, conformStitchToFabric } from '../src/stitchGeometry.js';

test('increases share one input and decreases join two inputs', () => {
  assert.deepEqual(stitchConnections({ops:['sc','inc','dec']}), [
    {output:0,inputs:[0],op:'sc'},
    {output:1,inputs:[1],op:'inc'},
    {output:2,inputs:[1],op:'inc'},
    {output:3,inputs:[2,3],op:'dec'},
  ]);
});
test('yarn follows the fabric surface through increases and decreases', () => {
  const profile = createFabricProfile([6,12,24,12,6].map(previewCount => ({previewCount})), .5, .4);
  for (let i = 0; i < 5; i++) {
    const radius = [6,12,24,12,6][i] * .5 / (2*Math.PI), cy = (i+.7)*.4;
    const geometry = conformStitchToFabric(createStitchGeometry(.5,.4),radius,cy,profile.radiusAt);
    const p = geometry.attributes.position;
    for (let n = 0; n < p.count; n++) {
      const radial = Math.hypot(p.getX(n),p.getZ(n)+radius);
      assert.ok(Math.abs(radial-profile.radiusAt(cy+p.getY(n))) < .2, 'yarn must stay within its thickness of the shell');
    }
    geometry.dispose();
  }
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
