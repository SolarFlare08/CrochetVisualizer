import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE, parsePattern, advanceProgress } from '../src/pattern.js';

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
  const p = parsePattern('R1: 6 sc in MR\nR2: 12 dc (12)');
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
  assert.deepEqual(advanceProgress(p, parsePattern('R1: dc').rounds), p);
});
test('unknown preceding totals and unsupported star repeats are not verified', () => {
  const p = parsePattern('R1: 6 dc\nR2: 6 sc');
  assert.equal(p.rounds[1].valid, false);
  assert.match(p.rounds[1].messages[0], /previous round has an unknown total/);
  assert.equal(parsePattern('R1: 6 sc in MR\nR2: *sc, inc* x3').supported, false);
  assert.equal(parsePattern('R1: 6 sc in MR').rounds[0].consumed, 0);
});
