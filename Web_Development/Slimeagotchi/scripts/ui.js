import { resetGame, getHealth, getHappiness, setHealth, setHappiness, checkMadState } from './stateManager.js';
import { drawSlime, bgImages, slimeImages } from './animation.js';

// Sound file paths
const sounds = {
    click: new Audio('./sounds/mouse-click-sound-233951.mp3'),
    eat: new Audio('./sounds/eat-a-cracker-95783.mp3'),
    bounce: new Audio('./sounds/slimejump-6913.mp3'),
    love: new Audio('./sounds/cute-level-up-2-189851.mp3'),
    music: new Audio('./sounds/8bit-music-for-game-68698.mp3'),
    ghost: new Audio('./sounds/pixel-song-11-79563.mp3')  // Ghost music for pet death
};

let health = getHealth();
let happiness = getHappiness();
let currentBgIndex = 0;
let isAnimating = false;

// DOM elements
const resetButton = document.getElementById('resetButton');      // Updated to match HTML ID
const healthDisplay = document.getElementById('health');
const happinessDisplay = document.getElementById('happiness');

// Function to update health and happiness displays
function updateStats() {
    health = getHealth();
    happiness = getHappiness();
    healthDisplay.textContent = health;
    happinessDisplay.textContent = happiness;
}

// Function to handle animation with an optional duration
function animate(ctx, state, frames, frameDuration = 200, customDuration = null, onComplete = null, shuffle = false) {
    if (isAnimating) return;
    isAnimating = true;
    let frame = 0;
    const startTime = performance.now();

    // Handle shuffling of frames
    if (shuffle) {
        frame = Math.floor(Math.random() * frames);
    }

    function step(timestamp) {
        const elapsed = timestamp - startTime;
        const currentFrame = Math.max(Math.floor(elapsed / frameDuration) % frames, 0);
        drawSlime(ctx, state, currentFrame, 270, bgImages[currentBgIndex]);

        if (customDuration && elapsed >= customDuration) {
            isAnimating = false;
            if (checkMadState()) {
                drawSlime(ctx, "mad", 0, 270, bgImages[currentBgIndex]);
            } else {
                drawSlime(ctx, "front", 0, 270, bgImages[currentBgIndex]);
            }
            if (onComplete) onComplete();
        } else if (!customDuration && currentFrame >= frames - 1) {
            isAnimating = false;
            if (checkMadState()) {
                drawSlime(ctx, "mad", 0, 270, bgImages[currentBgIndex]);
            } else {
                drawSlime(ctx, "front", 0, 270, bgImages[currentBgIndex]);
            }
            if (onComplete) onComplete();
        } else {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
}

// Function to check mad or ghost state
function checkMadOrGhost(ctx) {
    health = getHealth();
    happiness = getHappiness();

    if (health === 0) {
        console.log("Slime has died! Showing death modal.");

        // Trigger the modal pop-up
        const modal = document.getElementById('deathModal');
        modal.style.display = "block";  // Show modal

        // Play death sound or ghost sound (optional)
        playSound(sounds.ghost, false);

        // Reset button inside the modal
        const resetButtonModal = document.getElementById('resetButtonModal');
        resetButtonModal.onclick = () => {
            playSound(sounds.click);

            // Reset the game
            resetGame();
            health = getHealth();
            happiness = getHappiness();
            updateStats();
            
            // Redraw front slime after reset
            drawSlime(ctx, "front", 0, 270, bgImages[currentBgIndex]);

            // Hide the modal after reset
            modal.style.display = "none";
            console.log("Game reset completed.");

            // Stop ghost sound
            if (!sounds.ghost.paused) {
                sounds.ghost.pause();
                sounds.ghost.currentTime = 0;
            }
        };

        return;  // Stop further actions when health is 0
    }
}

// Function to play sounds with an option to stop after a specific duration
function playSound(sound, stopAfter = 15000) {
    if (!sound.paused) {
        sound.pause();
        sound.currentTime = 0;
    }
    sound.play().catch((error) => {
        console.error('Error playing sound:', error);
    });

    if (stopAfter) {
        setTimeout(() => {
            if (!sound.paused) {
                sound.pause();
                sound.currentTime = 0;
            }
        }, stopAfter);
    }
}

// Function to set up UI buttons and event listeners
export function setupUI(ctx) {
    const changeBgBtn = document.querySelector('.change-bg-btn');
    if (changeBgBtn) {
        changeBgBtn.addEventListener('click', () => {
            playSound(sounds.click);
            currentBgIndex = (currentBgIndex + 1) % bgImages.length;
            drawSlime(ctx, "front", 0, 270, bgImages[currentBgIndex]);
        });
    }

    const controlButtons = document.querySelectorAll('.controls button');
    const actions = ["eat", "music", "sleep", "bounce", "heart"];

    controlButtons.forEach((button, index) => {
        button.addEventListener('click', () => {
            playSound(sounds.click);

            health = getHealth();
            happiness = getHappiness();

            if (health > 0 && !isAnimating) {
                const action = actions[index];
                console.log(`${action} button clicked`);

                switch (index) {
                    case 0: // Feed
                        playSound(sounds.eat);
                        setHealth(health + 10);
                        health = getHealth();
                        animate(ctx, "eat", slimeImages["eat"].length, 200, null, null, true);
                        break;
                    case 1: // Music
                        playSound(sounds.music, 15000);
                        setHappiness(happiness + 10);
                        happiness = getHappiness();
                        animate(ctx, "music", slimeImages["music"].length, 200, 15000);
                        break;
                    case 2: // Sleep
                        setHealth(health - 5);
                        setHappiness(happiness + 5);
                        health = getHealth();
                        happiness = getHappiness();
                        animate(ctx, "sleep", slimeImages["sleep"].length, 200, 60000);
                        break;
                    case 3: // Bounce
                        playSound(sounds.bounce); 
                        // Decrease health and increase happiness
                        setHealth(health - 5);
                        setHappiness(happiness + 5);
                        health = getHealth();
                        happiness = getHappiness();
                        
                        // Check if the slime is mad
                        if (checkMadState()) {
                            console.log("Slime is mad, using mad bounce images");
                            animate(ctx, "mad_bounce", slimeImages["mad_bounce"].length, 200);  // Use mad bounce images
                        } else {
                            console.log("Slime is happy, using normal bounce images");
                            animate(ctx, "bounce", slimeImages["bounce"].length, 200);  // Use normal bounce images
                        }
                        break;
                    case 4: // Send Love
                        playSound(sounds.love);
                        setHappiness(happiness + 10);
                        happiness = getHappiness();
                        animate(ctx, "heart", slimeImages["heart"].length, 200);
                        break;
                    default:
                        console.error("Unknown action index:", index);
                }

                updateStats();
                checkMadOrGhost(ctx);
            }
        });
    });
}
