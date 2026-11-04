import React, { useEffect, useState } from 'react';
import { Plus, ArrowRight, Copy, Archive, RotateCcw, Leaf } from 'lucide-react';
import { parsePattern, SAMPLE } from './pattern';

export const STARTERS = [
  { name: 'Chain strip', description: 'Ten chains and a turned double crochet row', text: 'P1:\nR0: 10ch, turn\nR1: 10dc, turn' },
  { name: 'Increase curve', description: 'Five chains widen into ten stitches', text: 'R0: 5ch, turn\nR1: 5inc, turn' },
  { name: 'Decrease curve', description: 'Ten chains narrow into five stitches', text: 'R0: 10ch, turn\nR1: 5dec, turn' },
  { name: 'Magic ring', description: 'Start from the center', text: 'R1: 6 sc in MR (6)' },
  { name: 'Sunshine swatch', description: 'Pattern from your screenshot', text: 'R1: col[#FE6F42], 15dc\nR2: 5(10ch, r[2], 2sc, 4hdc, 3dc, 2sk, sl)\nR3: col[#FFAD37], dc, 4(2dc, 4hdc, 5sc, 4hdc, 2dc, dc3tog), 2dc, 4hdc, 5sc, 4hdc, 2dc, dc2tog' },
  { name: 'Little basket', description: 'A base and straight sides', text: 'R1: 6 sc in MR (6)\nR2: inc x6 (12)\nR3: [sc, inc] x6 (18)\nR4: [2 sc, inc] x6 (24)\nR5-12: sc around (24)' },
  { name: 'Soft sphere', description: 'Practice shaping in rounds', text: 'R1: 6 sc in MR (6)\nR2: inc x6 (12)\nR3: [sc, inc] x6 (18)\nR4: [2 sc, inc] x6 (24)\nR5-8: sc around (24)\nR9: [2 sc, dec] x6 (18)\nR10: [sc, dec] x6 (12)\nR11: dec x6 (6)' },
  { name: 'Little pear', description: 'A ready-to-try project', text: SAMPLE },
];
const LIBRARY = 'loop-studio-library-v1';
export function ProjectLibrary({ Workspace, defaults, legacy }) {
  const [projects, setProjects] = useState(() => { try { const saved = JSON.parse(localStorage.getItem(LIBRARY)); if (Array.isArray(saved)) return saved; } catch {} return [{...legacy(), id: crypto.randomUUID(), updated: Date.now()}]; });
  const [active, setActive] = useState(() => location.hash.startsWith('#workspace/') ? location.hash.slice(11) : null);
  const [tab, setTab] = useState('mine'), [starter, setStarter] = useState(0), [name, setName] = useState(''), [description, setDescription] = useState(''), [error, setError] = useState('');
  useEffect(() => { try { localStorage.setItem(LIBRARY, JSON.stringify(projects)); setError(''); } catch { setError('Device storage is full or unavailable. Export your project to keep a backup.'); } }, [projects]);
  useEffect(() => { const update = () => setActive(location.hash.startsWith('#workspace/') ? location.hash.slice(11) : null); addEventListener('hashchange',update); return () => removeEventListener('hashchange',update); }, []);
  const open = id => { location.hash = `workspace/${id}`; setActive(id); };
  const update = value => setProjects(list => list.map(p => p.id === value.id ? {...value,updated:Date.now()} : p));
  const create = (template = STARTERS[starter], title = name.trim() || template.name) => {
    const p = {...defaults,id:crypto.randomUUID(),title,description,text:template.text,progress:{round:0,stitch:0},updated:Date.now()};
    setProjects(list => [...list,p]); open(p.id);
  };
  const current = projects.find(p => p.id === active);
  if (current) return <><Workspace key={current.id} initialProject={current} onProjectChange={update} onBack={() => { location.hash='projects'; setActive(null); }}/>{error && <div role="alert" className="library-error">{error}</div>}</>;
  const visible = projects.filter(p => tab === 'archive' ? p.archived : !p.archived);
  return <div className="projects-page"><header><a className="brand" href="#projects"><span className="brand-icon"><Leaf size={22}/></span>loop<span className="brand-light">studio</span></a><span className="device-label">Your projects · saved on this device</span></header><main>
    <div className="library-heading"><div><span className="eyebrow">MAKE SOMETHING YOURS</span><h1>What are we crocheting today?</h1><p>Pick up where you left off, or follow a new thread.</p></div><div className="library-tabs">{[['mine','My projects'],['new','Create new'],['archive','Archived']].map(([id,label]) => <button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}>{label}</button>)}</div></div>
    {error && <p role="alert" className="error">{error}</p>}
    {tab === 'new' ? <section className="new-project"><div><h2>How would you like to start?</h2><div className="starter-grid">{STARTERS.map((t,i)=><button key={t.name} aria-pressed={starter===i} className={starter===i?'selected':''} onClick={()=>setStarter(i)}><ProjectThumbnail text={t.text} color="#b7a6cc"/><strong>{t.name}</strong><span>{t.description}</span></button>)}</div></div><form onSubmit={e=>{e.preventDefault();create();}}><h2>About your project</h2><label>Project name<input required maxLength={100} placeholder="Give your project a name…" value={name} onChange={e=>setName(e.target.value)}/></label><label>Notes<textarea placeholder="Yarn ideas, who it’s for, a little inspiration…" value={description} onChange={e=>setDescription(e.target.value)}/></label><p>US terminology · Continuous rounds<br/>MR, sc, inc, dec and repeated rounds</p><button className="library-primary" type="submit">Create project <ArrowRight size={17}/></button></form></section> : <div className="project-grid">{visible.map(p=>{const parsed=parsePattern(p.text);return <article className="project-card" key={p.id}><button className="project-open" onClick={()=>open(p.id)}><ProjectThumbnail text={p.text} color={p.color}/><div><h2>{p.title || 'Untitled project'}</h2><p>{parsed.rounds.length} rounds · {parsed.stitches} stitches</p><span>Resume round {(p.progress?.round || 0)+1} · {p.progress?.stitch || 0} stitches worked</span></div></button><div className="card-actions"><button onClick={()=>{const copy={...p,id:crypto.randomUUID(),title:`${p.title} copy`,archived:false,updated:Date.now()};setProjects(list=>[...list,copy]);open(copy.id);}}><Copy size={14}/> Clone</button><button onClick={()=>setProjects(list=>list.map(item=>item.id===p.id?{...item,archived:!item.archived}:item))}>{p.archived?<RotateCcw size={14}/>:<Archive size={14}/>} {p.archived?'Restore':'Archive'}</button></div></article>;})}{tab==='mine' && <button className="new-project-card" onClick={()=>setTab('new')}><Plus size={28}/><strong>Start a new project</strong><span>From a few stitches, something lovely.</span></button>}{!visible.length && tab==='archive' && <p>No archived projects.</p>}</div>}
    <section className="inspiration"><h2>A few ideas to get you started</h2><p>Editable starter patterns, ready for your own colors and details.</p><div>{STARTERS.slice(1).map(t=><button key={t.name} onClick={()=>create(t,t.name)}><ProjectThumbnail text={t.text} color={t.name==='Soft sphere'?'#d9b47e':'#9cafb1'}/><strong>{t.name}</strong><span>Make a copy <ArrowRight size={14}/></span></button>)}</div></section>
  </main></div>;
}
function ProjectThumbnail({text,color}) {
  const rounds=parsePattern(text).rounds, max=Math.max(6,...rounds.map(r=>r.previewCount));
  const rows=rounds.map((r,i)=>({y:130-i*85/Math.max(1,rounds.length-1),rx:r.previewCount/max*53}));
  return <svg viewBox="0 0 200 170" role="img" aria-label="Pattern shape thumbnail"><ellipse cx="100" cy="145" rx="50" ry="7" fill="#34483a10"/>{rows.map((r,i)=><g key={i} fill={color} stroke="#ffffff88" strokeWidth="1.2"><ellipse cx="100" cy={r.y} rx={r.rx} ry="12"/>{Array.from({length:Math.min(18,rounds[i].previewCount)},(_,n)=>{const a=Math.PI*n/Math.max(1,Math.min(18,rounds[i].previewCount)-1);return <path key={n} d={`M ${100-Math.cos(a)*r.rx-3} ${r.y+Math.sin(a)*10-3} q 3 8 6 0`} fill="none"/>;})}</g>)}</svg>;
}
