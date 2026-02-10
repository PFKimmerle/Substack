// BMO Games System
class BMO {
  constructor() {
    this.screen = document.querySelector('.screen');
    this.face = document.querySelector('.face');
    this.mouth = document.querySelector('.mouth');
    this.noSignal = document.getElementById('noSignal');
    this.videoPlayer = document.querySelector('.video-player');
    this.fileEditView = document.getElementById('fileEditView');
    this.bluePrint = document.getElementById('bluePrint');
    this.currentState = 'face'; // face, menu, game, no-signal, video, fileEdit, bluePrint
    this.currentGame = null;
    this.selectedGame = 0;
    this.games = ['Dino Runner', 'Reaction Game'];

    this.faceExpressions = ['happy', 'gentle', 'neutral'];
    this.currentExpression = 0;
    this.faceInterval = null;

    this.musicPlayer = new MusicPlayer();

    this.initButtons();
    this.startFaceCycle();
  }

  initButtons() {
    // Red PLAY button - show menu
    const redBtn = document.querySelector('.btn-red');
    redBtn.addEventListener('click', () => {
      if (this.currentState === 'face') {
        this.showMenu();
      } else if (this.currentState === 'menu') {
        this.startGame(this.selectedGame);
      }
    });

    // Green BACK button - exit
    const greenBtn = document.querySelector('.btn-green');
    greenBtn.addEventListener('click', () => this.exitToFace());

    // Blue dot - toggle no signal
    const blueDot = document.querySelector('.blue-dot');
    blueDot.addEventListener('click', () => this.toggleNoSignal());

    // Video button - toggle video player
    const videoBtn = document.getElementById('videoBtn');
    videoBtn.addEventListener('click', () => this.toggleVideo());

    // Blue buttons under D-pad - toggle images
    const blueButtons = document.querySelectorAll('.btn-blue');
    blueButtons[0].addEventListener('click', () => this.toggleFileEdit()); // Left = File Edit View
    blueButtons[1].addEventListener('click', () => this.toggleBluePrint()); // Right = Blueprint

    // Music controls
    const musicToggle = document.getElementById('musicToggle');
    const musicPrev = document.getElementById('musicPrev');
    const musicNext = document.getElementById('musicNext');

    this.musicPlayer.setMusicButton(musicToggle);

    musicToggle.addEventListener('click', () => this.musicPlayer.togglePlay());
    musicPrev.addEventListener('click', () => this.musicPlayer.prevTrack());
    musicNext.addEventListener('click', () => this.musicPlayer.nextTrack());

    // D-pad directional detection
    const dpad = document.querySelector('.dpad');
    dpad.addEventListener('click', (e) => {
      const rect = dpad.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Determine direction based on which quadrant was clicked
      const dx = x - centerX;
      const dy = y - centerY;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal direction dominant
        if (dx > 0) {
          this.dpadDirection('right');
        } else {
          this.dpadDirection('left');
        }
      } else {
        // Vertical direction dominant
        if (dy > 0) {
          this.dpadDirection('down');
        } else {
          this.dpadDirection('up');
        }
      }
    });
  }

  dpadDirection(direction) {
    // Handle menu navigation
    if (this.currentState === 'menu') {
      if (direction === 'left') {
        this.navigate(-1);
      } else if (direction === 'right') {
        this.navigate(1);
      }
    }
    // Pass direction to current game if it exists
    else if (this.currentGame && this.currentGame.handleDpad) {
      this.currentGame.handleDpad(direction);
    }
  }

  showMenu() {
    this.currentState = 'menu';
    this.face.style.display = 'none';

    const menu = document.createElement('div');
    menu.className = 'game-menu';
    menu.innerHTML = `
      <div class="menu-title">Pick a Game!</div>
      <div class="menu-game">${this.games[this.selectedGame]}</div>
      <div class="menu-hint">D-pad ◀ ▶ to browse<br>PLAY GAMES to start</div>
    `;

    this.screen.appendChild(menu);
  }

  navigate(direction) {
    if (this.currentState !== 'menu') return;

    this.selectedGame += direction;
    if (this.selectedGame < 0) this.selectedGame = this.games.length - 1;
    if (this.selectedGame >= this.games.length) this.selectedGame = 0;

    const menuGame = document.querySelector('.menu-game');
    if (menuGame) {
      menuGame.textContent = this.games[this.selectedGame];
    }
  }

  startGame(gameIndex) {
    this.currentState = 'game';
    this.clearScreen();

    switch(gameIndex) {
      case 0:
        this.currentGame = new DinoGame(this.screen);
        break;
      case 1:
        this.currentGame = new ReactionGame(this.screen);
        break;
    }

    if (this.currentGame) {
      this.currentGame.start();
    }
  }

  exitToFace() {
    if (this.currentGame) {
      this.currentGame.stop();
      this.currentGame = null;
    }

    // Hide video if showing
    if (this.videoPlayer) {
      this.videoPlayer.style.display = 'none';
    }

    // Hide no signal if showing
    if (this.noSignal) {
      this.noSignal.style.display = 'none';
    }

    // Hide images if showing
    if (this.fileEditView) {
      this.fileEditView.style.display = 'none';
    }
    if (this.bluePrint) {
      this.bluePrint.style.display = 'none';
    }

    this.clearScreen();
    this.currentState = 'face';
    this.face.style.display = 'flex';

    // Reset to happy face and restart cycle
    this.mouth.classList.remove('gentle', 'neutral');
    this.currentExpression = 0;
  }

  clearScreen() {
    Array.from(this.screen.children).forEach(child => {
      if (!child.classList.contains('face')) {
        child.remove();
      }
    });
  }

  startFaceCycle() {
    // Change face expression every 5-10 seconds when on face screen
    this.faceInterval = setInterval(() => {
      if (this.currentState === 'face') {
        this.changeFace();
      }
    }, Math.random() * 5000 + 5000); // Random 5-10 seconds
  }

  changeFace() {
    // Blink before changing face
    const eyes = document.querySelectorAll('.eye');
    eyes.forEach(eye => {
      eye.style.animation = 'none';
      setTimeout(() => {
        eye.style.animation = 'blink 4s infinite';
      }, 10);
    });

    // Wait for blink, then change face
    setTimeout(() => {
      // Pick a random expression (different from current)
      let newExpression;
      do {
        newExpression = Math.floor(Math.random() * this.faceExpressions.length);
      } while (newExpression === this.currentExpression);

      this.currentExpression = newExpression;
      const expression = this.faceExpressions[newExpression];

      // Remove all expression classes
      this.mouth.classList.remove('gentle', 'neutral');

      // Add new expression (happy is default, no class needed)
      if (expression !== 'happy') {
        this.mouth.classList.add(expression);
      }
    }, 200);
  }

  toggleNoSignal() {
    // Only works from face or no-signal state
    if (this.currentState !== 'face' && this.currentState !== 'no-signal') return;

    console.log('toggleNoSignal called, current state:', this.currentState);

    if (this.currentState === 'face') {
      // Show no signal
      this.face.style.display = 'none';
      this.noSignal.style.display = 'flex';
      this.currentState = 'no-signal';
      console.log('Showing no signal');
    } else {
      // Show face
      this.face.style.display = 'flex';
      this.noSignal.style.display = 'none';
      this.currentState = 'face';
      console.log('Showing face');
    }
  }

  toggleVideo() {
    // Only works from face or video state
    if (this.currentState !== 'face' && this.currentState !== 'video') return;

    if (this.currentState === 'face') {
      // Show video
      this.face.style.display = 'none';
      this.videoPlayer.style.display = 'block';
      this.currentState = 'video';
    } else {
      // Hide video, show face
      this.videoPlayer.style.display = 'none';
      this.face.style.display = 'flex';
      this.currentState = 'face';
    }
  }

  toggleFileEdit() {
    // Only works from face or fileEdit state
    if (this.currentState !== 'face' && this.currentState !== 'fileEdit') return;

    if (this.currentState === 'face') {
      // Show file edit view
      this.face.style.display = 'none';
      this.fileEditView.style.display = 'flex';
      this.currentState = 'fileEdit';
    } else {
      // Hide file edit, show face
      this.fileEditView.style.display = 'none';
      this.face.style.display = 'flex';
      this.currentState = 'face';
    }
  }

  toggleBluePrint() {
    // Only works from face or bluePrint state
    if (this.currentState !== 'face' && this.currentState !== 'bluePrint') return;

    if (this.currentState === 'face') {
      // Show blueprint
      this.face.style.display = 'none';
      this.bluePrint.style.display = 'flex';
      this.currentState = 'bluePrint';
    } else {
      // Hide blueprint, show face
      this.bluePrint.style.display = 'none';
      this.face.style.display = 'flex';
      this.currentState = 'face';
    }
  }

}

// Dino Runner Game
class DinoGame {
  constructor(screen) {
    this.screen = screen;
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.isRunning = false;

    this.dino = { x: 40, y: 150, width: 30, height: 30, velocityY: 0, isJumping: false };
    this.dinoImage = new Image();
    this.dinoImage.src = 'BMO_Skate.png';

    this.obstacles = [];
    this.score = 0;
    this.gameSpeed = 3;
    this.spawnTimer = 0;
    this.gameOver = false;

    this.setupCanvas();
    this.setupControls();
  }

  setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 280;
    this.canvas.height = 200;
    this.canvas.className = 'game-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.screen.appendChild(this.canvas);

    this.dino.y = 140;
  }

  setupControls() {
    // Tap anywhere to jump
    this.canvas.addEventListener('click', () => this.jump());
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.isRunning) this.jump();
    });
  }

  jump() {
    if (!this.dino.isJumping && !this.gameOver) {
      this.dino.velocityY = -8;
      this.dino.isJumping = true;
    }
  }

  handleDpad(direction) {
    if (direction === 'up') {
      this.jump();
    }
  }

  start() {
    this.isRunning = true;
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.canvas) this.canvas.remove();
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    if (this.gameOver) return;

    // Gravity
    this.dino.velocityY += 0.5;
    this.dino.y += this.dino.velocityY;

    // Ground collision
    if (this.dino.y >= 150) {
      this.dino.y = 150;
      this.dino.velocityY = 0;
      this.dino.isJumping = false;
    }

    // Spawn obstacles
    this.spawnTimer++;
    if (this.spawnTimer > 80) {
      this.obstacles.push({ x: 280, y: 155, width: 15, height: 15 });
      this.spawnTimer = 0;
    }

    // Move obstacles
    this.obstacles.forEach(obs => {
      obs.x -= this.gameSpeed;
    });

    // Remove off-screen obstacles
    this.obstacles = this.obstacles.filter(obs => obs.x > -20);

    // Collision detection
    this.obstacles.forEach(obs => {
      if (this.dino.x < obs.x + obs.width &&
          this.dino.x + this.dino.width > obs.x &&
          this.dino.y < obs.y + obs.height &&
          this.dino.y + this.dino.height > obs.y) {
        this.gameOver = true;
      }
    });

    // Score
    if (!this.gameOver) this.score++;
  }

  draw() {
    // Clear
    this.ctx.fillStyle = '#E8F5DC';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Ground line
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, 170);
    this.ctx.lineTo(280, 170);
    this.ctx.stroke();

    // Dino (BMO skating)
    if (this.dinoImage.complete) {
      this.ctx.drawImage(this.dinoImage, this.dino.x, this.dino.y, this.dino.width, this.dino.height);
    } else {
      // Fallback while image loads
      this.ctx.fillStyle = '#63C3B5';
      this.ctx.fillRect(this.dino.x, this.dino.y, this.dino.width, this.dino.height);
    }

    // Obstacles
    this.obstacles.forEach(obs => {
      this.ctx.fillStyle = '#C41E3A';
      this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    });

    // Score
    this.ctx.fillStyle = '#000';
    this.ctx.font = '12px Arial';
    this.ctx.fillText(`Score: ${Math.floor(this.score / 10)}`, 10, 20);

    // Game Over
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over!', 140, 90);
      this.ctx.font = '14px Arial';
      this.ctx.fillText(`Score: ${Math.floor(this.score / 10)}`, 140, 115);
      this.ctx.fillText('Press BACK', 140, 140);
    }
  }
}

// Flappy Bird Game
class FlappyGame {
  constructor(screen) {
    this.screen = screen;
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.isRunning = false;

    this.bird = { x: 50, y: 100, radius: 10, velocityY: 0 };
    this.pipes = [];
    this.score = 0;
    this.frameCount = 0;
    this.gameOver = false;

    this.setupCanvas();
    this.setupControls();
  }

  setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 280;
    this.canvas.height = 200;
    this.canvas.className = 'game-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.screen.appendChild(this.canvas);
  }

  setupControls() {
    this.canvas.addEventListener('click', () => this.flap());
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.isRunning) this.flap();
    });
  }

  flap() {
    if (!this.gameOver) {
      this.bird.velocityY = -5;
    }
  }

  start() {
    this.isRunning = true;
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.canvas) this.canvas.remove();
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.update();
    this.draw();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    if (this.gameOver) return;

    this.frameCount++;

    // Bird physics
    this.bird.velocityY += 0.4;
    this.bird.y += this.bird.velocityY;

    // Spawn pipes
    if (this.frameCount % 90 === 0) {
      const gap = 70;
      const minHeight = 30;
      const maxHeight = 120;
      const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

      this.pipes.push({
        x: 280,
        topHeight: topHeight,
        bottomY: topHeight + gap,
        width: 30,
        passed: false
      });
    }

    // Move pipes
    this.pipes.forEach(pipe => {
      pipe.x -= 2;

      // Score when passing pipe
      if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
        pipe.passed = true;
        this.score++;
      }
    });

    // Remove off-screen pipes
    this.pipes = this.pipes.filter(pipe => pipe.x > -40);

    // Collision detection
    if (this.bird.y - this.bird.radius < 0 || this.bird.y + this.bird.radius > 200) {
      this.gameOver = true;
    }

    this.pipes.forEach(pipe => {
      if (this.bird.x + this.bird.radius > pipe.x &&
          this.bird.x - this.bird.radius < pipe.x + pipe.width) {
        if (this.bird.y - this.bird.radius < pipe.topHeight ||
            this.bird.y + this.bird.radius > pipe.bottomY) {
          this.gameOver = true;
        }
      }
    });
  }

  draw() {
    // Sky
    this.ctx.fillStyle = '#E8F5DC';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Pipes
    this.ctx.fillStyle = '#2D7A3E';
    this.pipes.forEach(pipe => {
      // Top pipe
      this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
      // Bottom pipe
      this.ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, 200 - pipe.bottomY);
    });

    // Bird
    this.ctx.fillStyle = '#FFD859';
    this.ctx.beginPath();
    this.ctx.arc(this.bird.x, this.bird.y, this.bird.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Score
    this.ctx.fillStyle = '#000';
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 25);

    // Game Over
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over!', 140, 90);
      this.ctx.font = '14px Arial';
      this.ctx.fillText(`Score: ${this.score}`, 140, 115);
      this.ctx.fillText('Press BACK', 140, 140);
    }
  }
}

// Reaction Game
class ReactionGame {
  constructor(screen) {
    this.screen = screen;
    this.canvas = null;
    this.ctx = null;
    this.animationId = null;
    this.isRunning = false;

    this.state = 'waiting'; // waiting, ready, clicked, result
    this.waitTime = 0;
    this.startTime = 0;
    this.reactionTime = 0;
    this.round = 0;
    this.totalTime = 0;
    this.maxRounds = 5;

    this.setupCanvas();
    this.setupControls();
  }

  setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 280;
    this.canvas.height = 200;
    this.canvas.className = 'game-canvas';
    this.ctx = this.canvas.getContext('2d');
    this.screen.appendChild(this.canvas);
  }

  setupControls() {
    this.canvas.addEventListener('click', () => this.handleClick());
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && this.isRunning) this.handleClick();
    });
  }

  handleClick() {
    if (this.state === 'waiting') {
      // Too early!
      this.state = 'tooEarly';
      setTimeout(() => this.resetRound(), 1500);
    } else if (this.state === 'ready') {
      // Good click!
      this.reactionTime = Date.now() - this.startTime;
      this.totalTime += this.reactionTime;
      this.round++;
      this.state = 'result';

      if (this.round >= this.maxRounds) {
        setTimeout(() => this.showFinalScore(), 1500);
      } else {
        setTimeout(() => this.resetRound(), 1500);
      }
    }
  }

  resetRound() {
    this.state = 'waiting';
    this.waitTime = Math.random() * 3000 + 1000; // 1-4 seconds
    setTimeout(() => {
      if (this.state === 'waiting') {
        this.state = 'ready';
        this.startTime = Date.now();
      }
    }, this.waitTime);
  }

  showFinalScore() {
    this.state = 'final';
  }

  start() {
    this.isRunning = true;
    this.resetRound();
    this.gameLoop();
  }

  stop() {
    this.isRunning = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.canvas) this.canvas.remove();
  }

  gameLoop() {
    if (!this.isRunning) return;

    this.draw();
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  draw() {
    // Clear
    this.ctx.fillStyle = '#E8F5DC';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#000';

    if (this.state === 'waiting') {
      this.ctx.fillStyle = '#C41E3A';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '20px Arial';
      this.ctx.fillText('Wait...', 140, 100);
    } else if (this.state === 'ready') {
      this.ctx.fillStyle = '#2D7A3E';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '24px Arial';
      this.ctx.fillText('TAP NOW!', 140, 100);
    } else if (this.state === 'tooEarly') {
      this.ctx.font = '18px Arial';
      this.ctx.fillText('Too Early!', 140, 100);
      this.ctx.font = '14px Arial';
      this.ctx.fillText('Wait for green!', 140, 125);
    } else if (this.state === 'result') {
      this.ctx.font = '16px Arial';
      this.ctx.fillText(`${this.reactionTime}ms`, 140, 90);
      this.ctx.font = '14px Arial';
      this.ctx.fillText(`Round ${this.round}/${this.maxRounds}`, 140, 120);
    } else if (this.state === 'final') {
      const avgTime = Math.floor(this.totalTime / this.maxRounds);
      this.ctx.font = '18px Arial';
      this.ctx.fillText('Complete!', 140, 70);
      this.ctx.font = '16px Arial';
      this.ctx.fillText(`Average: ${avgTime}ms`, 140, 100);
      this.ctx.font = '12px Arial';

      let rating = 'Good!';
      if (avgTime < 200) rating = 'Excellent!';
      else if (avgTime < 250) rating = 'Great!';
      else if (avgTime > 350) rating = 'Try Again!';

      this.ctx.fillText(rating, 140, 125);
      this.ctx.fillText('Press BACK', 140, 150);
    }

    // Round counter (except on final screen)
    if (this.state !== 'final') {
      this.ctx.textAlign = 'left';
      this.ctx.font = '12px Arial';
      this.ctx.fillStyle = '#000';
      this.ctx.fillText(`Round ${this.round + 1}/${this.maxRounds}`, 10, 20);
    }
  }
}

// Music Player
class MusicPlayer {
  constructor() {
    this.musicBtn = null; // Will be set after DOM loads

    this.tracks = [
      { name: 'Lofi Girl Chill Beats', file: 'music/lofi_music_library-lofi-girl-chill-lofi-beats-lofi-ambient-461871.mp3' },
      { name: 'Aventure Dreamy Lofi', file: 'music/aventure-dreamy-lofi-nostalgic-background-469629.mp3' },
      { name: 'Pixel Dreams', file: 'music/djlofi-pixel-dreams-259187.mp3' }
    ];

    this.currentTrack = 0;
    this.audio = new Audio();
    this.isPlaying = false;

    this.loadTrack(0);
    this.audio.addEventListener('ended', () => this.nextTrack());
  }

  setMusicButton(btn) {
    this.musicBtn = btn;
  }

  loadTrack(index) {
    this.currentTrack = index;
    this.audio.src = this.tracks[index].file;
  }

  togglePlay() {
    if (this.isPlaying) {
      this.audio.pause();
      if (this.musicBtn) this.musicBtn.textContent = '♪';
      this.isPlaying = false;
    } else {
      this.audio.play();
      if (this.musicBtn) this.musicBtn.textContent = '❚❚';
      this.isPlaying = true;
    }
  }

  nextTrack() {
    this.currentTrack = (this.currentTrack + 1) % this.tracks.length;
    this.loadTrack(this.currentTrack);
    if (this.isPlaying) {
      this.audio.play();
    }
  }

  prevTrack() {
    this.currentTrack = (this.currentTrack - 1 + this.tracks.length) % this.tracks.length;
    this.loadTrack(this.currentTrack);
    if (this.isPlaying) {
      this.audio.play();
    }
  }
}

// Initialize BMO when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.bmo = new BMO();
});
