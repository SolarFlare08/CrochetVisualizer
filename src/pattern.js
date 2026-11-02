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

function sequence(source, previous, depth = 0) {
  if (depth > 5) throw Error('Repeat groups are nested too deeply.');
  const s = source.toLowerCase().trim();
  if (/^(?:sc\s+around|sc\s+in\s+each\s+(?:st|stitch))$/.test(s)) {
    if (!previous) throw Error('“sc around” needs a known previous round.');
    return Array(previous).fill('sc');
  }
  let i = 0, result = [];
  while (i < s.length) {
    if (/[\s,;]/.test(s[i])) { i++; continue; }
    if (s[i] === '[' || s[i] === '(') {
      const open = s[i], close = open === '[' ? ']' : ')'; let end = i + 1, level = 1;
      for (; end < s.length && level; end++) { if (s[end] === open) level++; if (s[end] === close) level--; }
      if (level) throw Error('A repeat group is missing its closing bracket.');
      const inner = sequence(s.slice(i + 1, end - 1), previous, depth + 1);
      const repeat = s.slice(end).match(/^\s*(?:x|×|repeat)\s*(\d+)(?:\s*times)?/);
      if (!repeat) throw Error('Add a repeat count after the group, for example [sc, inc] x6.');
      const count = Number(repeat[1]);
      if (count > 500 || result.length + inner.length * count > 2000) throw Error('Round exceeds the 2,000 operation limit.');
      for (let n = 0; n < count; n++) result.push(...inner);
      i = end + repeat[0].length; continue;
    }
    const match = s.slice(i).match(/^(?:(\d+)\s*)?(sc|inc|dec)\b(?:\s*(?:x|×)\s*(\d+))?/);
    if (!match) throw Error(`Unsupported notation near “${s.slice(i, i + 22)}”. Use sc, inc, dec, or repeat groups.`);
    const count = Number(match[1] || match[3] || 1);
    if (count > 2000 || result.length + count > 2000) throw Error('Round exceeds the 2,000 operation limit.');
    result.push(...Array(count).fill(match[2])); i += match[0].length;
  }
  if (!result.length) throw Error('Enter stitch instructions for this round.');
  return result;
}

export function parsePattern(text) {
  const rounds = [], issues = []; let previous = null;
  for (const [lineIndex, raw] of text.split('\n').entries()) {
    const line = raw.split('#')[0].trim(); if (!line) continue;
    const header = line.match(/^(?:r(?:ound)?\s*)?(\d+)(?:\s*[-–]\s*(\d+))?\s*[:.)]\s*(.*)$/i);
    if (!header) { issues.push({ message: `Line ${lineIndex + 1}: expected R1: instructions.`, severity: 'error' }); continue; }
    const start = Number(header[1]), end = Number(header[2] || start);
    if (end < start || end > 200 || start < 1) { issues.push({ message: `Line ${lineIndex + 1}: round numbers must be ascending, between 1 and 200.`, severity: 'error' }); continue; }
    for (let number = start; number <= end; number++) {
      if (rounds.length >= 200) break;
      const instruction = header[3], messages = [];
      const expected = instruction.match(/\((\d+)\)\s*$/); const declared = expected ? Number(expected[1]) : null;
      let body = instruction.replace(/\(\d+\)\s*$/, '').trim(), ops = [], count = null, consumed = null;
      const magic = /\bmr\b|magic\s+ring/i.test(body);
      if (number !== rounds.length + 1) messages.push(`Expected R${rounds.length + 1}; round numbers must be consecutive.`);
      if (magic && rounds.length) messages.push('Magic ring is only supported in the first round.');
      body = body.replace(/\b(?:in(?:to)?\s+(?:a\s+)?)?(?:mr|magic\s+ring)\b\s*,?/ig, '').trim();
      try {
        ops = sequence(body, previous);
        count = ops.reduce((n, op) => n + (op === 'inc' ? 2 : 1), 0);
        consumed = magic ? 0 : ops.reduce((n, op) => n + (op === 'dec' ? 2 : 1), 0);
        if (!magic && rounds.length && previous === null) messages.push('The previous round has an unknown total; its stitch consumption cannot be validated.');
        if (!magic && previous !== null && consumed !== previous) messages.push(`Uses ${consumed} stitches, but the previous round has ${previous}.`);
        if (!magic && !rounds.length) messages.push('Start with sc stitches in MR to define the foundation.');
        if (magic && ops.some(op => op !== 'sc')) messages.push('Use single crochet stitches to establish the magic ring.');
        if (declared !== null && count !== declared) messages.push(`Calculated ${count} stitches; the written total is ${declared}.`);
      } catch (e) { messages.push(e.message); }
      const valid = messages.length === 0 && count !== null;
      rounds.push({ number, instruction, count, consumed, declared, ops, valid, messages, previewCount: Math.max(1, Math.min(240, count ?? declared ?? previous ?? 6)) });
      for (const message of messages) issues.push({ round: number, severity: 'error', message: `R${number}: ${message}` });
      previous = count;
    }
  }
  if (!rounds.length) issues.push({ severity: 'error', message: 'Add a round to begin, for example R1: 6 sc in MR (6).' });
  return { rounds, issues, supported: issues.length === 0, stitches: rounds.reduce((n, r) => n + (r.count || 0), 0) };
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
