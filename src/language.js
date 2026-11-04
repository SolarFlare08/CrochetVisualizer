const aliases = {x:'sc',t:'hdc',f:'dc',e:'tr',k:'sk',ss:'sl',v:'inc',xv:'inc',w:'sc3inc',xw:'sc3inc',a:'dec',xa:'dec',m:'sc3tog',xm:'sc3tog',tog:'dec',tv:'hdc2inc',fv:'dc2inc',ev:'tr2inc',tw:'hdc3inc',fw:'dc3inc',ew:'tr3inc',ta:'hdc2tog',fa:'dc2tog',ea:'tr2tog',tm:'hdc3tog',fm:'dc3tog',em:'tr3tog',q:'puff',g:'popcorn',bo:'bobble'};
export function operation(op) {
  if (op.startsWith('{')) return JSON.parse(op);
  op = aliases[op] || op;
  if (op === 'inc') op='sc2inc';
  if (op === 'dec') op='sc2tog';
  const match=op.match(/^(sc|hdc|dc|tr|dtr)(\d+)(inc|tog|dec)$/);
  const type=match?.[1] || op;
  return {type, used:match ? (match[3]==='inc'?1:+match[2]) : ['ch','tch','bk'].includes(type)||type.startsWith('r[')?0:1, made:match ? (match[3]==='inc'?+match[2]:1) : type==='sk'||type==='bk'||type.startsWith('r[')?0:1, height:({sl:.35,ch:.45,tch:.45,sc:1,hdc:1.5,dc:2,tr:3,dtr:4,puff:1.5,bobble:2,popcorn:2})[type] || 1};
}
export function readSequence(source, previous, depth=0) {
  if(depth>5) throw Error('Repeat groups are nested too deeply.');
  let s=source.toLowerCase().trim(), result=[], i=0;
  const around=s.match(/^(sc|hdc|dc|tr|dtr|x|t|f|e)\s+(?:around|in each (?:st|stitch))$/);
  if(around) { if(!previous) throw Error('Around needs a known previous round.'); return Array(previous).fill(aliases[around[1]]||around[1]); }
  function add(ops,n=1) { if(n<1||n>1000||result.length+ops.length*n>2000) throw Error('Repeat exceeds the operation limit.'); for(let j=0;j<n;j++)result.push(...ops); }
  while(i<s.length) {
    if(/[\s,;]/.test(s[i])) {i++;continue;}
    const prefix=s.slice(i).match(/^(\d+)\s*/); let n=prefix?+prefix[1]:1; if(prefix)i+=prefix[0].length;
    const special=s.slice(i).match(/^(inc|tog|dec|puff|bobble|bo|popcorn|q|g)(?=\[)/);
    let kind=null; if(special) {kind=aliases[special[1]]||special[1];i+=special[0].length;}
    if(s[i]==='['||s[i]==='(') {
      const start=i++, stack=[s[start]];
      while(i<s.length&&stack.length) { if('[('.includes(s[i]))stack.push(s[i]); else if('])'.includes(s[i])) {const open=stack.pop();if((open==='['?']':')')!==s[i])throw Error('Mismatched brackets.');} i++; }
      if(stack.length)throw Error('Missing closing bracket.');
      const inner=readSequence(s.slice(start+1,i-1),previous,depth+1);
      const suffix=s.slice(i).match(/^\s*(?:[x×]|repeat)\s*(\d+)(?:\s*times)?/);
      const sign=s[i];
      if(suffix&&!kind) {i+=suffix[0].length;add(inner,n*+suffix[1]);continue;}
      if(!kind&&s[start]==='(') {if(!prefix)throw Error('Add a repeat count after the group.');add(inner,n);continue;}
      if(sign==='+'||sign==='-')i++;
      const textured=['puff','bobble','popcorn'].includes(kind);
      if(inner.length>(textured?8:12)||inner.some(x=>operation(x).used!==1||operation(x).made!==1))throw Error('Invalid compound components or component limit exceeded.');
      const decrease=kind==='tog'||kind==='dec'||sign==='-';
      add([JSON.stringify({type:textured?kind:'compound',used:textured?1:decrease?inner.length:1,made:textured||decrease?1:inner.length,height:Math.max(...inner.map(x=>operation(x).height)),components:inner})],n);continue;
    }
    const token=s.slice(i).match(/^(?:r\[\d+\]|(?:sc|hdc|dc|tr|dtr)\d+(?:inc|tog|dec)|popcorn|bobble|puff|hdc|dtr|inc|dec|tog|tch|sc|dc|tr|ch|sk|sl|ss|bk|[xtfe][vwam]|bo|[xtfekvwamqg])(?![a-z])/);
    if(!token)throw Error(`Unsupported notation near “${s.slice(i,i+24)}”.`);
    let op=aliases[token[0]]||token[0]; i+=token[0].length;
    const repeat=s.slice(i).match(/^\s*[x×]\s*(\d+)/);if(repeat){n*=+repeat[1];i+=repeat[0].length;}
    const spec=operation(op);if(spec.used>12||spec.made>12)throw Error('Compound stitches allow at most 12 components.');
    add([op],n);
  }
  if(!result.length)throw Error('Enter stitch instructions for this round.');
  return result;
}
