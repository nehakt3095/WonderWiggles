import * as THREE from 'three';
import { getWorldById } from '../data/worlds';
import type { MazeCell, WorldId } from '../types/game';

export interface IslandSceneHandle {
  group: THREE.Group;
  animatedProps: THREE.Object3D[];
}

export interface MazeBoardHandle {
  group: THREE.Group;
  tileMeshes: THREE.Mesh[];
  starMeshes: Map<string, THREE.Object3D>;
  bridgeMeshes: Map<string, THREE.Object3D[]>;
  switchMeshes: Map<string, THREE.Object3D>;
  cellToWorld: (x: number, y: number) => THREE.Vector3;
}

function createTreeGroup(canopyColor: number, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.18, 0.7, 10),
    new THREE.MeshStandardMaterial({ color: 0xb4846c, roughness: 0.9 })
  );
  trunk.position.y = 0.35;
  trunk.castShadow = true;
  g.add(trunk);

  const c1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.45, 16, 14),
    new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.75 })
  );
  c1.position.y = 0.85;
  c1.castShadow = true;
  g.add(c1);

  const c2 = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 14, 12),
    new THREE.MeshStandardMaterial({ color: canopyColor, roughness: 0.7 })
  );
  c2.position.set(0.22, 1.08, 0.1);
  g.add(c2);

  g.scale.setScalar(scale);
  return g;
}

function createStarMesh(colorHex = 0xfbbf24, radius = 0.28): THREE.Mesh {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radius : radius * 0.48;
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 3,
  });
  geo.center();
  return new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness: 0.25,
      metalness: 0.35,
      emissive: colorHex,
      emissiveIntensity: 0.18,
    })
  );
}

export function buildMiniPlanetDiorama(): IslandSceneHandle {
  const group = new THREE.Group();
  const animatedProps: THREE.Object3D[] = [];

  // Ocean core sphere
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(1.55, 32, 28),
    new THREE.MeshStandardMaterial({ color: 0x7dd3fc, roughness: 0.35, metalness: 0.08 })
  );
  planet.receiveShadow = true;
  group.add(planet);

  // 5 island caps distributed around the planet
  const islandColors = [0x86efac, 0x6ee7b7, 0xfdba74, 0x93c5fd, 0xddd6fe];
  const positions: [number, number, number][] = [
    [0, 1.45, 0.25],
    [1.35, 0.45, 0.45],
    [-1.32, 0.55, 0.4],
    [0.85, -1.0, 0.72],
    [-0.85, -0.95, 0.78],
  ];

  positions.forEach(([x, y, z], idx) => {
    const cap = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 18, 16),
      new THREE.MeshStandardMaterial({ color: islandColors[idx], roughness: 0.75 })
    );
    cap.position.set(x, y, z);
    cap.scale.set(1.2, 0.55, 1.2);
    cap.lookAt(x * 2, y * 2, z * 2);
    cap.rotateX(Math.PI / 2);
    group.add(cap);

    const miniTree = createTreeGroup(islandColors[(idx + 1) % 5], 0.38);
    miniTree.position.set(x * 1.12, y * 1.12, z * 1.12);
    miniTree.lookAt(x * 3, y * 3, z * 3);
    miniTree.rotateX(Math.PI / 2);
    group.add(miniTree);
  });

  // Orbiting golden starlight ring
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const star = createStarMesh(0xfbbf24, 0.16);
    star.position.set(Math.cos(angle) * 2.25, Math.sin(angle * 2) * 0.35, Math.sin(angle) * 2.25);
    group.add(star);
    animatedProps.push(star);
  }

  return { group, animatedProps };
}

export function buildWorldIslandDiorama(worldId: WorldId): IslandSceneHandle {
  const world = getWorldById(worldId);
  const group = new THREE.Group();
  const animatedProps: THREE.Object3D[] = [];

  // Main floating island plateau (bottom-center grounded at y=0 for stage)
  const topGrass = new THREE.Mesh(
    new THREE.CylinderGeometry(3.8, 3.6, 0.45, 36),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(world.islandColor), roughness: 0.78 })
  );
  topGrass.position.y = -0.22;
  topGrass.receiveShadow = true;
  group.add(topGrass);

  const earthBase = new THREE.Mesh(
    new THREE.ConeGeometry(3.55, 2.2, 32),
    new THREE.MeshStandardMaterial({ color: 0xd6b48e, roughness: 0.88 })
  );
  earthBase.position.y = -1.52;
  earthBase.rotation.x = Math.PI;
  group.add(earthBase);

  // Decorative coastal pebbles around edge
  const pebbleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.8 });
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const pebble = new THREE.Mesh(new THREE.SphereGeometry(0.18 + (i % 3) * 0.06, 10, 10), pebbleMat);
    pebble.scale.set(1.3, 0.6, 1.1);
    pebble.position.set(Math.cos(a) * 3.45, 0.04, Math.sin(a) * 3.45);
    group.add(pebble);
  }

  // World-specific 3D diorama landmarks placed around back perimeter so center stays clear
  if (worldId === 1) {
    // Shape Island: pastel lighthouse + rainbow geometric blocks
    const tower = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.45, 1.5, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
    );
    base.position.y = 0.75;
    base.castShadow = true;
    tower.add(base);

    const stripe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.37, 0.41, 0.45, 16),
      new THREE.MeshStandardMaterial({ color: 0xff8a4c, roughness: 0.5 })
    );
    stripe.position.y = 0.75;
    tower.add(stripe);

    const lantern = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.24, 0.35, 14),
      new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfbbf24, emissiveIntensity: 0.4 })
    );
    lantern.position.y = 1.65;
    tower.add(lantern);

    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 0.36, 14),
      new THREE.MeshStandardMaterial({ color: 0x60a5fa, roughness: 0.4 })
    );
    roof.position.y = 1.98;
    tower.add(roof);
    tower.position.set(-2.3, 0, -1.7);
    group.add(tower);

    const palm = createTreeGroup(0x34d399, 1.1);
    palm.position.set(2.4, 0, -1.5);
    group.add(palm);
  } else if (worldId === 2) {
    // Memory Forest: cozy grove & glowing mushrooms
    const treePositions = [
      [-2.5, -1.5, 1.15],
      [2.4, -1.6, 1.05],
      [-1.3, -2.5, 0.9],
      [1.2, -2.4, 1.2],
    ];
    treePositions.forEach(([x, z, s], i) => {
      const t = createTreeGroup(i % 2 === 0 ? 0x34d399 : 0x6ee7b7, s);
      t.position.set(x, 0, z);
      group.add(t);
    });

    const mushCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.45 })
    );
    mushCap.position.set(1.9, 0.25, -0.8);
    group.add(mushCap);
  } else if (worldId === 3) {
    // Wobble's Maze: garden pillars & archway backdrop
    const archGroup = new THREE.Group();
    const pillarGeo = new THREE.CylinderGeometry(0.16, 0.2, 1.3, 12);
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xfdba74, roughness: 0.7 });
    const pL = new THREE.Mesh(pillarGeo, pillarMat);
    pL.position.set(-0.65, 0.65, 0);
    const pR = new THREE.Mesh(pillarGeo, pillarMat);
    pR.position.set(0.65, 0.65, 0);
    const topArch = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.14, 10, 20, Math.PI), pillarMat);
    topArch.position.set(0, 1.28, 0);
    archGroup.add(pL, pR, topArch);
    archGroup.position.set(0, 0, -2.7);
    group.add(archGroup);
  } else if (worldId === 4) {
    // Magic Factory: spinning pastel gears
    const gearColors = [0xfbbf24, 0x60a5fa, 0xf472b6];
    gearColors.forEach((col, idx) => {
      const gear = new THREE.Group();
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.42, 0.1, 10, 18),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.35, metalness: 0.3 })
      );
      gear.add(rim);
      for (let t = 0; t < 8; t++) {
        const a = (t / 8) * Math.PI * 2;
        const tooth = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.18, 0.18),
          new THREE.MeshStandardMaterial({ color: col, roughness: 0.35, metalness: 0.3 })
        );
        tooth.position.set(Math.cos(a) * 0.52, Math.sin(a) * 0.52, 0);
        tooth.rotation.z = a;
        gear.add(tooth);
      }
      gear.position.set(-2.1 + idx * 2.1, 1.0 + (idx % 2) * 0.35, -2.2);
      gear.userData.spinAxis = 'z';
      group.add(gear);
      animatedProps.push(gear);
    });
  } else {
    // Cloud Kingdom: fluffy sky puffs & rainbow ring
    for (let c = 0; c < 4; c++) {
      const cloud = new THREE.Group();
      const puffMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
      [-0.25, 0, 0.25].forEach((ox, idx) => {
        const puff = new THREE.Mesh(new THREE.SphereGeometry(idx === 1 ? 0.34 : 0.24, 14, 12), puffMat);
        puff.position.set(ox, idx === 1 ? 0.1 : 0, 0);
        cloud.add(puff);
      });
      cloud.position.set(-2.4 + c * 1.6, 1.2 + (c % 2) * 0.45, -2.1);
      group.add(cloud);
      animatedProps.push(cloud);
    }
  }

  // Floating decorative stars
  for (let s = 0; s < 3; s++) {
    const star = createStarMesh(0xfbbf24, 0.2);
    star.position.set(-1.6 + s * 1.6, 1.75 + (s % 2) * 0.3, -1.4);
    group.add(star);
    animatedProps.push(star);
  }

  return { group, animatedProps };
}

export function buildMazeBoard3D(
  cols: number,
  rows: number,
  cells: MazeCell[]
): MazeBoardHandle {
  const group = new THREE.Group();
  const tileMeshes: THREE.Mesh[] = [];
  const starMeshes = new Map<string, THREE.Object3D>();
  const bridgeMeshes = new Map<string, THREE.Object3D[]>();
  const switchMeshes = new Map<string, THREE.Object3D>();

  const tileSpacing = 0.88;
  const cellToWorld = (x: number, y: number): THREE.Vector3 => {
    const wx = (x - (cols - 1) / 2) * tileSpacing;
    const wz = (y - (rows - 1) / 2) * tileSpacing;
    return new THREE.Vector3(wx, 0, wz);
  };

  const floorMatEven = new THREE.MeshStandardMaterial({ color: 0xbbf7d0, roughness: 0.78 });
  const floorMatOdd = new THREE.MeshStandardMaterial({ color: 0x86efac, roughness: 0.78 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.85 });
  const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.75 });
  const puddleMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.1 });
  const goalMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3, metalness: 0.25 });

  cells.forEach((cell) => {
    const pos = cellToWorld(cell.x, cell.y);

    if (cell.type === 'wall') {
      const bush = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.56, 0.78), hedgeMat);
      bush.position.set(pos.x, 0.28, pos.z);
      bush.castShadow = true;
      bush.receiveShadow = true;
      group.add(bush);

      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.34, 12, 10), wallMat);
      cap.position.set(pos.x, 0.54, pos.z);
      cap.scale.set(1.1, 0.45, 1.1);
      group.add(cap);
      return;
    }

    const tileMat =
      cell.type === 'puddle'
        ? puddleMat
        : cell.type === 'goal'
        ? goalMat
        : (cell.x + cell.y) % 2 === 0
        ? floorMatEven
        : floorMatOdd;

    const tile = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.14, 0.8), tileMat);
    tile.position.set(pos.x, 0.07, pos.z);
    tile.receiveShadow = true;
    tile.userData = { mazeX: cell.x, mazeY: cell.y };
    group.add(tile);
    tileMeshes.push(tile);

    if (cell.type === 'star') {
      const star = createStarMesh(0xfbbf24, 0.24);
      star.position.set(pos.x, 0.48, pos.z);
      group.add(star);
      starMeshes.set(`${cell.x},${cell.y}`, star);
    } else if (cell.type === 'switch' && cell.switchId) {
      const flower = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.32, 0.12, 12),
        new THREE.MeshStandardMaterial({
          color: cell.switchId === 'A' ? 0xf472b6 : 0xa78bfa,
          roughness: 0.4,
        })
      );
      flower.position.set(pos.x, 0.18, pos.z);
      group.add(flower);
      switchMeshes.set(cell.switchId, flower);
    } else if (cell.type === 'bridge' && cell.bridgeForSwitchId) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(0.78, 0.12, 0.78),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.55 })
      );
      plank.position.set(pos.x, -0.35, pos.z); // lowered until switch is pressed
      group.add(plank);
      const list = bridgeMeshes.get(cell.bridgeForSwitchId) ?? [];
      list.push(plank);
      bridgeMeshes.set(cell.bridgeForSwitchId, list);
    } else if (cell.type === 'beetle') {
      const beetle = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 14, 12),
        new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.4 })
      );
      beetle.scale.set(1.1, 0.75, 1.25);
      beetle.position.set(pos.x, 0.26, pos.z);
      group.add(beetle);
    } else if (cell.type === 'goal') {
      const arch = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.06, 10, 18, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.25, metalness: 0.3 })
      );
      arch.position.set(pos.x, 0.38, pos.z);
      group.add(arch);
    }
  });

  return { group, tileMeshes, starMeshes, bridgeMeshes, switchMeshes, cellToWorld };
}
