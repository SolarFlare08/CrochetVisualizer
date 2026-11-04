import { readSequence as sequence, operation } from './language.js';
export const SAMPLE = `# Little pear · US terminology
R1: 6 sc in MR (6)
R2: inc x6 (12)
R3: [sc, inc] x6 (18)
R4: [2 sc, inc] x6 (24)
R5: [3 sc, inc] x6 (30)
R6: [4 sc, inc] x6 (36)
R7-10: sc around (36)
R11: [4 sc, dec] x6 (30)
R12: sc around (30)
R13: [3 sc, dec] x6 (24)
R14: sc around (24)
R15: [2 sc, dec] x6 (18)
R16-17: sc around (18)
R18: [sc, dec] x6 (12)
R19: dec x6 (6)`;

export function parsePattern(text) {
  const rounds = [], issues = []; let previous = null, roundColor = null;
  for (const [lineIndex, raw] of text.split('\n').entries()) {
    let line = raw.split('//')[0].trim();
    line = line.replace(/col\[(#[0-9a-f]{6})\]\s*,?/ig,(_,hex)=>{roundColor=hex;return '';});
    line = line.split('#')[0].trim(); if (!line) continue;
    if (/^P1:/i.test(line)) continue;
    if (/^R0:\s*(mr|magic ring)\s*$/i.test(line) && !rounds.length) continue;
    const header = line.match(/^(?:r(?:ound)?\s*)?(\d+)(?:\s*[-–]\s*r?\s*(\d+))?\s*[:.)]\s*(.*)$/i);
    if (!header) { issues.push({ message: `Line ${lineIndex + 1}: expected R1: instructions.`, severity: 'error' }); continue; }
    const start = Number(header[1]), end = Number(header[2] || start);
    if (end < start || end > 200 || start < 0) { issues.push({ message: `Line ${lineIndex + 1}: round numbers must be ascending, between 1 and 200.`, severity: 'error' }); continue; }
    for (let number = start; number <= end; number++) {
      if (rounds.length >= 200) break;
      const instruction = header[3], messages = [];
      const expected = instruction.match(/\((\d+)\)\s*$/); const declared = expected ? Number(expected[1]) : null;
      let body = instruction.replace(/\(\d+\)\s*$/, '').trim(), ops = [], count = null, consumed = null;
      const turn = /(?:^|[,\s])turn\s*$/i.test(body);
      body=body.replace(/[,\s]*turn\s*$/i,'').trim();
      const chainFoundation = !rounds.length && /^(?:\d+\s*)?ch$/i.test(body);
      const rowMode = turn || chainFoundation || rounds[0]?.rowMode;
      const magic = /\bmr\b|magic\s+ring/i.test(body) || (!rounds.length && /^(?:\d+\s*)?(?:sc|hdc|dc|tr|dtr)(?:\s*[x×]\s*\d+)?\s*$/i.test(body));
      if (number !== (rounds.length ? rounds.at(-1).number + 1 : start === 0 ? 0 : 1)) messages.push(`Expected R${rounds.length + 1}; round numbers must be consecutive.`);
      if (magic && rounds.length) messages.push('Magic ring is only supported in the first round.');
      body = body.replace(/\b(?:in(?:to)?\s+(?:a\s+)?)?(?:mr|magic\s+ring)\b\s*,?/ig, '').trim();
      try {
        ops = sequence(body, previous);
        count = ops.reduce((n, op) => n + operation(op).made, 0);
        consumed = magic ? 0 : ops.reduce((n, op) => n + operation(op).used, 0);
        let chainLength=0, chainRoots=0, rootUsage=0;
        for (const op of ops) {
          const reverse=op.match(/^r\[(\d+)\]$/);
          if(op==='ch') { chainLength++; continue; }
          if(reverse) {
            const offset=Number(reverse[1]);
            if(offset<1 || offset>chainLength) throw Error('Chain reversal must point to an existing chain.');
            chainRoots=chainLength-offset+1; chainLength=0; continue;
          }
          if(op==='bk') { rootUsage--; continue; }
          const used=operation(op).used, fromChain=Math.min(chainRoots,used);
          chainRoots-=fromChain; rootUsage+=used-fromChain;
        }
        if(!magic) consumed=rootUsage;
        if (!magic && rounds.length && previous === null) messages.push('The previous round has an unknown total; its stitch consumption cannot be validated.');
        if (!magic && previous !== null && consumed !== previous) messages.push(`Uses ${consumed} stitches, but the previous round has ${previous}.`);
        if (!magic && !chainFoundation && !rounds.length) messages.push('Start with stitches in MR to define the foundation.');
        if (magic && ops.some(op => !['sc','hdc','dc','tr','dtr'].includes(operation(op).type))) messages.push('Use stitches to establish the foundation round.');
        if (declared !== null && count !== declared) messages.push(`Calculated ${count} stitches; the written total is ${declared}.`);
      } catch (e) { messages.push(e.message); }
      if (count > 1000) messages.push('A round may produce at most 1,000 stitches.');
      const approximate = ops.some(op => !['sc','inc','dec'].includes(op));
      const valid = messages.length === 0 && count !== null;
      rounds.push({ number, instruction, color:roundColor, count, consumed, declared, ops, rowMode, turn, approximate, valid, messages, previewCount: Math.max(1, Math.min(240, count ?? declared ?? previous ?? 6)) });
      for (const message of messages) issues.push({ round: number, severity: 'error', message: `R${number}: ${message}` });
      previous = count;
    }
  }
  if (!rounds.length) issues.push({ severity: 'error', message: 'Add a round to begin, for example R1: 6 sc in MR (6).' });
  return { rounds, issues, supported: issues.length === 0, approximate: rounds.some(r => r.approximate), stitches: rounds.reduce((n, r) => n + (r.count || 0), 0) };
}

export function advanceProgress(progress, rounds, direction = 1) {
  if (!rounds.length) return { round: 0, stitch: 0 };
  const r = Math.min(progress.round, rounds.length - 1), total = rounds[r].count;
  if (!rounds[r].valid || !total) return progress;
  if (direction < 0) {
    if (progress.stitch > 0) return { round: r, stitch: progress.stitch - 1 };
    return r ? { round: r - 1, stitch: Math.max(0, (rounds[r - 1].count || 1) - 1) } : { round: 0, stitch: 0 };
  }
  if (progress.stitch + 1 >= total && r < rounds.length - 1) return { round: r + 1, stitch: 0 };
  return { round: r, stitch: Math.min(total, progress.stitch + 1) };
}
