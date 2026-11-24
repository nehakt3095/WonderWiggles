import * as THREE from 'three';
import { getCharacterById } from '../data/characters';
import type { CharacterAnimState, CharacterId } from '../types/game';

export interface CharacterRig {
  root: THREE.Group;
  bodyGroup: THREE.Group;
  leftArm: THREE.Object3D;
  rightArm: THREE.Object3D;
  leftLeg: THREE.Object3D;
  rightLeg: THREE.Object3D;
  headGroup: THREE.Object3D;
  accessory?: THREE.Object3D;
  shadowPlane: THREE.Mesh;
}

function createStarShape(outerR: number, innerR: number, points = 5): THREE.Shape {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / points - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function createContactShadow(radius = 0.72): THREE.Mesh {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(64, 64, 8, 64, 64, 60);
    grad.addColorStop(0, 'rgba(30, 41, 59, 0.38)');
    grad.addColorStop(0.6, 'rgba(30, 41, 59, 0.14)');
    grad.addColorStop(1, 'rgba(30, 41, 59, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(radius * 2, radius * 2), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = 0.02;
  return mesh;
}

function addFacialFeatures(
  headGroup: THREE.Group,
  zOffset: number,
  yOffset: number,
  eyeSpacing = 0.22
): void {
  const eyeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.12, metalness: 0.1 });
  const glintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const cheekMat = new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.85 });

  [-1, 1].forEach((side) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.085, 16, 16), eyeMat);
    eye.position.set(side * eyeSpacing, yOffset, zOffset);
    eye.scale.set(1, 1.15, 0.75);
    headGroup.add(eye);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), glintMat);
    glint.position.set(side * eyeSpacing + 0.025, yOffset + 0.03, zOffset + 0.055);
    headGroup.add(glint);

    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), cheekMat);
    cheek.position.set(side * (eyeSpacing + 0.13), yOffset - 0.1, zOffset - 0.04);
    cheek.scale.set(1.2, 0.75, 0.5);
    headGroup.add(cheek);
  });

  // Gentle curved smile using torus segment
  const smileGeo = new THREE.TorusGeometry(0.11, 0.022, 10, 20, Math.PI * 0.8);
  const smile = new THREE.Mesh(smileGeo, eyeMat);
  smile.position.set(0, yOffset - 0.08, zOffset - 0.02);
  smile.rotation.z = Math.PI * 1.1;
  headGroup.add(smile);
}

export function buildCharacterRig(characterId: CharacterId): CharacterRig {
  const def = getCharacterById(characterId);
  const root = new THREE.Group();
  const bodyGroup = new THREE.Group();
  const headGroup = new THREE.Group();
  root.add(bodyGroup);

  const shadowPlane = createContactShadow(0.75);
  root.add(shadowPlane);

  const primaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(def.primaryColor),
    roughness: 0.55,
    metalness: 0.05,
  });
  const secondaryMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(def.secondaryColor),
    roughness: 0.75,
    metalness: 0.02,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(def.accentColor),
    roughness: 0.3,
    metalness: 0.18,
  });

  let leftArm: THREE.Object3D = new THREE.Group();
  let rightArm: THREE.Object3D = new THREE.Group();
  let leftLeg: THREE.Object3D = new THREE.Group();
  let rightLeg: THREE.Object3D = new THREE.Group();
  let accessory: THREE.Object3D | undefined;

  if (characterId === 'wobble') {
    // Plump rounded torso (bottom-center grounded via feet at y=0)
    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 20), primaryMat);
    torso.scale.set(1.05, 1.12, 0.95);
    torso.position.y = 0.74;
    torso.castShadow = true;
    bodyGroup.add(torso);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), secondaryMat);
    belly.position.set(0, 0.65, 0.34);
    belly.scale.set(1, 1.05, 0.55);
    bodyGroup.add(belly);

    headGroup.position.set(0, 0.92, 0);
    bodyGroup.add(headGroup);
    addFacialFeatures(headGroup, 0.5, 0.02, 0.21);

    // Cute bouncy antenna sprouts
    [-1, 1].forEach((side) => {
      const stalk = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.25, 10), accentMat);
      stalk.position.set(side * 0.18, 0.48, 0);
      stalk.rotation.z = -side * 0.28;
      headGroup.add(stalk);

      const bob = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), accentMat);
      bob.position.set(side * 0.24, 0.61, 0);
      headGroup.add(bob);
    });
    accessory = headGroup;

    // Arms
    const armGeo = new THREE.CapsuleGeometry(0.11, 0.22, 6, 12);
    leftArm = new THREE.Mesh(armGeo, primaryMat);
    leftArm.position.set(-0.6, 0.76, 0.05);
    leftArm.rotation.z = 0.55;
    leftArm.castShadow = true;
    bodyGroup.add(leftArm);

    rightArm = new THREE.Mesh(armGeo, primaryMat);
    rightArm.position.set(0.6, 0.76, 0.05);
    rightArm.rotation.z = -0.55;
    rightArm.castShadow = true;
    bodyGroup.add(rightArm);

    // Feet grounded at y=0
    const footGeo = new THREE.SphereGeometry(0.18, 16, 12);
    leftLeg = new THREE.Mesh(footGeo, accentMat);
    leftLeg.scale.set(1, 0.72, 1.35);
    leftLeg.position.set(-0.24, 0.13, 0.08);
    leftLeg.castShadow = true;
    bodyGroup.add(leftLeg);

    rightLeg = new THREE.Mesh(footGeo, accentMat);
    rightLeg.scale.set(1, 0.72, 1.35);
    rightLeg.position.set(0.24, 0.13, 0.08);
    rightLeg.castShadow = true;
    bodyGroup.add(rightLeg);
  } else if (characterId === 'twinkle') {
    // Extruded beveled 5-point star body
    const starShape = createStarShape(0.66, 0.34, 5);
    const starGeo = new THREE.ExtrudeGeometry(starShape, {
      depth: 0.26,
      bevelEnabled: true,
      bevelThickness: 0.1,
      bevelSize: 0.08,
      bevelSegments: 4,
    });
    starGeo.center();
    const starMesh = new THREE.Mesh(starGeo, primaryMat);
    starMesh.position.y = 0.88;
    starMesh.castShadow = true;
    bodyGroup.add(starMesh);

    // Cozy ribbon collar
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.07, 10, 24), accentMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.52, 0);
    bodyGroup.add(collar);

    // Floating halo crown
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.045, 10, 24), secondaryMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 1.66, 0);
    bodyGroup.add(halo);
    accessory = halo;

    headGroup.position.set(0, 0.92, 0);
    bodyGroup.add(headGroup);
    addFacialFeatures(headGroup, 0.22, 0.02, 0.17);

    const wingGeo = new THREE.SphereGeometry(0.13, 12, 12);
    leftArm = new THREE.Mesh(wingGeo, secondaryMat);
    leftArm.scale.set(1.4, 0.65, 0.6);
    leftArm.position.set(-0.58, 0.76, 0);
    bodyGroup.add(leftArm);

    rightArm = new THREE.Mesh(wingGeo, secondaryMat);
    rightArm.scale.set(1.4, 0.65, 0.6);
    rightArm.position.set(0.58, 0.76, 0);
    bodyGroup.add(rightArm);

    const bootGeo = new THREE.SphereGeometry(0.14, 12, 12);
    leftLeg = new THREE.Mesh(bootGeo, accentMat);
    leftLeg.position.set(-0.22, 0.14, 0.04);
    bodyGroup.add(leftLeg);

    rightLeg = new THREE.Mesh(bootGeo, accentMat);
    rightLeg.position.set(0.22, 0.14, 0.04);
    bodyGroup.add(rightLeg);
  } else if (characterId === 'bubbles') {
    // Aqua droplet body + crest fin
    const torso = new THREE.Mesh(new THREE.SphereGeometry(0.52, 24, 20), primaryMat);
    torso.position.y = 0.72;
    torso.scale.set(1.08, 1.0, 1.0);
    torso.castShadow = true;
    bodyGroup.add(torso);

    const tummy = new THREE.Mesh(new THREE.SphereGeometry(0.36, 18, 14), secondaryMat);
    tummy.position.set(0, 0.64, 0.31);
    tummy.scale.set(1, 0.95, 0.5);
    bodyGroup.add(tummy);

    // Droplet crest + tail fin
    const crest = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.34, 14), accentMat);
    crest.position.set(0, 1.32, -0.04);
    crest.rotation.x = -0.25;
    bodyGroup.add(crest);
    accessory = crest;

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.38, 12), accentMat);
    tail.position.set(0, 0.55, -0.58);
    tail.rotation.x = -Math.PI / 2.2;
    bodyGroup.add(tail);

    headGroup.position.set(0, 0.88, 0);
    bodyGroup.add(headGroup);
    addFacialFeatures(headGroup, 0.49, 0.0, 0.2);

    const finGeo = new THREE.SphereGeometry(0.15, 14, 12);
    leftArm = new THREE.Mesh(finGeo, secondaryMat);
    leftArm.scale.set(1.4, 0.55, 0.8);
    leftArm.position.set(-0.56, 0.72, 0.05);
    bodyGroup.add(leftArm);

    rightArm = new THREE.Mesh(finGeo, secondaryMat);
    rightArm.scale.set(1.4, 0.55, 0.8);
    rightArm.position.set(0.56, 0.72, 0.05);
    bodyGroup.add(rightArm);

    const flipperGeo = new THREE.SphereGeometry(0.17, 14, 12);
    leftLeg = new THREE.Mesh(flipperGeo, accentMat);
    leftLeg.scale.set(1.1, 0.55, 1.4);
    leftLeg.position.set(-0.23, 0.1, 0.1);
    bodyGroup.add(leftLeg);

    rightLeg = new THREE.Mesh(flipperGeo, accentMat);
    rightLeg.scale.set(1.1, 0.55, 1.4);
    rightLeg.position.set(0.23, 0.1, 0.1);
    bodyGroup.add(rightLeg);
  } else if (characterId === 'coco') {
    // Cozy woodland critter with round ears & fluffy tail
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.32, 8, 18), primaryMat);
    torso.position.y = 0.72;
    torso.castShadow = true;
    bodyGroup.add(torso);

    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 14), secondaryMat);
    chest.position.set(0, 0.68, 0.28);
    chest.scale.set(0.95, 1.0, 0.5);
    bodyGroup.add(chest);

    headGroup.position.set(0, 1.0, 0);
    bodyGroup.add(headGroup);
    const headBall = new THREE.Mesh(new THREE.SphereGeometry(0.4, 20, 18), primaryMat);
    headBall.castShadow = true;
    headGroup.add(headBall);

    // Round woodland ears
    [-1, 1].forEach((side) => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 12), primaryMat);
      ear.position.set(side * 0.29, 0.33, 0);
      headGroup.add(ear);
      const inner = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 10), secondaryMat);
      inner.position.set(side * 0.29, 0.33, 0.08);
      headGroup.add(inner);
    });

    // Little leaf beret
    const leafCap = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 12), accentMat);
    leafCap.position.set(0.06, 0.45, 0.04);
    leafCap.rotation.z = -0.35;
    headGroup.add(leafCap);
    accessory = leafCap;

    addFacialFeatures(headGroup, 0.38, -0.02, 0.16);

    // Fluffy tail
    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 14), secondaryMat);
    tail.position.set(0, 0.48, -0.45);
    tail.scale.set(0.9, 1.25, 1.15);
    bodyGroup.add(tail);

    const pawGeo = new THREE.CapsuleGeometry(0.1, 0.2, 6, 12);
    leftArm = new THREE.Mesh(pawGeo, primaryMat);
    leftArm.position.set(-0.48, 0.72, 0.08);
    leftArm.rotation.z = 0.45;
    bodyGroup.add(leftArm);

    rightArm = new THREE.Mesh(pawGeo, primaryMat);
    rightArm.position.set(0.48, 0.72, 0.08);
    rightArm.rotation.z = -0.45;
    bodyGroup.add(rightArm);

    const footGeo = new THREE.SphereGeometry(0.16, 14, 12);
    leftLeg = new THREE.Mesh(footGeo, accentMat);
    leftLeg.scale.set(1, 0.7, 1.3);
    leftLeg.position.set(-0.2, 0.12, 0.08);
    bodyGroup.add(leftLeg);

    rightLeg = new THREE.Mesh(footGeo, accentMat);
    rightLeg.scale.set(1, 0.7, 1.3);
    rightLeg.position.set(0.2, 0.12, 0.08);
    bodyGroup.add(rightLeg);
  } else {
    // Pip: Tiny cheerful winged flying companion
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.44, 22, 18), primaryMat);
    body.scale.set(1.0, 1.12, 0.96);
    body.position.y = 0.74;
    body.castShadow = true;
    bodyGroup.add(body);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.31, 16, 14), secondaryMat);
    belly.position.set(0, 0.66, 0.26);
    belly.scale.set(0.95, 1.0, 0.55);
    bodyGroup.add(belly);

    headGroup.position.set(0, 0.88, 0);
    bodyGroup.add(headGroup);
    addFacialFeatures(headGroup, 0.42, 0.05, 0.16);

    // Cute tiny beak
    const beak = new THREE.Mesh(
      new THREE.ConeGeometry(0.08, 0.16, 12),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.4 })
    );
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, 0.0, 0.48);
    headGroup.add(beak);

    // Head tuft feather
    const crest = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 12), accentMat);
    crest.scale.set(0.7, 1.5, 0.7);
    crest.position.set(0, 0.42, 0.04);
    headGroup.add(crest);
    accessory = crest;

    // Flapping wings
    const wingGeo = new THREE.SphereGeometry(0.2, 14, 12);
    leftArm = new THREE.Mesh(wingGeo, secondaryMat);
    leftArm.scale.set(1.5, 0.55, 0.9);
    leftArm.position.set(-0.52, 0.8, 0);
    bodyGroup.add(leftArm);

    rightArm = new THREE.Mesh(wingGeo, secondaryMat);
    rightArm.scale.set(1.5, 0.55, 0.9);
    rightArm.position.set(0.52, 0.8, 0);
    bodyGroup.add(rightArm);

    const footGeo = new THREE.SphereGeometry(0.13, 12, 12);
    leftLeg = new THREE.Mesh(footGeo, accentMat);
    leftLeg.scale.set(1.1, 0.6, 1.4);
    leftLeg.position.set(-0.18, 0.1, 0.08);
    bodyGroup.add(leftLeg);

    rightLeg = new THREE.Mesh(footGeo, accentMat);
    rightLeg.scale.set(1.1, 0.6, 1.4);
    rightLeg.position.set(0.18, 0.1, 0.08);
    bodyGroup.add(rightLeg);
  }

  return {
    root,
    bodyGroup,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    headGroup,
    accessory,
    shadowPlane,
  };
}

export function animateCharacterRig(
  rig: CharacterRig,
  state: CharacterAnimState,
  elapsed: number
): void {
  // Reset baseline smoothly
  let bobY = Math.sin(elapsed * 2.6) * 0.04;
  let tiltZ = Math.sin(elapsed * 1.4) * 0.03;
  let rotY = 0;

  if (state === 'idle') {
    rig.leftArm.rotation.z = 0.5 + Math.sin(elapsed * 2.2) * 0.08;
    rig.rightArm.rotation.z = -0.5 - Math.sin(elapsed * 2.2) * 0.08;
    rig.leftLeg.position.y = 0.12;
    rig.rightLeg.position.y = 0.12;
  } else if (state === 'wave') {
    bobY = Math.abs(Math.sin(elapsed * 4.5)) * 0.08;
    rig.rightArm.rotation.z = -2.2 + Math.sin(elapsed * 10) * 0.45;
    rig.leftArm.rotation.z = 0.45;
    tiltZ = Math.sin(elapsed * 4.5) * 0.07;
  } else if (state === 'walk') {
    bobY = Math.abs(Math.sin(elapsed * 10)) * 0.12;
    rig.leftLeg.position.z = 0.08 + Math.sin(elapsed * 10) * 0.12;
    rig.rightLeg.position.z = 0.08 - Math.sin(elapsed * 10) * 0.12;
    rig.leftArm.rotation.z = 0.4 + Math.sin(elapsed * 10) * 0.35;
    rig.rightArm.rotation.z = -0.4 + Math.sin(elapsed * 10) * 0.35;
    tiltZ = Math.cos(elapsed * 10) * 0.06;
  } else if (state === 'jump') {
    bobY = Math.abs(Math.sin(elapsed * 6.5)) * 0.48;
    rig.leftArm.rotation.z = 1.6;
    rig.rightArm.rotation.z = -1.6;
  } else if (state === 'celebrate') {
    bobY = Math.abs(Math.sin(elapsed * 7.5)) * 0.36;
    rotY = Math.sin(elapsed * 3.5) * 0.45;
    rig.leftArm.rotation.z = 2.0 + Math.sin(elapsed * 12) * 0.3;
    rig.rightArm.rotation.z = -2.0 - Math.sin(elapsed * 12) * 0.3;
  } else if (state === 'oops') {
    // Friendly encouraging head-tilt wobble
    tiltZ = Math.sin(elapsed * 8) * 0.14;
    bobY = Math.sin(elapsed * 4) * 0.03;
    rig.leftArm.rotation.z = 0.7;
    rig.rightArm.rotation.z = -0.7;
  }

  rig.bodyGroup.position.y = bobY;
  rig.bodyGroup.rotation.z = tiltZ;
  rig.bodyGroup.rotation.y = rotY;
  const shadowScale = Math.max(0.65, 1 - bobY * 0.45);
  rig.shadowPlane.scale.set(shadowScale, shadowScale, 1);
}
