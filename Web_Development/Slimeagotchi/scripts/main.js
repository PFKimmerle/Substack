import { loadImages, drawSlime, bgImages } from './animation.js';
import { setupUI } from './ui.js';

window.onload = async function() {
    const canvas = document.getElementById('slimeCanvas');
    const ctx = canvas.getContext('2d');

    try {
        console.log("Starting image loading...");
        await loadImages();
        console.log("Images loaded successfully");

        setupUI(ctx);

        drawSlime(ctx, "front", 0, 270, bgImages[0]);
        console.log("Initial slime drawn");
    } catch (error) {
        console.error("Error during game initialization: ", error);
    }
};