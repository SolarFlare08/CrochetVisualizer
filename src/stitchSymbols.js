import * as THREE from 'three';

// The arm runs from its actual root to its output stitch. The transverse
// bar identifies single crochet, including both arms of an increase.
export function scArm(a,b){
  const direction=b.clone().sub(a).normalize();
  const normal=new THREE.Vector3(a.x+b.x,0,a.z+b.z).normalize();
  let across=new THREE.Vector3().crossVectors(normal,direction);
  if(across.lengthSq()<1e-6)across=new THREE.Vector3(1,0,0).cross(direction);
  if(across.lengthSq()<1e-6)across.set(0,0,1);
  across.normalize().multiplyScalar(Math.min(.11,a.distanceTo(b)*.23));
  const middle=a.clone().lerp(b,.64);
  return [[a,b],[middle.clone().sub(across),middle.clone().add(across)]];
}
