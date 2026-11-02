import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Front legs and the two strands of the top braid. Unlike a torus, the legs
// descend into the preceding round, with an over/under offset at the crossing.
export function createStitchGeometry(width, height) {
  const paths = [
    [[-.30,.46,-.03],[-.32,.14,.14],[-.19,-.30,.16],[.02,-.46,.02],[.21,-.27,-.06],[.30,.14,.04],[.30,.46,.04]],
    [[.30,.44,-.04],[.13,.15,-.14],[-.02,-.23,-.12],[-.22,-.38,.02]],
    [[-.50,.48,0],[-.24,.59,.14],[.06,.57,.16],[.31,.49,.08],[.50,.48,0]],
    [[-.50,.48,0],[-.25,.42,-.07],[.04,.43,-.10],[.30,.53,-.07],[.50,.48,0]],
  ];
  const tubes = paths.map(points => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(([x,y,z]) => new THREE.Vector3(x * width,y * height,z * width))), 24, width * .155, 9, false));
  const geometry = mergeGeometries(tubes);
  tubes.forEach(g => g.dispose());
  return geometry;
}

export function createFabricProfile(rounds, stitch, rise) {
  const knots = [{ radius: .02, y: 0 }, ...rounds.map((r,i) => ({ radius: r.previewCount * stitch / (2 * Math.PI), y: (i + .7) * rise }))];
  if (rounds.length) knots.push({ radius: knots.at(-1).radius, y: (rounds.length + .25) * rise });
  const radiusAt = y => {
    if (y <= 0) return knots[0].radius;
    for (let i = 1; i < knots.length; i++) {
      if (y <= knots[i].y) {
        const a = knots[i-1], b = knots[i], t = (y-a.y)/(b.y-a.y), eased = t*t*(3-2*t);
        return a.radius + (b.radius-a.radius)*eased;
      }
    }
    return knots.at(-1).radius;
  };
  return { radiusAt, height: knots.at(-1).y };
}

// Bend yarn onto the same radial profile as the backing fabric. A flat,
// tangent stitch can otherwise float away from the shell at shaped rounds.
export function conformStitchToFabric(geometry, radius, centerY, radiusAt) {
  const positions = geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    const angle = positions.getX(i) / radius;
    const radial = Math.max(.01, radiusAt(centerY + positions.getY(i)) + positions.getZ(i));
    positions.setXYZ(i, Math.sin(angle)*radial, positions.getY(i), Math.cos(angle)*radial-radius);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  return geometry;
}

// Each output stitch retains its input anchors so increases fan from one stitch
// and decreases converge from two, in both structural display modes.
export function stitchConnections(round) {
  let input = 0, output = 0;
  return round.ops.flatMap(op => {
    const used = op === 'dec' ? 2 : 1, made = op === 'inc' ? 2 : 1;
    const result = Array.from({ length: made }, () => ({ output: output++, inputs: Array.from({ length: used }, (_, k) => input + k), op }));
    input += used;
    return result;
  });
}
