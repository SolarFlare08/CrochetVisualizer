import { operation } from './language.js';

// Position based relaxation of yarn spacing and parent/child stitch distances.
// No stuffing pressure or gravity: this estimates the fabric's resting construction.
export function solveFabric(rounds, width=.5, rise=.42) {
  if(rounds.reduce((n,r)=>n+(r.count||0),0)>4000) return {error:'This solver supports up to 4,000 stitches. Split this pattern into smaller pieces.'};
  const nodes=[], rings=[], edges=[], flatRounds=[];
  let previousRadius=0, y=0;
  rounds.forEach((round,ri)=>{
    const count=round.count||0, radius=count*width/(2*Math.PI);
    const dr=radius-previousRadius;
    // Six evenly distributed increases add one radial stitch-width per course
    // in a calibrated SC disk. Preserve that planar metric rather than forcing
    // every diagonal root link to the shorter vertical row height.
    const flat=ri===0?count===6:flatRounds[ri-1]&&count===(rounds[ri-1].count+6);
    flatRounds.push(flat);
    // A decrease also builds a new course vertically. Subtracting the whole
    // radial contraction from row height collapsed it into a horizontal shelf.
    const decreasing=ri>0&&count<rounds[ri-1].count;
    y+=ri&&!flat?(decreasing?rise:Math.sqrt(Math.max(rise*rise-dr*dr,rise*rise*.015))):0;
    const ring=[];
    for(let n=0;n<count;n++) {
      const a=n/count*Math.PI*2;
      ring.push(nodes.length);nodes.push({x:Math.sin(a)*radius,y,z:Math.cos(a)*radius,round:ri,stitch:n});
    }
    rings.push(ring);
    ring.forEach((id,n)=>edges.push({a:id,b:ring[(n+1)%count],rest:width,kind:'course',owner:id}));
    if(ri) {
      const roots=rings[ri-1];let input=0,output=0;
      round.ops.forEach(op=>{
        const {used,made}=operation(op);
        for(let k=0;k<made;k++) {
          const id=ring[output++];
          for(let j=0;j<used;j++) if(id!==undefined&&roots[input+j]!==undefined)edges.push({a:roots[input+j],b:id,rest:Math.hypot(rise,width*(made>1?.28:used>1?.35:0)),kind:'wale',owner:id});
        }
        input+=used;
      });
    }
    previousRadius=radius;
  });
  const initial=nodes.map(n=>({...n}));
  for(const edge of edges)if(flatRounds[nodes[edge.owner].round]){
    const a=initial[edge.a],b=initial[edge.b];
    edge.rest=Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
  }
  for(let iteration=0;iteration<240;iteration++) {
    for(const edge of edges) {
      const a=nodes[edge.a],b=nodes[edge.b],dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;
      const distance=Math.hypot(dx,dy,dz)||1e-6, correction=(distance-edge.rest)/distance*.32;
      a.x+=dx*correction;a.y+=dy*correction;a.z+=dz*correction;
      b.x-=dx*correction;b.y-=dy*correction;b.z-=dz*correction;
    }
    // Weak regularization avoids arbitrary collapse of an underconstrained surface.
    nodes.forEach((n,i)=>{n.x+=(initial[i].x-n.x)*.003;n.y+=(initial[i].y-n.y)*.003;n.z+=(initial[i].z-n.z)*.003;});
    // Keep each course's mean height near its construction height while
    // allowing individual stitch positions to relax around that course.
    rings.forEach(ring=>{
      if(!ring.length)return;
      const mean=ring.reduce((sum,id)=>sum+nodes[id].y,0)/ring.length;
      const target=initial[ring[0]].y,shift=(target-mean)*.2;
      ring.forEach(id=>{nodes[id].y+=shift;});
    });
  }
  const strain=edges.length?edges.reduce((sum,e)=>{const a=nodes[e.a],b=nodes[e.b];return sum+Math.abs(Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z)-e.rest)/e.rest;},0)/edges.length:0;
  return {nodes,edges,rings,strain,iterations:240};
}

export function formatPattern(source) {
  const notes=[];
  const text=source.split('\n').map(line=>line.trim()).filter(Boolean).map(line=>{
    if(/^(?:#|\/\/)/.test(line))return line;
    let s=line.replace(/\bmagic ring\b/ig,'MR').replace(/\bsingle crochet(?:s)?\b/ig,'sc').replace(/\bincrease(?:s)?\b/ig,'inc').replace(/\bdecrease(?:s)?\b/ig,'dec').replace(/\bsc2tog\b/ig,'dec').replace(/\bsc2inc\b/ig,'inc');
    s=s.replace(/^(?:round|rnd|r)\s*(\d+)(?:\s*[-–]\s*(?:round|rnd|r)?\s*(\d+))?\s*[:.)-]?\s*/i,(_,a,b)=>`R${a}${b?'-'+b:''}: `);
    s=s.replace(/\b(?:repeat\s+)?(\d+)\s+times\b/ig,'x$1').replace(/\bsc\s+(?:in\s+)?(?:each|every)\s+(?:stitch|st)\s*(?:around)?/ig,'sc around').replace(/\b(?:sts|stitches)\s*\)?\s*$/i,')');
    if(!/^R\d/i.test(s)){notes.push(`Review this line: ${line}`);return '# Review: '+line;}
    return s;
  }).join('\n');
  return {text,notes};
}
