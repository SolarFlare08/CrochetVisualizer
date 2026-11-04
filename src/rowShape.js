import * as THREE from 'three';
import { operation } from './language.js';
import { createStitchGeometry } from './stitchGeometry.js';

// A strip's two edge lengths determine its bend: L = radius * angle.
// Equal counts produce a straight strip; unequal counts produce an annular sector.
export function rowLayout(rounds, width, rise) {
  const heights=rounds.map((r,i)=>i ? Math.max(.35,...r.ops.map(op=>operation(op).height))*rise : width*.4);
  const levels=[0]; for(let i=1;i<rounds.length;i++)levels.push(levels[i-1]+heights[i]);
  const lengths=rounds.map(r=>r.previewCount*width);
  const span=levels.at(-1)||1;
  const bend=Math.max(-Math.PI,Math.min(Math.PI,(lengths.at(-1)-lengths[0])/span));
  return rounds.map((r,i)=>{
    const points=Array.from({length:r.previewCount},(_,n)=>{
      const u=(i%2 ? 1-(n+.5)/r.previewCount : (n+.5)/r.previewCount)-.5;
      if(Math.abs(bend)<.001) return new THREE.Vector3(u*lengths[i],levels[i],0);
      const radius=lengths[i]/bend;
      return new THREE.Vector3(radius*Math.sin(u*bend),levels[i]+radius*(Math.cos(u*bend)-1),0);
    });
    return {points,height:heights[i],bend};
  });
}

export function buildRows(model, rounds, width, rise, view) {
  const layout=rowLayout(rounds,width,rise), dummy=new THREE.Object3D();
  const bottom=Math.min(...layout.flatMap(row=>row.points.map(p=>p.y-row.height*.65)));
  layout.forEach(row=>row.points.forEach(p=>p.y-=bottom));
  layout.forEach((row,i)=>{
    const count=row.points.length;
    if(view==='3d') {
      const geometry=createStitchGeometry(width,row.height);
      const mesh=new THREE.InstancedMesh(geometry,new THREE.MeshStandardMaterial({color:'white',roughness:.95}),count);
      mesh.userData.roundIndex=i;
      row.points.forEach((point,n)=>{
        dummy.position.copy(point);
        const u=(i%2?1-(n+.5)/count:(n+.5)/count)-.5;
        dummy.rotation.set(0,0,-u*row.bend);dummy.updateMatrix();mesh.setMatrixAt(n,dummy.matrix);
      });model.add(mesh);
    } else {
      const vertices=[],owners=[];
      const segment=(a,b,n)=>{vertices.push(...a.toArray(),...b.toArray());owners.push(n,n);};
      row.points.forEach((p,n)=>{
        if(n)segment(row.points[n-1],p,n);
        if(i){const prev=layout[i-1].points;const root=prev[Math.min(prev.length-1,Math.floor((1-(n+.5)/count)*prev.length))];segment(root,p,n);}
        if(view==='symbols')segment(p.clone().add(new THREE.Vector3(-width*.2,0,0)),p.clone().add(new THREE.Vector3(width*.2,0,0)),n);
      });
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(vertices.length),3));geometry.userData.owners=owners;
      const lines=new THREE.LineSegments(geometry,new THREE.LineBasicMaterial({vertexColors:true}));lines.userData.roundIndex=i;model.add(lines);
    }
  });
  model.userData.rowLayout=layout;
}
