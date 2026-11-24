import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { getWorldById } from '../data/worlds';
import { animateCharacterRig, buildCharacterRig, type CharacterRig } from '../three/characterBuilder';
import {
  buildMazeBoard3D,
  buildMiniPlanetDiorama,
  buildWorldIslandDiorama,
  type IslandSceneHandle,
  type MazeBoardHandle,
} from '../three/worldBuilder';
import type { CharacterAnimState, CharacterId, MazeCell, WorldId } from '../types/game';

export interface MazeRuntimeState {
  cols: number;
  rows: number;
  cells: MazeCell[];
  playerX: number;
  playerY: number;
  collectedStars: string[];
  activeSwitches: string[];
}

interface ThreeStageProps {
  mode: 'planet' | 'character' | 'island' | 'maze';
  characterId: CharacterId;
  worldId: WorldId;
  animState: CharacterAnimState;
  reducedMotion?: boolean;
  mazeState?: MazeRuntimeState;
  onMazeTileClick?: (x: number, y: number) => void;
  onCharacterTap?: () => void;
  className?: string;
}

const _rayMouse = new THREE.Vector2();
const _targetVec = new THREE.Vector3();

function detectSoftwareGl(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export const ThreeStage: React.FC<ThreeStageProps> = ({
  mode,
  characterId,
  worldId,
  animState,
  reducedMotion = false,
  mazeState,
  onMazeTileClick,
  onCharacterTap,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  // Keep latest props in refs so WebGL renderer stays mounted without flicker
  const propsRef = useRef({
    mode,
    characterId,
    worldId,
    animState,
    reducedMotion,
    mazeState,
    onMazeTileClick,
    onCharacterTap,
  });
  propsRef.current = {
    mode,
    characterId,
    worldId,
    animState,
    reducedMotion,
    mazeState,
    onMazeTileClick,
    onCharacterTap,
  };

  const sceneRefs = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    stageGroup: THREE.Group;
    characterRig: CharacterRig | null;
    islandHandle: IslandSceneHandle | null;
    mazeHandle: MazeBoardHandle | null;
    builtSignature: string;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareGl();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        powerPreference: 'high-performance',
        alpha: false,
      });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = Math.max(container.clientWidth, 300);
    const height = Math.max(container.clientHeight, 240);
    renderer.setSize(width, height);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const worldDef = getWorldById(propsRef.current.worldId);
    const bgCol = new THREE.Color(worldDef.skyBottom);
    scene.background = bgCol;
    scene.fog = new THREE.Fog(bgCol, 9, 22);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.set(0, 2.5, 6.2);
    camera.lookAt(0, 0.7, 0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    // Three-point warm/cool storybook lighting
    const hemi = new THREE.HemisphereLight(0xe0f2fe, 0xfef3c7, 0.85);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.45);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xc7d2fe, 0.65);
    rimLight.position.set(-4, 3, -5);
    scene.add(rimLight);

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    sceneRefs.current = {
      scene,
      camera,
      stageGroup,
      characterRig: null,
      islandHandle: null,
      mazeHandle: null,
      builtSignature: '',
    };

    const raycaster = new THREE.Raycaster();
    const onPointerDown = (ev: PointerEvent) => {
      const refs = sceneRefs.current;
      if (!refs) return;
      const rect = renderer.domElement.getBoundingClientRect();
      _rayMouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      _rayMouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(_rayMouse, camera);

      if (propsRef.current.mode === 'maze' && refs.mazeHandle && propsRef.current.onMazeTileClick) {
        const hits = raycaster.intersectObjects(refs.mazeHandle.tileMeshes, false);
        if (hits.length > 0) {
          const { mazeX, mazeY } = hits[0].object.userData as { mazeX?: number; mazeY?: number };
          if (typeof mazeX === 'number' && typeof mazeY === 'number') {
            propsRef.current.onMazeTileClick(mazeX, mazeY);
            return;
          }
        }
      }

      if (refs.characterRig && propsRef.current.onCharacterTap) {
        const hits = raycaster.intersectObject(refs.characterRig.root, true);
        if (hits.length > 0) {
          propsRef.current.onCharacterTap();
        }
      }
    };
    renderer.domElement.addEventListener('pointerdown', onPointerDown);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    const handleContextRestored = () => {
      setWebglFailed(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    const resizeObs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(entry.contentRect.width, 200);
        const h = Math.max(entry.contentRect.height, 200);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    });
    resizeObs.observe(container);

    const rebuildStageIfNeeded = () => {
      const refs = sceneRefs.current;
      if (!refs) return;
      const { mode: curMode, characterId: curChar, worldId: curWorld, mazeState: curMaze } = propsRef.current;
      const mazeSig = curMode === 'maze' && curMaze ? `${curMaze.cols}x${curMaze.rows}-${curMaze.cells.length}` : '';
      const sig = `${curMode}|${curChar}|${curWorld}|${mazeSig}`;
      if (refs.builtSignature === sig) return;
      refs.builtSignature = sig;

      // Clear previous stage objects
      while (refs.stageGroup.children.length > 0) {
        const child = refs.stageGroup.children[0];
        refs.stageGroup.remove(child);
      }
      refs.characterRig = null;
      refs.islandHandle = null;
      refs.mazeHandle = null;

      const wDef = getWorldById(curWorld);
      const nextBg = new THREE.Color(wDef.skyBottom);
      refs.scene.background = nextBg;
      if (refs.scene.fog instanceof THREE.Fog) {
        refs.scene.fog.color.copy(nextBg);
      }

      if (curMode === 'planet') {
        const planet = buildMiniPlanetDiorama();
        planet.group.position.set(0, 0.25, -0.3);
        refs.stageGroup.add(planet.group);
        refs.islandHandle = planet;

        const rig = buildCharacterRig(curChar);
        rig.root.position.set(0, 1.82, 0.25);
        rig.root.scale.setScalar(0.75);
        refs.stageGroup.add(rig.root);
        refs.characterRig = rig;
      } else if (curMode === 'character') {
        const pedestal = new THREE.Mesh(
          new THREE.CylinderGeometry(1.35, 1.5, 0.35, 28),
          new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 })
        );
        pedestal.position.y = -0.175;
        pedestal.receiveShadow = true;
        refs.stageGroup.add(pedestal);

        const rig = buildCharacterRig(curChar);
        rig.root.scale.setScalar(1.22);
        refs.stageGroup.add(rig.root);
        refs.characterRig = rig;
      } else if (curMode === 'maze' && curMaze) {
        const board = buildMazeBoard3D(curMaze.cols, curMaze.rows, curMaze.cells);
        refs.stageGroup.add(board.group);
        refs.mazeHandle = board;

        const rig = buildCharacterRig(curChar);
        rig.root.scale.setScalar(0.55);
        const startPos = board.cellToWorld(curMaze.playerX, curMaze.playerY);
        rig.root.position.set(startPos.x, 0.14, startPos.z);
        refs.stageGroup.add(rig.root);
        refs.characterRig = rig;
      } else {
        const island = buildWorldIslandDiorama(curWorld);
        refs.stageGroup.add(island.group);
        refs.islandHandle = island;

        const rig = buildCharacterRig(curChar);
        rig.root.position.set(0, 0, 0.4);
        rig.root.scale.setScalar(1.05);
        refs.stageGroup.add(rig.root);
        refs.characterRig = rig;
      }
    };

    rebuildStageIfNeeded();
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (!sync) {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      gl.flush();
      const poll = () => {
        if (disposed) return;
        const status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      rebuildStageIfNeeded();

      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = propsRef.current.reducedMotion ? 0.2 : clock.getElapsedTime();
      const refs = sceneRefs.current;
      const { mode: curMode, animState: curAnim, mazeState: curMaze } = propsRef.current;

      if (refs) {
        // Smooth camera framing per mode
        if (curMode === 'planet') {
          _targetVec.set(0, 1.8, 6.4);
          camera.position.lerp(_targetVec, 1 - Math.exp(-5 * delta));
          camera.lookAt(0, 0.85, 0);
          if (refs.islandHandle && !propsRef.current.reducedMotion) {
            refs.islandHandle.group.rotation.y = elapsed * 0.22;
          }
        } else if (curMode === 'character') {
          _targetVec.set(0, 1.4, 3.9);
          camera.position.lerp(_targetVec, 1 - Math.exp(-6 * delta));
          camera.lookAt(0, 0.72, 0);
        } else if (curMode === 'maze' && curMaze) {
          const dist = Math.max(curMaze.cols, curMaze.rows) * 1.15;
          _targetVec.set(0, dist * 0.95, dist * 0.75);
          camera.position.lerp(_targetVec, 1 - Math.exp(-6 * delta));
          camera.lookAt(0, 0, 0);
        } else {
          _targetVec.set(0, 2.05, 5.4);
          camera.position.lerp(_targetVec, 1 - Math.exp(-6 * delta));
          camera.lookAt(0, 0.75, 0);
        }

        // Character animation
        if (refs.characterRig) {
          animateCharacterRig(refs.characterRig, curAnim, elapsed);
          if (curMode === 'character' && !propsRef.current.reducedMotion) {
            refs.characterRig.root.rotation.y = Math.sin(elapsed * 0.7) * 0.35;
          }
        }

        // Diorama prop animations
        if (refs.islandHandle && !propsRef.current.reducedMotion) {
          refs.islandHandle.animatedProps.forEach((prop, i) => {
            if (prop.userData.spinAxis === 'z') {
              prop.rotation.z = elapsed * (i % 2 === 0 ? 0.8 : -0.8);
            } else {
              prop.rotation.y = elapsed * 1.1 + i;
            }
          });
        }

        // Maze dynamic updates (character glide, stars collected, bridges rising)
        if (curMode === 'maze' && refs.mazeHandle && curMaze && refs.characterRig) {
          const target = refs.mazeHandle.cellToWorld(curMaze.playerX, curMaze.playerY);
          target.y = 0.14;
          refs.characterRig.root.position.lerp(target, 1 - Math.exp(-12 * delta));

          refs.mazeHandle.starMeshes.forEach((starObj, key) => {
            const isCollected = curMaze.collectedStars.includes(key);
            starObj.visible = !isCollected;
            if (!isCollected && !propsRef.current.reducedMotion) {
              starObj.rotation.y = elapsed * 2.2;
              starObj.position.y = 0.48 + Math.sin(elapsed * 3) * 0.06;
            }
          });

          refs.mazeHandle.bridgeMeshes.forEach((planks, swId) => {
            const raised = curMaze.activeSwitches.includes(swId);
            const targetY = raised ? 0.08 : -0.4;
            planks.forEach((plank) => {
              plank.position.y = THREE.MathUtils.damp(plank.position.y, targetY, 8, delta);
            });
          });
        }
      }

      renderer.render(scene, camera);
      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObs.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      renderer.dispose();
    };
  }, []);

  if (webglFailed) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-amber-50 p-6 text-center ${className}`}>
        <div className="text-5xl mb-2">🪐</div>
        <p className="font-display text-lg font-semibold text-slate-700">WonderWiggles 3D Diorama</p>
        <p className="text-sm text-slate-500 max-w-xs mt-1">
          Interactive puzzle controls remain ready below even when 3D hardware acceleration is paused.
        </p>
      </div>
    );
  }

  return <div ref={mountRef} className={`w-full h-full select-none touch-none ${className}`} />;
};
