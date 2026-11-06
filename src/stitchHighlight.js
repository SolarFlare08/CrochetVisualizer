import * as THREE from 'three';

export function highlightStitch(model,solution,ri,si,number){
  const id=solution.rings[ri]?.[si],point=model.userData.rowLayout?.[ri]?.points[si];
  if(id===undefined||!point)return;
  const group=new THREE.Group();group.userData.activePointer=true;
  const material=new THREE.MeshBasicMaterial({color:'#ef662e',depthTest:false,depthWrite:false});
  const sphere=new THREE.Mesh(new THREE.SphereGeometry(.095,18,12),material);sphere.position.copy(point);sphere.renderOrder=21;group.add(sphere);
  const halo=new THREE.Sprite(new THREE.SpriteMaterial({color:'#ffb76b',transparent:true,opacity:.3,depthTest:false,depthWrite:false}));halo.position.copy(point);halo.scale.set(.34,.34,1);halo.renderOrder=19;group.add(halo);
  const points=model.userData.rowLayout.flatMap(r=>r.points);
  solution.edges.filter(e=>e.owner===id).forEach(e=>{
    const a=points[e.a],b=points[e.b],delta=b.clone().sub(a),length=delta.length();if(length<1e-6)return;
    const tube=new THREE.Mesh(new THREE.CylinderGeometry(.022,.022,length,8),material.clone());tube.position.copy(a).lerp(b,.5);tube.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());tube.renderOrder=20;group.add(tube);
  });
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=112;
  const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.beginPath();ctx.roundRect(4,4,504,104,24);ctx.fill();ctx.strokeStyle='#ef662e';ctx.lineWidth=5;ctx.stroke();ctx.fillStyle='#b94313';ctx.font='600 32px sans-serif';ctx.textAlign='center';ctx.fillText(`NEXT · R${number} / ST ${si+1}`,256,68);
  const texture=new THREE.CanvasTexture(canvas),label=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,depthWrite:false}));label.position.copy(point).add(new THREE.Vector3(0,.46,0));label.scale.set(1.55,.34,1);label.renderOrder=22;group.add(label);model.add(group);
}
export function disposeObject(object){object.traverse(o=>{o.geometry?.dispose();if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{m.map?.dispose();m.dispose();});});}
