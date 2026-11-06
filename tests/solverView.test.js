import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {buildSolverView} from '../src/solverView.js';
import {solveFabric} from '../src/fabricSolver.js';
import {parsePattern} from '../src/pattern.js';

test('sketch draws MR single crochet stems and bars without perimeter lines',()=>{
  const solution=solveFabric(parsePattern('R1: 6 sc in MR (6)\nR2: inc x6 (12)').rounds);
  const model=new THREE.Group();buildSolverView(model,solution);
  assert.equal(model.children[0].geometry.attributes.position.count,6*4);
  assert.equal(model.children[1].geometry.attributes.position.count,12*4);
  assert.equal(new Set(model.children[0].geometry.userData.owners).size,6);
  model.children.forEach(child=>{child.geometry.dispose();child.material.dispose();});
});
