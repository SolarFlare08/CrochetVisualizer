import * as THREE from 'three';

// Stitch-count changes need unequal rings joined without closing the top.
export function fabricSurface(rings){
  const vertices=[],owners=[];
  const triangle=(a,b,c,round,stitch)=>{vertices.push(...a.toArray(),...b.toArray(),...c.toArray());owners.push({round,stitch},{round,stitch},{round,stitch});};
  function join(inner,outer,round){
    if(inner.length<3||outer.length<3)return;
    let i=0,j=0;
    while(i<inner.length||j<outer.length){
      const a=inner[i%inner.length],b=outer[j%outer.length];
      if(j===outer.length||(i<inner.length&&(i+1)/inner.length<=(j+1)/outer.length)){
        triangle(a,b,inner[(i+1)%inner.length],round,j%outer.length);i++;
      }else{triangle(a,b,outer[(j+1)%outer.length],round,j%outer.length);j++;}
    }
  }
  if(rings[0]?.length>=3){
    const first=rings[0],center=first.reduce((s,p)=>s.add(p),new THREE.Vector3()).divideScalar(first.length);
    join(first.map(p=>center.clone().lerp(p,.18)),first,0);
  }
  // Interpolate along the fabric as well as around it. Shared tangents at
  // course boundaries round off the shoulder rather than forming hard creases.
  if(rings.length>1&&rings.every(r=>r.length>=3)){
    const count=Math.min(128,Math.max(24,...rings.map(r=>r.length*2)));
    const sample=(ring,f)=>{
      const pos=f*ring.length,i=Math.floor(pos);
      return ring[i%ring.length].clone().lerp(ring[(i+1)%ring.length],pos-i);
    };
    const curves=Array.from({length:count},(_,n)=>new THREE.CatmullRomCurve3(rings.map(r=>sample(r,n/count)),false,'catmullrom',.25));
    const slice=t=>curves.map(curve=>curve.getPoint(t));
    for(let ri=1;ri<rings.length;ri++){
      let previous=slice((ri-1)/(rings.length-1));
      for(let step=1;step<=6;step++){
        const next=slice((ri-1+step/6)/(rings.length-1));
        for(let n=0;n<count;n++){
          const k=(n+1)%count,owner=Math.min(rings[ri].length-1,Math.floor((n+.5)/count*rings[ri].length));
          triangle(previous[n],next[n],previous[k],ri,owner);
          triangle(previous[k],next[n],next[k],ri,owner);
        }
        previous=next;
      }
    }
  }else for(let i=1;i<rings.length;i++)join(rings[i-1],rings[i],i);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(vertices.length).fill(1),3));
  geometry.userData.surfaceOwners=owners;
  const material=new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:1,transparent:true,opacity:.32,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  const surface=new THREE.Mesh(geometry,material);surface.userData.fabricSurface=true;surface.renderOrder=-1;
  return surface;
}

export function updateSurfaceProgress(surface,round,output,dark=false){
  const worked=new THREE.Color(dark?'#39b888':'#008451'),remaining=new THREE.Color(dark?'#8f79bd':'#a292c6');
  const attribute=surface.geometry.attributes.color;
  surface.geometry.userData.surfaceOwners.forEach((owner,i)=>{
    const color=owner.round<round||(owner.round===round&&owner.stitch<output)?worked:remaining;
    attribute.setXYZ(i,color.r,color.g,color.b);
  });
  attribute.needsUpdate=true;
}
