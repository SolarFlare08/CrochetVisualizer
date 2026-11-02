import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createStitchGeometry, stitchConnections } from './stitchGeometry';

export default function Preview({ rounds, color, gauge, rowGauge, widthScale, heightScale, currentRound, view, camera, resetCamera, cutaway }) {
  const host = useRef(null), api = useRef(null);
  useEffect(() => {
    const el = host.current;
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { el.textContent = '3D is unavailable on this device. Use Construction view to inspect every round.'; return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.shadowMap.enabled = true;
    renderer.setClearColor(0xf3f2ed, 1); el.appendChild(renderer.domElement);
    const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0xf3f2ed, 40, 90);
    const cam = new THREE.PerspectiveCamera(37, 1, .1, 200);
    cam.position.set(17, 12, 22);
    const controls = new OrbitControls(cam, renderer.domElement); controls.enableDamping = true; controls.minDistance = 4; controls.maxDistance = 65; controls.target.set(0, 5, 0);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8b9084, 2.5));
    const key = new THREE.DirectionalLight(0xffffff, 3.2); key.position.set(8, 18, 9); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); Object.assign(key.shadow.camera, { left: -18, right: 18, top: 25, bottom: -18 }); scene.add(key);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: .12 })); ground.rotation.x = -Math.PI / 2; ground.position.y = -.25; ground.receiveShadow = true; scene.add(ground);
    const grid = new THREE.GridHelper(70, 35, 0xd3d7cd, 0xe3e5dd); grid.position.y = -.27; scene.add(grid);
    const model = new THREE.Group(); scene.add(model);
    const resize = () => { const { width, height } = el.getBoundingClientRect(); renderer.setSize(width, height); cam.aspect = width / Math.max(height, 1); cam.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(el); resize();
    let frame; const animate = () => { frame = requestAnimationFrame(animate); controls.update(); renderer.render(scene, cam); }; animate();
    api.current = { scene, model, cam, controls };
    return () => { cancelAnimationFrame(frame); observer.disconnect(); controls.dispose(); scene.traverse(o => { o.geometry?.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose()); }); renderer.dispose(); el.replaceChildren(); api.current = null; };
  }, []);
  useEffect(() => {
    if (!api.current) return;
    const { model, controls } = api.current;
    while (model.children.length) { const child = model.children[0]; child.geometry?.dispose(); child.material?.dispose(); model.remove(child); }
    if (!rounds.length) return;
    const stitch = 10 / gauge, rise = 10 / rowGauge;
    const points = [new THREE.Vector2(.04, 0)];
    rounds.forEach((r, i) => points.push(new THREE.Vector2(r.previewCount * stitch / (2 * Math.PI), (i + .7) * rise)));
    const realistic = view === '3d';
    const chartMode = view === 'symbols';
    const material = new THREE.MeshStandardMaterial({ color: realistic ? new THREE.Color(color).multiplyScalar(.86) : chartMode ? new THREE.Color(color).lerp(new THREE.Color('#f3f2ed'), .88) : color, roughness: 1, side: THREE.DoubleSide, transparent: !realistic && !chartMode, opacity: realistic || chartMode ? 1 : .09, depthWrite: realistic || chartMode });
    const insetPoints = points.map(p => new THREE.Vector2(Math.max(.02, p.x - (realistic ? stitch * .16 : 0)), p.y));
    const body = new THREE.Mesh(new THREE.LatheGeometry(insetPoints, 96, 0, cutaway ? Math.PI * 1.5 : Math.PI * 2), material); body.castShadow = realistic; body.receiveShadow = true; model.add(body);
    const dummy = new THREE.Object3D();
    const at = (index, fraction, offset = 0) => {
      const r = rounds[index], radius = r.previewCount * stitch / (Math.PI * 2) + offset;
      const angle = fraction * Math.PI * 2;
      return new THREE.Vector3(Math.sin(angle) * radius, (index + .7) * rise, Math.cos(angle) * radius);
    };
    const segment = (list, a, b) => list.push(a.x,a.y,a.z,b.x,b.y,b.z);
    rounds.forEach((r, i) => {
      const count = r.previewCount, radius = count * stitch / (Math.PI * 2);
      const roundColor = i === currentRound ? new THREE.Color(color).lerp(new THREE.Color('#d8b776'), .38) : new THREE.Color(color);
      if (!realistic) {
        const lines = [], connections = stitchConnections(r);
        for (let n = 0; n < count; n++) {
          const f = n / count, next = (n + 1) / count;
          if (cutaway && f >= .75) continue;
          if (view === 'sketch') {
            segment(lines, at(i, f), at(i, next));
            // Arrowheads show the direction of work around each round.
            const tip = at(i, f + .65 / count), back = at(i, f + .42 / count);
            segment(lines, tip, back.clone().add(new THREE.Vector3(0,rise * .12,0)));
            segment(lines, tip, back.clone().add(new THREE.Vector3(0,-rise * .12,0)));
            if (i) for (const anchor of connections[n]?.inputs || [Math.floor(f * rounds[i-1].previewCount)]) {
              segment(lines, at(i, f), at(i - 1, anchor / rounds[i-1].previewCount));
            }
          } else {
            // US chart convention: X = sc; two branches from one base = inc;
            // two bases to one top = dec. Symbols follow the object's surface.
            const connection = connections[n];
            const repeatedIncrease = connection?.op === 'inc' && connections[n-1]?.inputs[0] === connection.inputs[0];
            segment(lines, at(i, f, stitch * .10).add(new THREE.Vector3(0,rise * .42,0)), at(i, next, stitch * .10).add(new THREE.Vector3(0,rise * .42,0)));
            if (repeatedIncrease) continue;
            const center = f + (connection?.op === 'inc' ? .5 / count : 0);
            const x = (connection?.op === 'inc' ? .65 : .25) / count, y = rise * .28, p = at(i, center, stitch * .10);
            const left = at(i, center - x, stitch * .10), right = at(i, center + x, stitch * .10);
            if (connections[n]?.op === 'inc') {
              const base = p.clone().add(new THREE.Vector3(0,-y,0));
              segment(lines, base, left.clone().add(new THREE.Vector3(0,y,0)));
              segment(lines, base, right.clone().add(new THREE.Vector3(0,y,0)));
            } else if (connections[n]?.op === 'dec') {
              const top = p.clone().add(new THREE.Vector3(0,y,0));
              segment(lines, top, left.clone().add(new THREE.Vector3(0,-y,0)));
              segment(lines, top, right.clone().add(new THREE.Vector3(0,-y,0)));
            } else {
              segment(lines, left.clone().add(new THREE.Vector3(0,-y,0)), right.clone().add(new THREE.Vector3(0,y,0)));
              segment(lines, left.clone().add(new THREE.Vector3(0,y,0)), right.clone().add(new THREE.Vector3(0,-y,0)));
            }
          }
        }
        const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
        model.add(new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: roundColor.multiplyScalar(.58), transparent: true, opacity: i === currentRound ? 1 : .9 })));
        return;
      }
      const mesh = new THREE.InstancedMesh(createStitchGeometry(stitch, rise), new THREE.MeshStandardMaterial({ color: roundColor, roughness: .96 }), count);
      for (let n = 0; n < count; n++) {
        const angle = n / count * Math.PI * 2;
        if (cutaway && angle >= Math.PI * 1.5) dummy.scale.setScalar(0); else dummy.scale.setScalar(1);
        const previousRadius = (rounds[Math.max(0,i-1)].previewCount * stitch) / (Math.PI * 2);
        const nextRadius = (rounds[Math.min(rounds.length-1,i+1)].previewCount * stitch) / (Math.PI * 2);
        const slope = Math.max(-.65, Math.min(.65, Math.atan2((nextRadius - previousRadius) / 2, rise)));
        dummy.position.set(Math.sin(angle) * radius, (i + .7) * rise, Math.cos(angle) * radius); dummy.rotation.set(slope, angle, 0, 'YXZ'); dummy.updateMatrix(); mesh.setMatrixAt(n, dummy.matrix);
      }
      mesh.castShadow = true; mesh.receiveShadow = true; model.add(mesh);
    });
    model.scale.set(widthScale, heightScale, widthScale);
    controls.target.y = rounds.length * rise * heightScale / 2;
  }, [rounds, color, gauge, rowGauge, widthScale, heightScale, currentRound, cutaway, view]);
  useEffect(() => {
    if (!api.current) return;
    const { cam, controls } = api.current, h = Math.max(6, rounds.length * 10 / rowGauge * heightScale), d = Math.max(16, h * 2.2, ...rounds.map(r => r.previewCount * 10 / gauge / Math.PI * widthScale * 2.4));
    const y = controls.target.y;
    if (camera === 'top') cam.position.set(.01, y + d, .01);
    else if (camera === 'front') cam.position.set(0, y + .1, d);
    else cam.position.set(d * .65, y + d * .35, d * .8);
    controls.update();
  }, [camera, resetCamera, view, rounds, gauge, rowGauge, widthScale, heightScale]);
  return <div className="three-host" ref={host} aria-label="Interactive 3D crochet preview. Drag to rotate, scroll to zoom." />;
}
