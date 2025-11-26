import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { state } from './state.js';
import { initiateLayerRotation, updateLayerRotation, snapLayer } from './solver.js';

export function onInputStart(event) {
    if (state.isAnimating) return;

    let clientX, clientY;
    if (event.changedTouches) {
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const canvas = state.renderer.domElement;
    const rect = canvas.getBoundingClientRect();

    state.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    state.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    state.raycaster.setFromCamera(state.mouse, state.camera);
    const meshes = [];
    state.allCubies.forEach(g => meshes.push(g.children[0]));

    const intersects = state.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
        state.isDragging = true;
        state.isRotatingLayer = false;
        state.intersectedCubie = intersects[0].object.userData.parentGroup;
        state.intersectNormal = intersects[0].face.normal.clone();
        state.intersectNormal.transformDirection(intersects[0].object.matrixWorld).round();
        state.startMouse.set(clientX, clientY);
    } else {
        state.isDragging = true;
        state.intersectedCubie = null;
        state.startMouse.set(clientX, clientY);
    }
}

export function onInputMove(event) {
    if (!state.isDragging) return;

    let clientX, clientY;
    if (event.changedTouches) {
        clientX = event.changedTouches[0].clientX;
        clientY = event.changedTouches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const deltaX = clientX - state.startMouse.x;
    const deltaY = clientY - state.startMouse.y;

    if (state.intersectedCubie) {
        if (!state.isRotatingLayer) {
            if (Math.abs(deltaX) > 8 || Math.abs(deltaY) > 8) {
                state.isRotatingLayer = true;
                initiateLayerRotation(deltaX, deltaY);
            }
        } else {
            updateLayerRotation(deltaX, deltaY);
        }
    } else {
        // Orbit Logic
        const rotSpeed = 0.003;
        const offset = state.camera.position.clone().sub(state.scene.position);
        let theta = Math.atan2(offset.x, offset.z);
        let phi = Math.acos(offset.y / offset.length());

        const dx = clientX - state.startMouse.x;
        const dy = clientY - state.startMouse.y;

        theta -= dx * rotSpeed;
        phi -= dy * rotSpeed;
        phi = Math.max(0.1, Math.min(Math.PI - 0.1, phi));
        const radius = offset.length();
        state.camera.position.x = radius * Math.sin(phi) * Math.sin(theta);
        state.camera.position.y = radius * Math.cos(phi);
        state.camera.position.z = radius * Math.sin(phi) * Math.cos(theta);
        state.camera.lookAt(state.scene.position);

        state.startMouse.set(clientX, clientY);
    }
}

export function onInputEnd() {
    if (state.isRotatingLayer && state.activeGroup) {
        snapLayer();
    }
    state.isDragging = false;
    state.isRotatingLayer = false;
    state.intersectedCubie = null;
}

export function onWheel(event) {
    event.preventDefault();

    // Calculate current distance
    const offset = state.camera.position.clone().sub(state.scene.position);
    let dist = offset.length();

    // Zoom sensitivity
    const zoomSpeed = 0.001;
    dist += event.deltaY * zoomSpeed * dist;

    // Clamp zoom
    dist = Math.max(2, Math.min(dist, 20));

    // Re-position camera maintaining direction
    offset.normalize().multiplyScalar(dist);
    state.camera.position.copy(state.scene.position).add(offset);
}

export function onWindowResize() {
    const container = document.getElementById('canvas-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    state.camera.aspect = width / height;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(width, height);
}
