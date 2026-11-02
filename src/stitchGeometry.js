import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Front legs and the two strands of the top braid. Unlike a torus, the legs
// descend into the preceding round, with an over/under offset at the crossing.
export function createStitchGeometry(width, height) {
  const paths = [
    [[-.43,.46,-.03],[-.37,.15,.10],[-.16,-.30,.13],[.02,-.48,.04],[.20,-.22,-.03],[.38,.20,-.04],[.43,.46,.02]],
    [[-.50,.48,0],[-.24,.59,.14],[.06,.57,.16],[.31,.49,.08],[.50,.48,0]],
    [[-.50,.48,0],[-.25,.42,-.07],[.04,.43,-.10],[.30,.53,-.07],[.50,.48,0]],
  ];
  const tubes = paths.map(points => new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(([x,y,z]) => new THREE.Vector3(x * width,y * height,z * width))), 24, width * .17, 9, false));
  const geometry = mergeGeometries(tubes);
  tubes.forEach(g => g.dispose());
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
