import { state } from './state.js';

export function updateUI() {
    const counter = document.getElementById('move-counter');
    if (counter) {
        counter.innerText = `Moves: ${state.moveHistory.length}`;
    }
}

export function showFeedback(text) {
    const el = document.getElementById('hint-text');
    if (!el) return;
    el.innerText = text;
    el.style.opacity = 1;
    el.style.transform = "translate(-50%, -50%) scale(1)";
    setTimeout(() => {
        el.style.opacity = 0;
        el.style.transform = "translate(-50%, -50%) scale(0.8)";
    }, 2000);
}
