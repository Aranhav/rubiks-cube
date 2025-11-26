# Kaiross Cube - v2.5

I have fixed the cube centering logic by ensuring the 3D renderer respects the container's dimensions.

## Key Features

### 1. Centered Gameplay (Fixed)
- **Logic Update**: The Three.js renderer and camera now calculate aspect ratio and size based on the `#canvas-container` dimensions, not the full window.
- **Raycasting**: Mouse interaction logic has been updated to account for the canvas offset, ensuring accurate clicks and drags.

### 2. Branding Updates
- **Title**: "CUBIC" is now the main title in the sidebar.
- **Subtitle**: "by KAIROSS" reinforces the brand.
- **Footer**: The "Kaiross" text in the footer is now a clickable link to `https://kaiross.in`.

### 3. Marketability & SEO
- **Optimized Metadata**: Rich `<meta>` tags for search engines and social media.
- **Semantic HTML**: Proper structure for accessibility.

### 4. Progressive Web App (PWA)
- **Installable**: Users can install the app on their home screen.
- **Offline Support**: Service Worker caches core assets.

### 5. GDPR Compliance
- **Consent Banner**: Non-intrusive banner for local storage consent.

## How to Run

1. Ensure you have Node.js installed.
2. Run the server:
   ```bash
   npm start
   ```
3. Open `http://localhost:3011` in your browser.

## Verification
- **Centering**: The cube should be perfectly centered in the black area on desktop.
- **Interaction**: Try rotating the cube. The mouse drag should work correctly even with the canvas offset.
