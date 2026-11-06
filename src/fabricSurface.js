import * as THREE from 'three';

// Stitch-count changes need unequal rings joined without closing the top.
export function fabricSurface(rings){
  const vertices=[];
  const triangle=(a,b,c)=>vertices.push(...a.toArray(),...b.toArray(),...c.toArray());
  function join(inner,outer){
    if(inner.length<3||outer.length<3)return;
    let i=0,j=0;
    while(i<inner.length||j<outer.length){
      const a=inner[i%inner.length],b=outer[j%outer.length];
      if(j===outer.length||(i<inner.length&&(i+1)/inner.length<=(j+1)/outer.length)){
        triangle(a,b,inner[(i+1)%inner.length]);i++;
      }else{triangle(a,b,outer[(j+1)%outer.length]);j++;}
    }
  }
  if(rings[0]?.length>=3){
    const first=rings[0],center=first.reduce((s,p)=>s.add(p),new THREE.Vector3()).divideScalar(first.length);
    join(first.map(p=>center.clone().lerp(p,.18)),first);
  }
  for(let i=1;i<rings.length;i++)join(rings[i-1],rings[i]);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
  const material=new THREE.MeshStandardMaterial({color:'#94a7bb',roughness:1,transparent:true,opacity:.2,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  const surface=new THREE.Mesh(geometry,material);surface.userData.fabricSurface=true;surface.renderOrder=-1;
  return surface;
}
