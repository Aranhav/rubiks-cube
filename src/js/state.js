import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

export const state = {
    scene: null,
    camera: null,
    renderer: null,
    cubeGroup: null,
    allCubies: [],
    dimension: 3,
    isDragging: false,
    isRotatingLayer: false,
    startMouse: new THREE.Vector2(),
    moveHistory: [],
    isAnimating: false,
    actionTimeout: null,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(),
    intersectedCubie: null,
    intersectNormal: null,
    activeGroup: null,
    activeAxis: null,
    currentRotationAngle: 0,
    rotationPixelToAngleRatio: 0.01
};
