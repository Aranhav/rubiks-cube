export function initGDPR() {
    const consent = localStorage.getItem('cubic_gdpr_consent');
    if (consent) return; // Already acted

    const banner = document.createElement('div');
    banner.className = 'gdpr-banner';
    banner.innerHTML = `
        <div class="gdpr-content">
            <h3>Privacy & Cookies</h3>
            <p>We use local storage to save your game progress and preferences. We do not track you or sell your data. By continuing to use CUBIC, you agree to our use of local storage.</p>
        </div>
        <div class="gdpr-actions">
            <button class="gdpr-btn decline" id="gdpr-decline">Decline</button>
            <button class="gdpr-btn accept" id="gdpr-accept">Accept</button>
        </div>
    `;

    document.body.appendChild(banner);

    // Animate in
    requestAnimationFrame(() => {
        banner.classList.add('visible');
    });

    document.getElementById('gdpr-accept').addEventListener('click', () => {
        localStorage.setItem('cubic_gdpr_consent', 'accepted');
        hideBanner();
    });

    document.getElementById('gdpr-decline').addEventListener('click', () => {
        localStorage.setItem('cubic_gdpr_consent', 'declined');
        hideBanner();
    });

    function hideBanner() {
        banner.classList.remove('visible');
        setTimeout(() => {
            banner.remove();
        }, 500);
    }
}
