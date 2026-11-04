import * as THREE from 'three';
export function buildSolverView(model,solution) {
  const {nodes,edges}=solution;
  const minY=Math.min(...nodes.map(n=>n.y));
  const points=nodes.map(n=>new THREE.Vector3(n.x,n.y-minY+.2,n.z));
  const rounds=[...new Set(nodes.map(n=>n.round))];
  rounds.forEach(ri=>{
    const vertices=[],owners=[];
    const segment=(a,b,owner)=>{vertices.push(...a.toArray(),...b.toArray());owners.push(owner,owner);};
    edges.filter(e=>nodes[e.owner].round===ri).forEach(e=>{
      const a=points[e.a],b=points[e.b],owner=nodes[e.owner].stitch;segment(a,b,owner);
      if(e.kind==='course') {
        const direction=b.clone().sub(a).normalize(),tip=a.clone().lerp(b,.7),side=new THREE.Vector3(-direction.z,0,direction.x).multiplyScalar(.055);
        const back=tip.clone().addScaledVector(direction,-.12);
        segment(tip,back.clone().add(side),owner);segment(tip,back.clone().sub(side),owner);
      }
    });
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(vertices.length),3));g.userData.owners=owners;
    const line=new THREE.LineSegments(g,new THREE.LineBasicMaterial({vertexColors:true}));line.userData.roundIndex=ri;model.add(line);
  });
  model.userData.rowLayout=solution.rings.map(ring=>({points:ring.map(id=>points[id])}));
}
