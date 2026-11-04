import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE, parsePattern, advanceProgress } from '../src/pattern.js';
import { readSequence, operation } from '../src/language.js';

test('US and XVA operations agree on roots and outputs', () => {
  for (const [us,xva,used,made] of [['dc','F',1,1],['hdc2inc','TV',1,2],['dc3tog','FM',3,1],['tr3inc','EW',1,3],['sk','K',1,0],['ch','CH',0,1],['sl','SS',1,1]]) {
    for(const token of [us,xva]) { const spec=operation(readSequence(token)[0]); assert.equal(spec.used,used);assert.equal(spec.made,made); }
  }
});
test('compound and textured stitches retain their correct counts and limits', () => {
  assert.equal(operation(readSequence('[sc, hdc, dc]+')[0]).made,3);
  assert.equal(operation(readSequence('tog[sc, hdc, dc]')[0]).used,3);
  assert.equal(operation(readSequence('bobble[5dc]')[0]).made,1);
  assert.throws(()=>readSequence('puff[9hdc]'));
});
test('starfish reverses into chains without creating phantom stitches', () => {
  const p=parsePattern('R1: col[#FE6F42], 15dc\nR2: 5(10ch, r[2], 2sc, 4hdc, 3dc, 2sk, sl)\nR3: col[#FFAD37], dc, 4(2dc, 4hdc, 5sc, 4hdc, 2dc, dc3tog), 2dc, 4hdc, 5sc, 4hdc, 2dc, dc2tog');
  assert.deepEqual(p.issues,[]);
  assert.deepEqual(p.rounds.map(r=>r.count),[15,100,91]);
  assert.deepEqual(p.rounds.map(r=>r.consumed),[0,15,100]);
  assert.equal(p.approximate,true);
});

test('sample produces accurate counts across increases, decreases and ranges', () => {
  const p = parsePattern(SAMPLE);
  assert.deepEqual(p.issues, []);
  assert.deepEqual(p.rounds.map(r => r.count), [6,12,18,24,30,36,36,36,36,36,30,30,24,24,18,18,18,12,6]);
});
test('checks both input consumption and written output count', () => {
  const p = parsePattern('R1: 6 sc in MR (6)\nR2: 4 inc (9)');
  assert.equal(p.rounds[1].count, 8);
  assert.equal(p.issues.length, 2);
  assert.match(p.issues[0].message, /Uses 4 stitches/);
  assert.match(p.issues[1].message, /written total is 9/);
});
test('unsupported notation is approximate and never verified', () => {
  const p = parsePattern('R1: 6 sc in MR\nR2: 12 unknown (12)');
  assert.equal(p.supported, false);
  assert.equal(p.rounds[1].count, null);
  assert.equal(p.rounds[1].previewCount, 12);
});
test('accepts grouped repeats and case insensitive terms', () => {
  assert.equal(parsePattern('Round 1: SC x6 in magic ring\nR2: (INC) x6\nR3: (sc, inc) x6').supported, true);
});
test('rejects missing, duplicate, skipped rounds and oversized repeats', () => {
  for (const text of ['', 'R2: 6 sc in MR', 'R1: 6 sc in MR\nR1: 6 sc', 'R1: [sc] x999999']) assert.equal(parsePattern(text).supported, false);
});
test('counter crosses rounds, goes back and stops at project end', () => {
  const { rounds } = parsePattern('R1: 6 sc in MR\nR2: 6 inc');
  assert.deepEqual(advanceProgress({ round:0, stitch:5 }, rounds), { round:1, stitch:0 });
  assert.deepEqual(advanceProgress({ round:1, stitch:0 }, rounds, -1), { round:0, stitch:5 });
  assert.deepEqual(advanceProgress({ round:1, stitch:12 }, rounds), { round:1, stitch:12 });
  assert.deepEqual(advanceProgress({ round:0, stitch:0 }, rounds, -1), { round:0, stitch:0 });
});
test('invalid round does not advance the counter', () => {
  const p = { round: 0, stitch: 0 };
  assert.deepEqual(advanceProgress(p, parsePattern('R1: unknown').rounds), p);
});
test('Knotly single-crochet aliases, prefix repeats, colors and round ranges', () => {
  const p=parsePattern('R0: mr\nR1: col[#ffaa00], 6sc\nR2: 6sc2inc\nR3: 6(sc, sc2inc)\nR4-R5: 18sc\nR6: 6(sc, sc2tog)');
  assert.deepEqual(p.issues,[]);
  assert.deepEqual(p.rounds.map(r=>r.count),[6,12,18,18,18,12]);
  assert.ok(p.rounds.every(r=>r.color==='#ffaa00'));
});
test('unknown preceding totals and unsupported star repeats are not verified', () => {
  const p = parsePattern('R1: 6 unknown\nR2: 6 sc');
  assert.equal(p.rounds[1].valid, false);
  assert.match(p.rounds[1].messages[0], /previous round has an unknown total/);
  assert.equal(parsePattern('R1: 6 sc in MR\nR2: *sc, inc* x3').supported, false);
  assert.equal(parsePattern('R1: 6 sc in MR').rounds[0].consumed, 0);
});
