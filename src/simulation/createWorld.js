// Three.js World Creation and Rendering Sync Engine (Part 2 Enhanced)

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { WORLD_SIZE, HALF_WORLD, POND, GRASS_CONFIG } from './constants.js';
import { WEATHER_TYPES } from './weatherSystem.js';

export function createEcosystemWorld(container, simulationEngine) {
  // 1. Setup Scene, Camera, Renderer
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1a241e); // Deep forest ambiance background
  scene.fog = new THREE.FogExp2(0x1a241e, 0.008);

  const width = container.clientWidth;
  const height = container.clientHeight;

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 300);
  camera.position.set(0, 50, 65);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // 2. Camera Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground
  controls.minDistance = 10;
  controls.maxDistance = 140;

  // 3. Lighting System
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
  scene.add(ambientLight);

  const sunLight = new THREE.DirectionalLight(0xfffaed, 1.2);
  sunLight.position.set(30, 60, 40);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 10;
  sunLight.shadow.camera.far = 150;
  const d = 50;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0x76947e, 0.4);
  fillLight.position.set(-30, 20, -30);
  scene.add(fillLight);

  // 4. Terrain & Ground Creation
  const groundGeo = new THREE.PlaneGeometry(WORLD_SIZE, WORLD_SIZE, 32, 32);
  const posAttr = groundGeo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const vx = posAttr.getX(i);
    const vz = posAttr.getY(i);
    const distPond = Math.hypot(vx - POND.x, vz - POND.z);
    if (distPond > POND.radius) {
      const height = Math.sin(vx * 0.1) * Math.cos(vz * 0.1) * 0.6;
      posAttr.setZ(i, height);
    } else {
      posAttr.setZ(i, -1.2);
    }
  }
  groundGeo.computeVertexNormals();

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x2d4a34,
    roughness: 0.85,
    metalness: 0.1
  });

  const terrainMesh = new THREE.Mesh(groundGeo, groundMat);
  terrainMesh.rotation.x = -Math.PI / 2;
  terrainMesh.receiveShadow = true;
  scene.add(terrainMesh);

  // Terrain boundary fence / edge highlight
  const edgeGeo = new THREE.BoxGeometry(WORLD_SIZE + 1, 1, WORLD_SIZE + 1);
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0x1d2e21, roughness: 0.9 });
  const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
  edgeMesh.position.set(0, -0.6, 0);
  scene.add(edgeMesh);

  // 5. Pond Creation
  const pondGeo = new THREE.CircleGeometry(POND.radius, 32);
  const pondMat = new THREE.MeshStandardMaterial({
    color: 0x2b6cb0,
    roughness: 0.1,
    metalness: 0.8,
    transparent: true,
    opacity: 0.85
  });
  const pondMesh = new THREE.Mesh(pondGeo, pondMat);
  pondMesh.rotation.x = -Math.PI / 2;
  pondMesh.position.set(POND.x, 0.05, POND.z);
  scene.add(pondMesh);

  // Pond shore ring
  const ringGeo = new THREE.RingGeometry(POND.radius - 0.2, POND.radius + 1.2, 32);
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x5a6b5c, roughness: 0.9 });
  const ringMesh = new THREE.Mesh(ringGeo, ringMat);
  ringMesh.rotation.x = -Math.PI / 2;
  ringMesh.position.set(POND.x, 0.02, POND.z);
  scene.add(ringMesh);

  // 6. Environmental Trees & Boulders
  createTreesAndEnvironment(scene);

  // 7. Grass Tuft Visual Representation (Instanced Mesh for high performance)
  const grassGridCount = GRASS_CONFIG.GRID_SIZE * GRASS_CONFIG.GRID_SIZE;
  const grassBladeGeo = createGrassTuftGeometry();
  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x48bb78,
    roughness: 0.7,
    side: THREE.DoubleSide
  });

  const grassMesh = new THREE.InstancedMesh(grassBladeGeo, grassMat, grassGridCount);
  grassMesh.castShadow = true;
  grassMesh.receiveShadow = true;
  scene.add(grassMesh);

  const dummyMat = new THREE.Matrix4();
  const dummyColor = new THREE.Color();

  // 8. Rain Particle System
  const rainCount = 1200;
  const rainGeo = new THREE.BufferGeometry();
  const rainPositions = new Float32Array(rainCount * 3);
  for (let i = 0; i < rainCount; i++) {
    rainPositions[i * 3] = (Math.random() - 0.5) * WORLD_SIZE;
    rainPositions[i * 3 + 1] = Math.random() * 35;
    rainPositions[i * 3 + 2] = (Math.random() - 0.5) * WORLD_SIZE;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
  const rainMat = new THREE.PointsMaterial({
    color: 0x90cdf4,
    size: 0.22,
    transparent: true,
    opacity: 0.7
  });
  const rainSystem = new THREE.Points(rainGeo, rainMat);
  rainSystem.visible = false;
  scene.add(rainSystem);

  // 9. Selected Entity 3D Target Marker
  const markerGeo = new THREE.RingGeometry(0.8, 1.1, 16);
  const markerMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.85
  });
  const selectionMarker = new THREE.Mesh(markerGeo, markerMat);
  selectionMarker.rotation.x = -Math.PI / 2;
  selectionMarker.visible = false;
  scene.add(selectionMarker);

  // 10. Entity Mesh Management
  const entityMeshMap = new Map(); // entity.id -> Three.js Group
  const rabbitGeom = createRabbitModel();
  const foxGeom = createFoxModel();

  // 11. Raycasting for Animal Selection
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const handlePointerDown = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    // Collect all mesh children from animals
    const animalMeshes = [];
    entityMeshMap.forEach((group, id) => {
      group.traverse((child) => {
        if (child.isMesh) {
          child.userData = { entityId: id };
          animalMeshes.push(child);
        }
      });
    });

    const intersects = raycaster.intersectObjects(animalMeshes, false);
    if (intersects.length > 0) {
      const targetId = intersects[0].object.userData.entityId;
      if (simulationEngine && targetId) {
        simulationEngine.selectEntity(targetId);
      }
    }
  };
  renderer.domElement.addEventListener('pointerdown', handlePointerDown);

  // 12. Resize Handler
  const handleResize = () => {
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', handleResize);

  // 13. Weather Atmosphere Interpolators
  const targetBg = new THREE.Color(0x1a241e);
  const targetFog = new THREE.Color(0x1a241e);
  const targetSunColor = new THREE.Color(0xfffaed);
  let targetSunIntensity = 1.2;
  let targetAmbientIntensity = 0.65;

  function updateAtmosphere(weatherType) {
    if (weatherType === WEATHER_TYPES.RAIN) {
      targetBg.setHex(0x1e293b);
      targetFog.setHex(0x1e293b);
      targetSunColor.setHex(0x94a3b8);
      targetSunIntensity = 0.45;
      targetAmbientIntensity = 0.45;
      rainSystem.visible = true;
    } else if (weatherType === WEATHER_TYPES.DROUGHT) {
      targetBg.setHex(0x3b2b1e);
      targetFog.setHex(0x3b2b1e);
      targetSunColor.setHex(0xffedd5);
      targetSunIntensity = 1.6;
      targetAmbientIntensity = 0.75;
      rainSystem.visible = false;
    } else if (weatherType === WEATHER_TYPES.NIGHT) {
      targetBg.setHex(0x0a0f18);
      targetFog.setHex(0x0a0f18);
      targetSunColor.setHex(0x60a5fa);
      targetSunIntensity = 0.35;
      targetAmbientIntensity = 0.25;
      rainSystem.visible = false;
    } else {
      // SUNNY
      targetBg.setHex(0x1a241e);
      targetFog.setHex(0x1a241e);
      targetSunColor.setHex(0xfffaed);
      targetSunIntensity = 1.2;
      targetAmbientIntensity = 0.65;
      rainSystem.visible = false;
    }

    // Smooth lerp
    scene.background.lerp(targetBg, 0.05);
    scene.fog.color.lerp(targetFog, 0.05);
    sunLight.color.lerp(targetSunColor, 0.05);
    sunLight.intensity = THREE.MathUtils.lerp(sunLight.intensity, targetSunIntensity, 0.05);
    ambientLight.intensity = THREE.MathUtils.lerp(ambientLight.intensity, targetAmbientIntensity, 0.05);
  }

  // 14. Update & Render Sync Function
  function syncRender(engine) {
    // A. Update Weather & Atmosphere
    const weatherState = engine.weatherSystem.getState();
    updateAtmosphere(weatherState.currentWeather);

    // Animate Rain if active
    if (rainSystem.visible) {
      const positions = rainGeo.attributes.position.array;
      for (let i = 1; i < rainCount * 3; i += 3) {
        positions[i] -= 0.7;
        if (positions[i] < 0) {
          positions[i] = 32;
        }
      }
      rainGeo.attributes.position.needsUpdate = true;
    }

    // B. Sync Grass Mesh Instancing
    const patches = engine.grassSystem.patches;
    for (let i = 0; i < patches.length; i++) {
      const p = patches[i];
      const scale = p.inPond ? 0.001 : Math.max(0.05, p.energy);

      dummyMat.makeTranslation(p.x, 0.1, p.z);
      dummyMat.scale(new THREE.Vector3(scale, scale, scale));
      grassMesh.setMatrixAt(i, dummyMat);

      if (p.energy > 0.7) {
        dummyColor.setHex(0x38a169);
      } else if (p.energy > 0.3) {
        dummyColor.setHex(0x68d391);
      } else {
        dummyColor.setHex(0x9ae6b4);
      }
      grassMesh.setColorAt(i, dummyColor);
    }
    grassMesh.instanceMatrix.needsUpdate = true;
    if (grassMesh.instanceColor) grassMesh.instanceColor.needsUpdate = true;

    // C. Sync Rabbits
    const activeIds = new Set();
    const rabbits = engine.rabbits;
    for (let i = 0; i < rabbits.length; i++) {
      const r = rabbits[i];
      activeIds.add(r.id);

      let group = entityMeshMap.get(r.id);
      if (!group) {
        group = rabbitGeom.clone();
        scene.add(group);
        entityMeshMap.set(r.id, group);
      }

      group.position.set(r.x, 0.4, r.z);
      group.rotation.y = -r.rotation + Math.PI / 2;

      const hopFrequency = r.state === 'EATING' ? 2 : 10;
      const bounce = Math.abs(Math.sin(Date.now() * 0.008 * hopFrequency)) * (r.state === 'EATING' ? 0.15 : 0.35);
      group.position.y = 0.3 + bounce;
    }

    // D. Sync Foxes
    const foxes = engine.foxes;
    for (let i = 0; i < foxes.length; i++) {
      const f = foxes[i];
      activeIds.add(f.id);

      let group = entityMeshMap.get(f.id);
      if (!group) {
        group = foxGeom.clone();
        scene.add(group);
        entityMeshMap.set(f.id, group);
      }

      group.position.set(f.x, 0.5, f.z);
      group.rotation.y = -f.rotation + Math.PI / 2;

      const runFreq = f.state === 'HUNTING' ? 14 : 7;
      const bounce = Math.abs(Math.sin(Date.now() * 0.008 * runFreq)) * 0.25;
      group.position.y = 0.4 + bounce;

      const tailMesh = group.getObjectByName('tail');
      if (tailMesh) {
        tailMesh.rotation.z = Math.sin(Date.now() * 0.012 * runFreq) * 0.3;
      }
    }

    // E. Remove meshes of dead entities
    entityMeshMap.forEach((mesh, id) => {
      if (!activeIds.has(id)) {
        scene.remove(mesh);
        disposeGroup(mesh);
        entityMeshMap.delete(id);
      }
    });

    // F. Update Selection Marker & Camera Follow
    if (engine.selectedEntityId && entityMeshMap.has(engine.selectedEntityId)) {
      const targetMesh = entityMeshMap.get(engine.selectedEntityId);
      selectionMarker.visible = true;
      selectionMarker.position.set(targetMesh.position.x, 0.08, targetMesh.position.z);
      selectionMarker.rotation.z += 0.03; // Rotate marker ring

      if (engine.followCamera) {
        controls.target.lerp(targetMesh.position, 0.06);
      }
    } else {
      selectionMarker.visible = false;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  function cleanup() {
    window.removeEventListener('resize', handleResize);
    renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
    entityMeshMap.forEach((mesh) => {
      scene.remove(mesh);
      disposeGroup(mesh);
    });
    entityMeshMap.clear();

    if (container && renderer.domElement) {
      container.removeChild(renderer.domElement);
    }
    renderer.dispose();
  }

  return { syncRender, cleanup };
}

// Helper: Grass Tuft Geometry
function createGrassTuftGeometry() {
  const bladeGeo = new THREE.PlaneGeometry(1.2, 1.4);
  bladeGeo.translate(0, 0.7, 0);
  return bladeGeo;
}

// Helper: Procedural Low-Poly Rabbit Group
function createRabbitModel() {
  const group = new THREE.Group();

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf0f4f8, roughness: 0.6 });
  const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.7, 0.6, 0.9);
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.3;
  body.castShadow = true;
  group.add(body);

  // Head
  const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(0, 0.5, 0.45);
  head.castShadow = true;
  group.add(head);

  // Ears
  const earGeo = new THREE.BoxGeometry(0.12, 0.5, 0.12);
  const leftEar = new THREE.Mesh(earGeo, bodyMat);
  leftEar.position.set(-0.16, 0.95, 0.4);
  leftEar.rotation.z = -0.15;
  leftEar.castShadow = true;

  const innerEarMat = new THREE.MeshBasicMaterial({ color: 0xfab1a0 });
  const innerEarGeo = new THREE.BoxGeometry(0.06, 0.4, 0.02);
  const leftInner = new THREE.Mesh(innerEarGeo, innerEarMat);
  leftInner.position.set(0, 0, 0.06);
  leftEar.add(leftInner);
  group.add(leftEar);

  const rightEar = leftEar.clone();
  rightEar.position.set(0.16, 0.95, 0.4);
  rightEar.rotation.z = 0.15;
  group.add(rightEar);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.05, 8, 8);
  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.26, 0.55, 0.6);
  const rightEye = leftEye.clone();
  rightEye.position.set(0.26, 0.55, 0.6);
  group.add(leftEye);
  group.add(rightEye);

  // Tail
  const tailGeo = new THREE.SphereGeometry(0.15, 8, 8);
  const tail = new THREE.Mesh(tailGeo, bodyMat);
  tail.position.set(0, 0.3, -0.5);
  group.add(tail);

  group.scale.set(1.1, 1.1, 1.1);
  return group;
}

// Helper: Procedural Low-Poly Fox Model Group
function createFoxModel() {
  const group = new THREE.Group();

  const orangeMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 });
  const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.4 });

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.85, 0.75, 1.4);
  const body = new THREE.Mesh(bodyGeo, orangeMat);
  body.position.y = 0.45;
  body.castShadow = true;
  group.add(body);

  // Chest
  const chestGeo = new THREE.BoxGeometry(0.75, 0.5, 0.3);
  const chest = new THREE.Mesh(chestGeo, whiteMat);
  chest.position.set(0, 0.35, 0.6);
  group.add(chest);

  // Head & Snout
  const headGeo = new THREE.BoxGeometry(0.65, 0.6, 0.65);
  const head = new THREE.Mesh(headGeo, orangeMat);
  head.position.set(0, 0.75, 0.75);
  head.castShadow = true;
  group.add(head);

  const snoutGeo = new THREE.ConeGeometry(0.25, 0.5, 4);
  const snout = new THREE.Mesh(snoutGeo, orangeMat);
  snout.rotation.x = Math.PI / 2;
  snout.rotation.y = Math.PI / 4;
  snout.position.set(0, 0.65, 1.1);
  snout.castShadow = true;
  group.add(snout);

  // Nose
  const noseGeo = new THREE.SphereGeometry(0.07, 8, 8);
  const nose = new THREE.Mesh(noseGeo, darkMat);
  nose.position.set(0, 0.68, 1.35);
  group.add(nose);

  // Ears
  const earGeo = new THREE.ConeGeometry(0.18, 0.45, 4);
  const leftEar = new THREE.Mesh(earGeo, orangeMat);
  leftEar.position.set(-0.24, 1.2, 0.75);
  leftEar.castShadow = true;

  const earTipGeo = new THREE.ConeGeometry(0.1, 0.2, 4);
  const leftTip = new THREE.Mesh(earTipGeo, darkMat);
  leftTip.position.y = 0.15;
  leftEar.add(leftTip);
  group.add(leftEar);

  const rightEar = leftEar.clone();
  rightEar.position.set(0.24, 1.2, 0.75);
  group.add(rightEar);

  // Tail
  const tailGroup = new THREE.Group();
  tailGroup.name = 'tail';
  tailGroup.position.set(0, 0.6, -0.7);

  const tailGeo = new THREE.ConeGeometry(0.35, 1.2, 6);
  const tailMain = new THREE.Mesh(tailGeo, orangeMat);
  tailMain.rotation.x = -Math.PI / 3;
  tailMain.position.z = -0.5;
  tailMain.castShadow = true;
  tailGroup.add(tailMain);

  const tailTipGeo = new THREE.ConeGeometry(0.22, 0.4, 6);
  const tailTip = new THREE.Mesh(tailTipGeo, whiteMat);
  tailTip.rotation.x = -Math.PI / 3;
  tailTip.position.set(0, -0.2, -0.85);
  tailGroup.add(tailTip);

  group.add(tailGroup);

  group.scale.set(1.15, 1.15, 1.15);
  return group;
}

// Helper: Procedural Trees and Environment Boulders
function createTreesAndEnvironment(scene) {
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3525, roughness: 0.9 });
  const foliageMat1 = new THREE.MeshStandardMaterial({ color: 0x1c4a2a, roughness: 0.7 });
  const foliageMat2 = new THREE.MeshStandardMaterial({ color: 0x276738, roughness: 0.7 });
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x5a6572, roughness: 0.8 });

  const treePositions = [
    { x: -30, z: -25 }, { x: -35, z: 10 }, { x: -28, z: 30 },
    { x: -10, z: 32 }, { x: 15, z: 35 }, { x: 32, z: 28 },
    { x: 30, z: -10 }, { x: 34, z: -28 }, { x: 10, z: -35 },
    { x: -25, z: -35 }, { x: 25, z: 15 }, { x: -32, z: -5 },
    { x: 28, z: -35 }, { x: -15, z: 25 }, { x: 5, z: 30 }, { x: 35, z: 5 }
  ];

  treePositions.forEach((pos, idx) => {
    const treeGroup = new THREE.Group();

    const trunkGeo = new THREE.CylinderGeometry(0.4, 0.6, 3, 8);
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 1.5;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    const mat = idx % 2 === 0 ? foliageMat1 : foliageMat2;
    const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.5, 4, 8), mat);
    cone1.position.y = 4;
    cone1.castShadow = true;
    treeGroup.add(cone1);

    const cone2 = new THREE.Mesh(new THREE.ConeGeometry(2.0, 3.5, 8), mat);
    cone2.position.y = 5.8;
    cone2.castShadow = true;
    treeGroup.add(cone2);

    const cone3 = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.5, 8), mat);
    cone3.position.y = 7.2;
    cone3.castShadow = true;
    treeGroup.add(cone3);

    const s = 0.8 + Math.random() * 0.4;
    treeGroup.scale.set(s, s, s);
    treeGroup.position.set(pos.x, 0, pos.z);
    scene.add(treeGroup);
  });

  const rockGeo = new THREE.DodecahedronGeometry(1.2, 1);
  const rockPositions = [
    { x: POND.x + POND.radius + 1.2, z: POND.z - 2 },
    { x: POND.x - POND.radius - 1.5, z: POND.z + 3 },
    { x: 18, z: -18 }, { x: -22, z: 18 }
  ];

  rockPositions.forEach((pos) => {
    const rock = new THREE.Mesh(rockGeo, rockMat);
    rock.position.set(pos.x, 0.5, pos.z);
    rock.rotation.set(Math.random(), Math.random(), Math.random());
    rock.scale.set(0.8 + Math.random() * 0.6, 0.6 + Math.random() * 0.4, 0.8 + Math.random() * 0.6);
    rock.castShadow = true;
    rock.receiveShadow = true;
    scene.add(rock);
  });
}

function disposeGroup(group) {
  group.traverse((child) => {
    if (child.geometry) child.geometry.dispose();
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  });
}
