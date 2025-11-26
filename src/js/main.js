import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { state } from './state.js';
import { createCube } from './cube.js';
import { onInputStart, onInputMove, onInputEnd, onWheel, onWindowResize } from './interaction.js';
import { scrambleCube, solveCube, resetCube } from './solver.js';
import { initGDPR } from './gdpr.js';

function init() {
    initGDPR();
    const container = document.getElementById('canvas-container');

    state.scene = new THREE.Scene();

    const width = container.clientWidth;
    const height = container.clientHeight;

    state.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    state.camera.position.set(5, 4, 7);
    state.camera.lookAt(0, 0, 0);

    state.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    state.renderer.setSize(width, height);
    state.renderer.setPixelRatio(window.devicePixelRatio);
    state.renderer.physicallyCorrectLights = true;
    state.renderer.shadowMap.enabled = true;
    state.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    state.renderer.outputEncoding = THREE.sRGBEncoding;
    state.renderer.toneMapping = THREE.ReinhardToneMapping;
    state.renderer.toneMappingExposure = 2.5;
    container.appendChild(state.renderer.domElement);

    // --- Studio Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    state.scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(10, 20, 10);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    state.scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xeef4ff, 0.8);
    fillLight.position.set(-10, 5, -10);
    state.scene.add(fillLight);

    const rimLight = new THREE.SpotLight(0xffffff, 1.0);
    rimLight.position.set(0, 10, 0);
    state.scene.add(rimLight);

    createCube(state.dimension);

    // Listeners
    window.addEventListener('resize', onWindowResize, false);
    const canvas = state.renderer.domElement;

    // Mouse/Touch
    canvas.addEventListener('mousedown', onInputStart);
    canvas.addEventListener('mousemove', onInputMove);
    window.addEventListener('mouseup', onInputEnd);

    // Touch events
    canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) { e.preventDefault(); onInputStart(e); }
    }, { passive: false });
    canvas.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) { e.preventDefault(); onInputMove(e); }
    }, { passive: false });
    window.addEventListener('touchend', onInputEnd);

    // Zoom (Wheel)
    canvas.addEventListener('wheel', onWheel, { passive: false });

    // UI
    document.getElementById('cube-size').addEventListener('change', (e) => {
        state.dimension = parseInt(e.target.value);
        createCube(state.dimension);
    });
    document.getElementById('btn-scramble').addEventListener('click', scrambleCube);
    document.getElementById('btn-reset').addEventListener('click', resetCube);
    document.getElementById('btn-solve').addEventListener('click', solveCube);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    state.renderer.render(state.scene, state.camera);
}

// Start
init();
