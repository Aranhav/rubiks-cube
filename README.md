# Realistic 3D Rubik's Cube

An interactive 3D Rubik's Cube built with Three.js featuring smooth animations, multiple cube sizes, and solving capabilities.

## Features

- **Multiple Cube Sizes**: 2x2, 3x3, 4x4, and 5x5 cubes
- **Smooth 60fps Animations**: Realistic rotation animations with easing
- **Interactive Controls**: Drag faces to rotate layers, orbit camera by dragging empty space
- **Scramble**: Randomly scramble the cube with 20 moves
- **Auto-Solve**: Reverses all moves to solve the cube
- **Fast Reset**: Quickly reset cube to solved state with animated reversals
- **Vibrant Colors**: Eye-catching, saturated colors on black background
- **Liquid Glass UI**: Modern glassmorphism design for controls
- **Mobile Responsive**: Works on all screen sizes
- **Touch Support**: Full touch controls for mobile devices

## Controls

- **Rotate Face**: Click and drag on a cube face
- **Orbit Camera**: Click and drag on empty space
- **Zoom**: Scroll wheel or pinch gesture

## Tech Stack

- Three.js for 3D rendering
- Express.js for serving static files
- Pure HTML/CSS/JavaScript (no build step required)

## Local Development

```bash
npm install
npm start
```

Then open http://localhost:3000

## Deployment

### Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the Node.js app
3. Deploy!

The app uses the `PORT` environment variable provided by Railway.

### Other Platforms

Works with any platform that supports Node.js:
- Vercel
- Heroku
- Render
- DigitalOcean App Platform

## License

MIT
