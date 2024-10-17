export const bgImages = [];
export const slimeImages = {
    front: [], eat: [], mad: [], ghost: [], heart: [], music: [], sleep: [], bounce: [], mad_bounce: []
};

// Function to load all images (backgrounds and slime actions)
export async function loadImages() {
    const backgroundThemes = ['beach', 'space', 'grass', 'city', 'cemetery'];
    const loadPromises = [];

    // Load background images
    backgroundThemes.forEach((theme, index) => {
        const img = new Image();
        img.src = `./images/background/${theme}_theme.png`;
        loadPromises.push(new Promise((resolve, reject) => {
            img.onload = () => {
                bgImages[index] = img;
                resolve();
            };
            img.onerror = reject;
        }));
    });

    // Load front images (2 total)
    const frontImages = ['front1.png', 'front2.png'];
    frontImages.forEach((filename) => {
        const img = new Image();
        img.src = `./images/slime/${filename}`;
        img.onload = () => {
            slimeImages["front"].push(img);
            console.log(`Loaded front image: ${filename}`);
        };
        img.onerror = (error) => {
            console.error(`Error loading image: ${filename}`, error);
        };
    });

    // Load mad images (6 total)
    const madImages = ['mad1.png', 'mad2.png', 'mad_left1.png', 'mad_left2.png', 'mad_right1.png', 'mad_right2.png'];
    madImages.forEach((filename) => {
        const img = new Image();
        img.src = `./images/slime/${filename}`;
        img.onload = () => {
            slimeImages["mad"].push(img);
            console.log(`Loaded mad image: ${filename}`);
        };
        img.onerror = (error) => {
            console.error(`Error loading image: ${filename}`, error);
        };
    });

    // Load mad_bounce images (4 total)
    const madBounceImages = ['mad_bounce1V2.png', 'mad_bounce2V2.png', 'mad_bounce3V2.png', 'mad_bounce4V2.png'];
    madBounceImages.forEach((filename) => {
        const img = new Image();
        img.src = `./images/slime/${filename}`;
        img.onload = () => {
            slimeImages["mad_bounce"].push(img);
            console.log(`Loaded mad_bounce image: ${filename}`);
        };
        img.onerror = (error) => {
            console.error(`Error loading mad_bounce image: ${filename}`, error);
        };
    });


    // Load ghost images (2 total)
    const ghostImages = ['ghost1.png', 'ghost2.png'];
    ghostImages.forEach((filename) => {
        const img = new Image();
        img.src = `./images/slime/${filename}`;

        loadPromises.push(
            new Promise((resolve, reject) => {
                img.onload = () => {
                    slimeImages["ghost"].push(img);
                    console.log(`Loaded ghost image: ${filename}`);
                    resolve();  // Resolve when the image loads
                };
                img.onerror = (error) => {
                    console.error(`Error loading ghost image: ${filename}`, error);
                    reject(error);  // Reject if the image fails to load
                };
            })
        );
    });

    // Load bounce images (4 total)
    const bounceImages = ['bounce1V2.png', 'bounce2V2.png', 'bounce3V2.png', 'bounce4V2.png'];
    bounceImages.forEach((filename) => {
        const img = new Image();
        img.src = `./images/slime/${filename}`;
        img.onload = () => {
            slimeImages["bounce"].push(img);
            console.log(`Loaded bounce image: ${filename}`);
        };
        img.onerror = (error) => {
            console.error(`Error loading image: ${filename}`, error);
        };
    });

    // Load feed/eat images (2 total)
    const eatImages = ['eat1.png', 'eat2.png'];
    eatImages.forEach((filename) => {
        const img = new Image();
        img.src = `./images/slime/${filename}`;
        img.onload = () => {
            slimeImages["eat"].push(img);
            console.log(`Loaded eat image: ${filename}`);
        };
        img.onerror = (error) => {
            console.error(`Error loading image: ${filename}`, error);
        };
    });

    // Load music images (3 total)
    const musicImages = ['music1.png', 'music2.png', 'music3.png'];
    musicImages.forEach((filename) => {
        const img = new Image();
        img.src = `./images/slime/${filename}`;
        img.onload = () => {
            slimeImages["music"].push(img);
            console.log(`Loaded music image: ${filename}`);
        };
        img.onerror = (error) => {
            console.error(`Error loading image: ${filename}`, error);
        };
    });

    // Load sleep images (3 total)
    const sleepImages = ['sleep1.png', 'sleep2.png', 'sleep3.png'];
    sleepImages.forEach((filename) => {
        const img = new Image();
        img.src = `./images/slime/${filename}`;
        img.onload = () => {
            slimeImages["sleep"].push(img);
            console.log(`Loaded sleep image: ${filename}`);
        };
        img.onerror = (error) => {
            console.error(`Error loading image: ${filename}`, error);
        };
    });

    // Load heart (send love) images (3 total)
    const heartImages = ['heart1.png', 'heart2.png', 'heart3.png'];
    heartImages.forEach((filename) => {
        const img = new Image();
        img.src = `./images/slime/${filename}`;
        img.onload = () => {
            slimeImages["heart"].push(img);
            console.log(`Loaded heart image: ${filename}`);
        };
        img.onerror = (error) => {
            console.error(`Error loading image: ${filename}`, error);
        };
    });

    await Promise.all(loadPromises);
    console.log("All images loaded successfully.");
}

// Export the drawSlime function correctly
export function drawSlime(ctx, state = "front", frameIndex = 0, x = 270, bgImage) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // Draw background image
    if (bgImage instanceof HTMLImageElement) {
        ctx.drawImage(bgImage, 0, 0, ctx.canvas.width, ctx.canvas.height);
    } else {
        console.error("Invalid background image:", bgImage);
    }

    // Draw slime image
    if (slimeImages[state] && slimeImages[state].length > 0) {
        const slimeImg = slimeImages[state][frameIndex % slimeImages[state].length];
        if (slimeImg instanceof HTMLImageElement) {
            console.log(`Drawing state: ${state}, frame: ${frameIndex}`);
            ctx.drawImage(slimeImg, x, 180, 100, 100);
        } else {
            console.error(`Invalid image for state: ${state}, frame: ${frameIndex}`, slimeImg);
        }
    } else {
        console.error(`No images loaded for state: ${state}`);
    }
}
