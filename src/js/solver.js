import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';
import { CONFIG } from './config.js';
import { state } from './state.js';
import { updateUI, showFeedback } from './utils.js';
import { createCube } from './cube.js';

export function initiateLayerRotation(dx, dy) {
    const potentialAxes = [];
    if (Math.abs(state.intersectNormal.x) < 0.1) potentialAxes.push(new THREE.Vector3(1, 0, 0));
    if (Math.abs(state.intersectNormal.y) < 0.1) potentialAxes.push(new THREE.Vector3(0, 1, 0));
    if (Math.abs(state.intersectNormal.z) < 0.1) potentialAxes.push(new THREE.Vector3(0, 0, 1));

    let matchedAxis = null;
    let maxDot = -1;

    const mouseVec = new THREE.Vector2(dx, -dy).normalize();

    potentialAxes.forEach(axis => {
        const p1 = state.intersectedCubie.position.clone().project(state.camera);
        const p2 = state.intersectedCubie.position.clone().add(axis).project(state.camera);
        const screenVec = new THREE.Vector2(p2.x - p1.x, p2.y - p1.y).normalize();

        const dot = Math.abs(screenVec.dot(mouseVec));
        if (dot > maxDot) {
            maxDot = dot;
            matchedAxis = axis;
        }
    });

    state.activeAxis = potentialAxes.find(a => !a.equals(matchedAxis));
    if (!state.activeAxis) state.activeAxis = potentialAxes[0];

    state.activeGroup = new THREE.Group();
    state.scene.add(state.activeGroup);
    state.activeGroup.rotation.set(0, 0, 0);

    state.currentRotationAngle = 0;

    const epsilon = 0.1;
    const pos = state.intersectedCubie.position;

    const cubiesToRotate = state.allCubies.filter(c => {
        if (Math.abs(state.activeAxis.x) > 0.5) return Math.abs(c.position.x - pos.x) < epsilon;
        if (Math.abs(state.activeAxis.y) > 0.5) return Math.abs(c.position.y - pos.y) < epsilon;
        if (Math.abs(state.activeAxis.z) > 0.5) return Math.abs(c.position.z - pos.z) < epsilon;
    });

    cubiesToRotate.forEach(c => {
        state.activeGroup.attach(c);
    });
}

export function updateLayerRotation(dx, dy) {
    if (!state.activeGroup || !state.activeAxis) return;

    const hitVec = state.intersectedCubie.position.clone();
    const moveDir3D = new THREE.Vector3().crossVectors(state.activeAxis, hitVec).normalize();

    const p1 = state.intersectedCubie.position.clone().project(state.camera);
    const p2 = state.intersectedCubie.position.clone().add(moveDir3D).project(state.camera);
    const screenDir = new THREE.Vector2(p2.x - p1.x, p2.y - p1.y);

    const mouseVec = new THREE.Vector2(dx, -dy);
    const projectedDist = mouseVec.dot(screenDir.normalize());

    state.currentRotationAngle = projectedDist * state.rotationPixelToAngleRatio;

    state.activeGroup.rotation.set(0, 0, 0);
    state.activeGroup.rotateOnWorldAxis(state.activeAxis, state.currentRotationAngle);
}

export function snapLayer() {
    const segment = Math.PI / 2;
    const snappedAngle = Math.round(state.currentRotationAngle / segment) * segment;

    state.isAnimating = true;
    const startRot = state.currentRotationAngle;
    const endRot = snappedAngle;

    let progress = 0;
    const duration = 300;
    const startTime = performance.now();

    function animateSnap(time) {
        const elapsed = time - startTime;
        progress = Math.min(elapsed / duration, 1);
        const ease = 1 - (1 - progress) * (1 - progress);

        const cur = startRot + (endRot - startRot) * ease;
        state.activeGroup.rotation.set(0, 0, 0);
        state.activeGroup.rotateOnWorldAxis(state.activeAxis, cur);

        if (progress < 1) {
            requestAnimationFrame(animateSnap);
        } else {
            finishRotation(snappedAngle);
        }
    }
    requestAnimationFrame(animateSnap);
}

export function finishRotation(angle) {
    state.isAnimating = false;
    state.currentRotationAngle = 0;

    const children = [...state.activeGroup.children];
    children.forEach(c => {
        state.scene.attach(c);
        c.position.x = Math.round(c.position.x);
        c.position.y = Math.round(c.position.y);
        c.position.z = Math.round(c.position.z);
        c.rotation.x = Math.round(c.rotation.x / (Math.PI / 2)) * (Math.PI / 2);
        c.rotation.y = Math.round(c.rotation.y / (Math.PI / 2)) * (Math.PI / 2);
        c.rotation.z = Math.round(c.rotation.z / (Math.PI / 2)) * (Math.PI / 2);
        c.updateMatrixWorld();
    });

    state.scene.remove(state.activeGroup);
    state.activeGroup = null;

    if (Math.abs(angle) > 0.1) {
        const turns = Math.round(angle / (Math.PI / 2));
        let sliceVal = 0;
        if (state.activeAxis.x) sliceVal = children[0].position.x;
        if (state.activeAxis.y) sliceVal = children[0].position.y;
        if (state.activeAxis.z) sliceVal = children[0].position.z;

        state.moveHistory.push({
            axis: state.activeAxis.clone(),
            slice: Math.round(sliceVal),
            turns: turns
        });
        updateUI();
    }
    state.activeAxis = null;
}

export function performMove(axis, slice, turns, animate = true) {
    if (state.isAnimating) return;
    state.isAnimating = true;

    state.activeAxis = axis;

    state.activeGroup = new THREE.Group();
    state.scene.add(state.activeGroup);

    const epsilon = 0.1;
    const cubiesToRotate = state.allCubies.filter(c => {
        if (Math.abs(axis.x) > 0.5) return Math.abs(c.position.x - slice) < epsilon;
        if (Math.abs(axis.y) > 0.5) return Math.abs(c.position.y - slice) < epsilon;
        if (Math.abs(axis.z) > 0.5) return Math.abs(c.position.z - slice) < epsilon;
    });

    cubiesToRotate.forEach(c => state.activeGroup.attach(c));

    const targetAngle = turns * (Math.PI / 2);

    if (!animate) {
        state.activeGroup.rotateOnWorldAxis(axis, targetAngle);
        finishRotation(targetAngle);
        return;
    }

    let progress = 0;
    const duration = CONFIG.animationSpeed * 1000;
    const startTime = performance.now();

    function loop(time) {
        const elapsed = time - startTime;
        progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);

        state.activeGroup.rotation.set(0, 0, 0);
        state.activeGroup.rotateOnWorldAxis(axis, targetAngle * ease);

        if (progress < 1) {
            requestAnimationFrame(loop);
        } else {
            finishRotation(targetAngle);
        }
    }
    requestAnimationFrame(loop);
}

export function scrambleCube() {
    if (state.isAnimating) return;

    if (state.actionTimeout) clearTimeout(state.actionTimeout);

    const moves = 20;
    const savedSpeed = CONFIG.animationSpeed;
    CONFIG.animationSpeed = 0.1;

    let i = 0;
    function next() {
        if (i >= moves) {
            CONFIG.animationSpeed = savedSpeed;
            updateUI();
            return;
        }

        const axes = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
        const axis = axes[Math.floor(Math.random() * 3)];
        const maxOff = (state.dimension - 1) / 2;
        const sliceIndex = Math.floor(Math.random() * state.dimension);
        const slice = -maxOff + sliceIndex;
        const turns = Math.random() > 0.5 ? 1 : -1;

        performMove(axis, slice, turns);

        state.actionTimeout = setTimeout(next, 120);
        i++;
    }
    next();
}

export function solveCube() {
    if (state.moveHistory.length === 0 || state.isAnimating) return;

    if (state.actionTimeout) clearTimeout(state.actionTimeout);

    const lastMove = state.moveHistory.pop();
    const inverseTurns = -lastMove.turns;

    performMove(lastMove.axis, lastMove.slice, inverseTurns);

    const duration = CONFIG.animationSpeed * 1000 + 50;
    state.actionTimeout = setTimeout(() => {
        state.moveHistory.pop();
        updateUI();

        if (state.moveHistory.length > 0) {
            solveCube();
        } else {
            showFeedback("SOLVED!");
        }
    }, duration);
}

export function resetCube() {
    if (state.moveHistory.length === 0 || state.isAnimating) {
        if (state.actionTimeout) {
            clearTimeout(state.actionTimeout);
            state.actionTimeout = null;
        }
        state.isAnimating = false;
        state.isDragging = false;
        state.isRotatingLayer = false;

        if (state.activeGroup) {
            const children = [...state.activeGroup.children];
            children.forEach(c => state.scene.attach(c));
            state.scene.remove(state.activeGroup);
            state.activeGroup = null;
        }
        state.activeAxis = null;

        createCube(state.dimension);
        showFeedback("RESET");
        return;
    }

    if (state.actionTimeout) clearTimeout(state.actionTimeout);

    const savedSpeed = CONFIG.animationSpeed;
    CONFIG.animationSpeed = 0.05;

    function resetNext() {
        if (state.moveHistory.length === 0) {
            CONFIG.animationSpeed = savedSpeed;
            updateUI();
            showFeedback("RESET");
            return;
        }

        const lastMove = state.moveHistory.pop();
        const inverseTurns = -lastMove.turns;

        performMove(lastMove.axis, lastMove.slice, inverseTurns);

        state.actionTimeout = setTimeout(() => {
            state.moveHistory.pop();
            updateUI();
            resetNext();
        }, 70);
    }

    resetNext();
}
