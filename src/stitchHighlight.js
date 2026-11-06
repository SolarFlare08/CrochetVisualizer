import * as THREE from 'three';
import {scArm} from './stitchSymbols.js';

export function highlightStitch(model,solution,ri,si,number,stitchType=''){
  const id=solution.rings[ri]?.[si],point=model.userData.rowLayout?.[ri]?.points[si];
  if(id===undefined||!point)return;
  const group=new THREE.Group();group.userData.activePointer=true;
  const material=new THREE.MeshBasicMaterial({color:'#ef662e',depthTest:false,depthWrite:false});
  const sphere=new THREE.Mesh(new THREE.SphereGeometry(.095,18,12),material);sphere.position.copy(point);sphere.renderOrder=21;group.add(sphere);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({color:'#ffb76b',transparent:true,opacity:.3,depthTest:false,depthWrite:false}));halo.position.copy(point);halo.scale.set(.34,.34,1);halo.renderOrder=19;group.add(halo);
  const points=model.userData.rowLayout.flatMap(r=>r.points);
  const roots=solution.edges.filter(e=>e.owner===id&&e.kind==='wale').map(e=>e.a);
  const siblings=solution.edges.filter(e=>e.kind==='wale'&&roots.includes(e.a)&&solution.nodes[e.owner].round===ri);
  const selected=solution.edges.filter(e=>e.owner===id);
  const increase=siblings.length>roots.length&&roots.length===1;
  const visible=increase?[...new Set([...selected,...siblings])]:selected;
  visible.forEach(e=>{
    const active=e.owner===id;
    const segments=e.kind==='wale'?scArm(points[e.a],points[e.b]):[[points[e.a],points[e.b]]];
    segments.forEach(([a,b])=>{
      const delta=b.clone().sub(a),length=delta.length();if(length<1e-6)return;
      const tint=material.clone();if(!active)tint.color.set('#d69b76');
      const tube=new THREE.Mesh(new THREE.CylinderGeometry(active?.022:.014,active?.022:.014,length,8),tint);tube.position.copy(a).lerp(b,.5);tube.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());tube.renderOrder=20;group.add(tube);
    });
  });
  const canvas=document.createElement('canvas');canvas.width=640;canvas.height=112;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.beginPath();ctx.roundRect(4,4,632,104,24);ctx.fill();ctx.strokeStyle='#ef662e';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#b94313';ctx.font='600 28px sans-serif';ctx.textAlign='center';ctx.fillText(`NEXT · ${stitchType} · R${number} / ST ${si+1}`,320,68);
  const texture=new THREE.CanvasTexture(canvas),label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,depthWrite:false}));label.position.copy(point).add(new THREE.Vector3(0,.46,0));label.scale.set(1.95,.34,1);label.renderOrder=22;group.add(label);model.add(group);
}
export function disposeObject(object){object.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.map?.dispose();m.dispose();});});}
