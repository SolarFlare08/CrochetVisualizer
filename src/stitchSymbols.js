import * as THREE from 'three';

export function magicRingArm(points,index){
  const center=points.reduce((sum,p)=>sum.add(p),new THREE.Vector3()).divideScalar(points.length);
  const tip=points[index];
  // Leave the magic-ring opening visible; each SC radiates from its edge.
  const root=center.lerp(tip,.18);
  return scArm(root,tip);
}

// The arm runs from its actual root to its output stitch. The transverse
// bar identifies single crochet, including both arms of an increase.
export function scArm(a,b){
  const direction=b.clone().sub(a).normalize();
  // Keep the bar in the ground (XZ) plane, transverse to the arm's
  // horizontal projection, even where the fabric bends near the base.
  let across=new THREE.Vector3(-direction.z,0,direction.x);
  if(across.lengthSq()<1e-6){
    across.set(a.z+b.z,0,-a.x-b.x);
    if(across.lengthSq()<1e-6)across.set(1,0,0);
  }
  across.normalize().multiplyScalar(Math.min(.11,a.distanceTo(b)*.23));
  const middle=a.clone().lerp(b,.64);
  return [[a,b],[middle.clone().sub(across),middle.clone().add(across)]];
}
