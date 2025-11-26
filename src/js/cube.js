import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { CONFIG } from './config.js';
import { state } from './state.js';
import { updateUI, showFeedback } from './utils.js';

function createCubeGeometry(n) {
    const shape = new THREE.Shape();
    // Slightly adjust size based on n to reduce gaps for smaller cubes
    const size = 0.98;
    const r = 0.06; // Sharper corners
    const w = size; const h = size;
    const x = -w / 2; const y = -h / 2;

    shape.moveTo(x + r, y);
    shape.lineTo(x + w - r, y);
    shape.quadraticCurveTo(x + w, y, x + w, y + r);
    shape.lineTo(x + w, y + h - r);
    shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    shape.lineTo(x + r, y + h);
    shape.quadraticCurveTo(x, y + h, x, y + h - r);
    shape.lineTo(x, y + r);
    shape.quadraticCurveTo(x, y, x + r, y);

    const extrudeSettings = {
        steps: 1,
        depth: size - (0.005 * 2), // Tighter depth
        bevelEnabled: true,
        bevelThickness: 0.015, // Reduced bevel
        bevelSize: 0.015,
        bevelSegments: 4 // Smoother bevel
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();
    return geometry;
}

export function createCube(n) {
    // 1. Stop any running animations/logic
    if (state.actionTimeout) clearTimeout(state.actionTimeout);
    state.isAnimating = false;
    if (state.activeGroup) {
        state.scene.remove(state.activeGroup);
        state.activeGroup = null;
    }
    state.activeAxis = null;

    if (state.cubeGroup) state.scene.remove(state.cubeGroup);

    state.cubeGroup = new THREE.Group();
    state.allCubies = [];
    state.moveHistory = []; // Reset history
    updateUI();

    const offset = (n - 1) / 2;
    const geometry = createCubeGeometry(n);

    const stickerShape = new THREE.Shape();
    // Larger stickers for fuller look
    const sSize = 0.88;
    const sR = 0.08; // Slightly more rounded stickers
    const sx = -sSize / 2; const sy = -sSize / 2;
    stickerShape.moveTo(sx + sR, sy);
    stickerShape.lineTo(sx + sSize - sR, sy);
    stickerShape.quadraticCurveTo(sx + sSize, sy, sx + sSize, sy + sR);
    stickerShape.lineTo(sx + sSize, sy + sSize - sR);
    stickerShape.quadraticCurveTo(sx + sSize, sy + sSize, sx + sSize - sR, sy + sSize);
    stickerShape.lineTo(sx + sR, sy + sSize);
    stickerShape.quadraticCurveTo(sx, sy + sSize, sx, sy + sSize - sR);
    stickerShape.lineTo(sx, sy + sR);
    stickerShape.quadraticCurveTo(sx, sy, sx + sR, sy);

    const stickerGeo = new THREE.ShapeGeometry(stickerShape);

    const plasticMat = new THREE.MeshStandardMaterial({
        color: CONFIG.colors.Core,
        roughness: 0.6, // More matte plastic
        metalness: 0.1,
    });

    for (let x = 0; x < n; x++) {
        for (let y = 0; y < n; y++) {
            for (let z = 0; z < n; z++) {
                const group = new THREE.Group();
                group.position.set(x - offset, y - offset, z - offset);

                const body = new THREE.Mesh(geometry, plasticMat);
                body.castShadow = true;
                body.receiveShadow = true;
                group.add(body);

                const addSticker = (color, rotX, rotY, posX, posY, posZ) => {
                    const mat = new THREE.MeshStandardMaterial({
                        color: color,
                        roughness: 0.15, // Glossy stickers
                        metalness: 0.0,
                        polygonOffset: true,
                        polygonOffsetFactor: -2
                    });
                    const mesh = new THREE.Mesh(stickerGeo, mat);
                    mesh.rotation.set(rotX, rotY, 0);
                    mesh.position.set(posX, posY, posZ);
                    group.add(mesh);
                };

                const dist = 0.505; // Tighter fit

                if (x === n - 1) addSticker(CONFIG.colors.R, 0, Math.PI / 2, dist, 0, 0);
                if (x === 0) addSticker(CONFIG.colors.L, 0, -Math.PI / 2, -dist, 0, 0);
                if (y === n - 1) addSticker(CONFIG.colors.U, -Math.PI / 2, 0, 0, dist, 0);
                if (y === 0) addSticker(CONFIG.colors.D, Math.PI / 2, 0, 0, -dist, 0);
                if (z === n - 1) addSticker(CONFIG.colors.F, 0, 0, 0, 0, dist);
                if (z === 0) addSticker(CONFIG.colors.B, 0, Math.PI, 0, 0, -dist);

                body.userData = { parentGroup: group };
                group.userData = {
                    x: x - offset,
                    y: y - offset,
                    z: z - offset
                };

                state.cubeGroup.add(group);
                state.allCubies.push(group);
            }
        }
    }
    state.scene.add(state.cubeGroup);

    // Adjust camera distance based on n for consistent framing
    let camDist = n * 2.5 + 4;
    if (n === 2) camDist = 8;
    if (n === 4) camDist = 14;
    if (n === 5) camDist = 17;

    state.camera.position.setLength(camDist);
    showFeedback("");
}
