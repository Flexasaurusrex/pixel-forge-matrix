// Canvas History Management System
class CanvasHistory {
    constructor(canvas, maxStates = 50) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.maxStates = maxStates;
        this.history = [];
        this.currentIndex = -1;
        this.isRestoring = false;
        
        // Save initial state
        this.saveState();
    }
    
    saveState() {
        if (this.isRestoring) return;
        
        // Remove states after current index if we're not at the end
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }
        
        // Add new state
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        this.history.push(imageData);
        
        // Limit history size
        if (this.history.length > this.maxStates) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }
        
        this.updateButtons();
    }
    
    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.restoreState();
        }
    }
    
    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            this.restoreState();
        }
    }
    
    restoreState() {
        if (this.history[this.currentIndex]) {
            this.isRestoring = true;
            this.ctx.putImageData(this.history[this.currentIndex], 0, 0);
            this.isRestoring = false;
            this.updateButtons();
        }
    }
    
    updateButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');
        
        if (undoBtn) {
            undoBtn.disabled = this.currentIndex <= 0;
            undoBtn.style.opacity = this.currentIndex <= 0 ? '0.5' : '1';
        }
        
        if (redoBtn) {
            redoBtn.disabled = this.currentIndex >= this.history.length - 1;
            redoBtn.style.opacity = this.currentIndex >= this.history.length - 1 ? '0.5' : '1';
        }
    }
    
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.saveState();
    }
}

class PixelCollageBuilder {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridCanvas = document.getElementById('gridCanvas');
        this.gridCtx = this.gridCanvas.getContext('2d');
        
        // Initialize canvas history
        this.history = new CanvasHistory(this.canvas);
        
        // Canvas setup
        this.canvasSize = Math.min(800, 600);
        this.pixelSize = 4;
        this.gridWidth = this.canvasSize / this.pixelSize;
        this.gridHeight = (this.canvasSize * 0.75) / this.pixelSize;
        
        this.canvas.width = this.gridWidth * this.pixelSize;
        this.canvas.height = this.gridHeight * this.pixelSize;
        this.gridCanvas.width = this.canvas.width;
        this.gridCanvas.height = this.canvas.height;
        
        // State management
        this.isDrawing = false;
        this.currentTool = 'paint';
        this.currentColor = '#00ff41';
        this.currentPixelType = 'quantum';
        this.currentBrushSize = 1;
        this.pixels = [];
        
        // Animation and effects
        this.animationTime = 0;
        this.colorCycling = false;
        this.retroPalette = 0;
        this.lastUpdate = 0;
        
        // Retrowave palettes
        this.retrowavePalettes = [
            ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'],
            ['#ff0080', '#ff8000', '#ffff00', '#80ff00', '#00ff80'],
            ['#e91e63', '#ff5722', '#ff9800', '#4caf50', '#2196f3'],
            ['#ff1744', '#ff6d00', '#ffc107', '#00e676', '#00bcd4'],
            ['#c51162', '#ff3d00', '#ff8f00', '#64dd17', '#00e5ff']
        ];
        
        // Pixel types and their properties
        this.pixelTypes = [
            'quantum', 'chaos', 'flicker', 'strobe', 'static', 'distort',
            'particle', 'lightning', 'temporal', 'nova', 'fractal', 'phantom',
            'surge', 'cascade', 'vortex', 'spectrum'
        ];
        
        this.animatedTypes = new Set([
            'quantum', 'chaos', 'flicker', 'strobe', 'static', 'distort',
            'particle', 'lightning', 'temporal', 'nova', 'fractal', 'phantom',
            'surge', 'cascade', 'vortex', 'spectrum'
        ]);
        
        // Initialize pixels array
        this.initializePixels();
        
        // Setup event listeners and start animation
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.drawGrid();
        this.animate();
        
        // Update UI
        this.updateToolIndicator();
        this.updateModeIndicator('Ready to create!');
    }

    initializePixels() {
        this.pixels = [];
        for (let y = 0; y < this.gridHeight; y++) {
            this.pixels[y] = [];
            for (let x = 0; x < this.gridWidth; x++) {
                this.pixels[y][x] = null;
            }
        }
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Tool buttons
        document.getElementById('paintBtn').addEventListener('click', () => this.setTool('paint'));
        document.getElementById('eraseBtn').addEventListener('click', () => this.setTool('erase'));
        document.getElementById('fillBtn').addEventListener('click', () => this.setTool('fill'));
        document.getElementById('sampleBtn').addEventListener('click', () => this.setTool('sample'));
        document.getElementById('sprayBtn').addEventListener('click', () => this.setTool('spray'));
        
        // Brush size buttons
        document.getElementById('size1Btn').addEventListener('click', () => this.setBrushSize(1));
        document.getElementById('size2Btn').addEventListener('click', () => this.setBrushSize(2));
        document.getElementById('size3Btn').addEventListener('click', () => this.setBrushSize(3));
        
        // History buttons
        document.getElementById('undoBtn').addEventListener('click', () => this.history.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.history.redo());
        
        // Action buttons
        document.getElementById('retrowaveBtn').addEventListener('click', () => this.cycleRetrowavePalette());
        document.getElementById('colorCycleBtn').addEventListener('click', () => this.toggleColorCycling());
        document.getElementById('recordBtn').addEventListener('click', () => this.toggleRecording());
        document.getElementById('epicRandomizeBtn').addEventListener('click', () => this.epicRandomize());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCanvas());
        
        // Story Mode button - NEW! (conditional in case button doesn't exist yet)
        const storyModeBtn = document.getElementById('storyModeBtn');
        if (storyModeBtn) {
            storyModeBtn.addEventListener('click', () => this.launchStoryMode());
        }
        
        // Color picker
        document.getElementById('colorPicker').addEventListener('change', (e) => {
            this.currentColor = e.target.value;
        });
        
        // Pixel type buttons
        this.pixelTypes.forEach(type => {
            const btn = document.getElementById(`${type}Btn`);
            if (btn) {
                btn.addEventListener('click', () => this.setPixelType(type));
            }
        });
        
        // Geometric construct buttons
        ['fractal', 'mandala', 'spiral', 'matrix', 'hexagon', 'crystal', 'circuit', 'flower', 'galaxy'].forEach(type => {
            const btn = document.getElementById(`construct${type.charAt(0).toUpperCase() + type.slice(1)}Btn`);
            if (btn) {
                btn.addEventListener('click', () => this.drawGeometricConstruct(type));
            }
        });
        
        // Background generator buttons
        ['cybermesh', 'neuralnet', 'datamatrix', 'circuitboard', 'hexgrid', 'starfield'].forEach(type => {
            const btn = document.getElementById(`bg${type.charAt(0).toUpperCase() + type.slice(1)}Btn`);
            if (btn) {
                btn.addEventListener('click', () => this.generateBackground(type));
            }
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key.toLowerCase()) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            this.history.redo();
                        } else {
                            this.history.undo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        this.history.redo();
                        break;
                }
            }
        });
    }

    // NEW METHOD: Launch Story Mode
    launchStoryMode() {
        // Save current work state and show transition
        this.updateModeIndicator('🌌 LAUNCHING COSMIC STORYTELLER');
        
        // Visual feedback on button
        const btn = document.getElementById('storyModeBtn');
        if (btn) {
            btn.style.background = 'linear-gradient(45deg, #ff006e, #8338ec)';
            btn.style.transform = 'scale(0.95)';
        }
        
        // Cosmic transition effect
        this.createCosmicTransition();
        
        // Navigate to storyteller after transition
        setTimeout(() => {
            window.location.href = '/storyteller';
        }, 1500);
    }

    createCosmicTransition() {
        // Create swirling cosmic effect before transition
        const centerX = Math.floor(this.gridWidth / 2);
        const centerY = Math.floor(this.gridHeight / 2);
        
        for (let radius = 1; radius <= 8; radius++) {
            setTimeout(() => {
                for (let angle = 0; angle < 360; angle += 30) {
                    const x = centerX + Math.cos(angle * Math.PI / 180) * radius;
                    const y = centerY + Math.sin(angle * Math.PI / 180) * radius;
                    
                    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                        this.setPixel(Math.floor(x), Math.floor(y), {
                            color: '#ffffff',
                            type: 'nova'
                        });
                    }
                }
                this.renderFrame();
            }, radius * 100);
        }
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: Math.floor((e.clientX - rect.left) * scaleX / this.pixelSize),
            y: Math.floor((e.clientY - rect.top) * scaleY / this.pixelSize)
        };
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.draw(e);
    }

    draw(e) {
        if (!this.isDrawing && this.currentTool !== 'sample') return;
        
        const pos = this.getMousePos(e);
        
        switch(this.currentTool) {
            case 'paint':
                this.paintPixels(pos.x, pos.y);
                break;
            case 'erase':
                this.erasePixels(pos.x, pos.y);
                break;
            case 'fill':
                if (this.isDrawing) {
                    this.floodFill(pos.x, pos.y);
                    this.isDrawing = false;
                }
                break;
            case 'sample':
                this.sampleColor(pos.x, pos.y);
                break;
            case 'spray':
                this.sprayPixels(pos.x, pos.y);
                break;
        }
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.history.saveState();
        }
    }

    paintPixels(centerX, centerY) {
        for (let dy = -this.currentBrushSize + 1; dy < this.currentBrushSize; dy++) {
            for (let dx = -this.currentBrushSize + 1; dx < this.currentBrushSize; dx++) {
                const x = centerX + dx;
                const y = centerY + dy;
                
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    this.setPixel(x, y, {
                        color: this.currentColor,
                        type: this.currentPixelType
                    });
                }
            }
        }
    }

    erasePixels(centerX, centerY) {
        for (let dy = -this.currentBrushSize + 1; dy < this.currentBrushSize; dy++) {
            for (let dx = -this.currentBrushSize + 1; dx < this.currentBrushSize; dx++) {
                const x = centerX + dx;
                const y = centerY + dy;
                
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    this.pixels[y][x] = null;
                }
            }
        }
    }

    floodFill(startX, startY) {
        if (startX < 0 || startX >= this.gridWidth || startY < 0 || startY >= this.gridHeight) return;
        
        const targetPixel = this.pixels[startY][startX];
        const targetColor = targetPixel ? targetPixel.color : null;
        const targetType = targetPixel ? targetPixel.type : null;
        
        if ((targetColor === this.currentColor && targetType === this.currentPixelType) ||
            (targetColor === this.currentColor && !targetPixel) ||
            (this.currentColor === null && !targetPixel)) return;
        
        const stack = [[startX, startY]];
        const visited = new Set();
        
        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const key = `${x},${y}`;
            
            if (visited.has(key) || x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) continue;
            
            const currentPixel = this.pixels[y][x];
            const currentColor = currentPixel ? currentPixel.color : null;
            const currentType = currentPixel ? currentPixel.type : null;
            
            if (currentColor !== targetColor || currentType !== targetType) continue;
            
            visited.add(key);
            
            this.setPixel(x, y, {
                color: this.currentColor,
                type: this.currentPixelType
            });
            
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }

    sampleColor(x, y) {
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
            const pixel = this.pixels[y][x];
            if (pixel) {
                this.currentColor = pixel.color;
                this.currentPixelType = pixel.type;
                document.getElementById('colorPicker').value = this.currentColor;
                this.updateToolIndicator();
            }
        }
    }

    sprayPixels(centerX, centerY) {
        const sprayRadius = this.currentBrushSize * 2;
        const density = 0.3;
        
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * sprayRadius;
            const x = Math.floor(centerX + Math.cos(angle) * distance);
            const y = Math.floor(centerY + Math.sin(angle) * distance);
            
            if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight && Math.random() < density) {
                this.setPixel(x, y, {
                    color: this.currentColor,
                    type: this.currentPixelType
                });
            }
        }
    }

    setPixel(x, y, pixel) {
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
            this.pixels[y][x] = pixel;
        }
    }

    setTool(tool) {
        this.currentTool = tool;
        this.updateToolIndicator();
    }

    setBrushSize(size) {
        this.currentBrushSize = size;
        this.updateToolIndicator();
    }

    setPixelType(type) {
        this.currentPixelType = type;
        this.updateToolIndicator();
    }

    updateToolIndicator() {
        document.getElementById('toolIndicator').textContent = 
            `${this.currentTool.toUpperCase()} | ${this.currentPixelType.toUpperCase()} | Size: ${this.currentBrushSize}`;
    }

    updateModeIndicator(message) {
        document.getElementById('modeIndicator').textContent = message;
    }

    cycleRetrowavePalette() {
        this.retroPalette = (this.retroPalette + 1) % this.retrowavePalettes.length;
        this.updateModeIndicator(`Retrowave Palette ${this.retroPalette + 1} activated!`);
        
        // Apply palette to existing pixels
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.pixels[y][x]) {
                    const paletteColor = this.retrowavePalettes[this.retroPalette][
                        Math.floor(Math.random() * this.retrowavePalettes[this.retroPalette].length)
                    ];
                    this.pixels[y][x].color = paletteColor;
                }
            }
        }
    }

    toggleColorCycling() {
        this.colorCycling = !this.colorCycling;
        this.updateModeIndicator(this.colorCycling ? 'Color cycling enabled!' : 'Color cycling disabled!');
    }

    toggleRecording() {
        if (this.recording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    startRecording() {
        this.updateModeIndicator('Preparing GIF recording...');
        
        // Load gif.js library if not already loaded
        if (typeof GIF === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.min.js';
            script.onload = () => this.initializeGIF();
            script.onerror = () => {
                this.updateModeIndicator('Failed to load GIF library. Retrying...');
                setTimeout(() => this.startRecording(), 1000);
            };
            document.head.appendChild(script);
        } else {
            this.initializeGIF();
        }
    }

    initializeGIF() {
        this.gif = new GIF({
            workers: 2,
            quality: 10,
            width: this.canvas.width,
            height: this.canvas.height,
            workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
        });

        this.gif.on('finished', (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `pixel-collage-${Date.now()}.gif`;
            a.click();
            URL.revokeObjectURL(url);
            this.updateModeIndicator('GIF exported successfully!');
        });

        this.recording = true;
        this.recordingFrames = 0;
        this.maxFrames = 60; // 4 seconds at 15fps
        this.updateModeIndicator('🔴 Recording GIF...');
        
        document.getElementById('recordBtn').textContent = '⏹️ STOP';
        document.getElementById('recordBtn').style.background = 'linear-gradient(45deg, #ff0040, #ff4080)';
    }

    stopRecording() {
        if (this.recording) {
            this.recording = false;
            this.updateModeIndicator('Processing GIF...');
            
            document.getElementById('recordBtn').textContent = '📹 RECORD';
            document.getElementById('recordBtn').style.background = '';
            
            this.gif.render();
        }
    }

    epicRandomize() {
        this.updateModeIndicator('🎲 Generating epic randomness...');
        this.randomizeCanvas();
        this.history.saveState();
    }

    randomizeCanvas() {
        // Clear canvas first
        this.initializePixels();
        
        // Step 1: Background patterns (60% chance)
        if (Math.random() < 0.6) {
            const bgTypes = ['cybermesh', 'neuralnet', 'datamatrix', 'circuitboard', 'hexgrid', 'starfield'];
            const bgType = bgTypes[Math.floor(Math.random() * bgTypes.length)];
            this.generateBackground(bgType);
        }
        
        // Step 2: Geometric constructs (1-3 random constructs)
        const constructCount = Math.floor(Math.random() * 3) + 1;
        const constructTypes = ['fractal', 'mandala', 'spiral', 'matrix', 'hexagon', 'crystal', 'circuit', 'flower', 'galaxy'];
        
        for (let i = 0; i < constructCount; i++) {
            const construct = constructTypes[Math.floor(Math.random() * constructTypes.length)];
            const x = Math.floor(Math.random() * this.gridWidth);
            const y = Math.floor(Math.random() * this.gridHeight);
            this.drawGeometricConstruct(construct, x, y);
        }
        
        // Step 3: Random quantum texture effects (80-140 effects)
        const effectCount = Math.floor(Math.random() * 60) + 80;
        for (let i = 0; i < effectCount; i++) {
            const x = Math.floor(Math.random() * this.gridWidth);
            const y = Math.floor(Math.random() * this.gridHeight);
            const type = this.pixelTypes[Math.floor(Math.random() * this.pixelTypes.length)];
            const color = this.retrowavePalettes[this.retroPalette][
                Math.floor(Math.random() * this.retrowavePalettes[this.retroPalette].length)
            ];
            
            this.setPixel(x, y, { color, type });
        }
        
        // Step 4: Energy corridors (70% chance)
        if (Math.random() < 0.7) {
            this.generateEnergyCorridor();
        }
        
        // Step 5: Reality tears (40% chance)
        if (Math.random() < 0.4) {
            this.generateRealityTear();
        }
        
        // Step 6: Optional focal point (25% chance, not always center)
        if (Math.random() < 0.25) {
            const focalX = Math.floor(Math.random() * this.gridWidth * 0.6) + Math.floor(this.gridWidth * 0.2);
            const focalY = Math.floor(Math.random() * this.gridHeight * 0.6) + Math.floor(this.gridHeight * 0.2);
            const focalTypes = ['nova', 'vortex', 'temporal', 'chaos', 'surge'];
            const focalType = focalTypes[Math.floor(Math.random() * focalTypes.length)];
            const maxRadius = Math.floor(Math.random() * 3) + 1; // 1-3 radius
            const angleStep = Math.floor(Math.random() * 30) + 30; // 30-60 degree steps
            
            for (let radius = 1; radius <= maxRadius; radius++) {
                for (let angle = 0; angle < 360; angle += angleStep) {
                    const x = focalX + Math.cos(angle * Math.PI / 180) * radius;
                    const y = focalY + Math.sin(angle * Math.PI / 180) * radius;
                    
                    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                        const color = this.retrowavePalettes[this.retroPalette][
                            Math.floor(Math.random() * this.retrowavePalettes[this.retroPalette].length)
                        ];
                        this.setPixel(Math.floor(x), Math.floor(y), {
                            color: color,
                            type: focalType
                        });
                    }
                }
            }
        }
        
        this.updateModeIndicator('Epic randomness generated!');
    }

    generateEnergyCorridor() {
        const startX = Math.floor(Math.random() * this.gridWidth);
        const startY = Math.floor(Math.random() * this.gridHeight);
        const endX = Math.floor(Math.random() * this.gridWidth);
        const endY = Math.floor(Math.random() * this.gridHeight);
        
        const steps = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
        
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const x = Math.floor(startX + (endX - startX) * t);
            const y = Math.floor(startY + (endY - startY) * t);
            
            // Main corridor
            this.setPixel(x, y, {
                color: '#00ffff',
                type: 'lightning'
            });
            
            // Side effects
            for (let j = 0; j < 3; j++) {
                const offsetX = x + Math.floor(Math.random() * 3) - 1;
                const offsetY = y + Math.floor(Math.random() * 3) - 1;
                
                if (offsetX >= 0 && offsetX < this.gridWidth && offsetY >= 0 && offsetY < this.gridHeight) {
                    this.setPixel(offsetX, offsetY, {
                        color: '#8000ff',
                        type: 'particle'
                    });
                }
            }
        }
    }

    generateRealityTear() {
        const centerX = Math.floor(Math.random() * this.gridWidth);
        const centerY = Math.floor(Math.random() * this.gridHeight);
        const length = Math.floor(Math.random() * 20) + 10;
        const angle = Math.random() * Math.PI * 2;
        
        for (let i = 0; i < length; i++) {
            const x = Math.floor(centerX + Math.cos(angle) * i);
            const y = Math.floor(centerY + Math.sin(angle) * i);
            
            if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                this.setPixel(x, y, {
                    color: '#ff0080',
                    type: 'temporal'
                });
                
                // Distortion effects around tear
                for (let j = 0; j < 2; j++) {
                    const distortX = x + Math.floor(Math.random() * 3) - 1;
                    const distortY = y + Math.floor(Math.random() * 3) - 1;
                    
                    if (distortX >= 0 && distortX < this.gridWidth && distortY >= 0 && distortY < this.gridHeight) {
                        this.setPixel(distortX, distortY, {
                            color: '#ff4080',
                            type: 'distort'
                        });
                    }
                }
            }
        }
    }

    clearCanvas() {
        this.initializePixels();
        this.history.saveState();
        this.updateModeIndicator('Canvas cleared!');
    }

    // Geometric construct generation
    drawGeometricConstruct(type, centerX = null, centerY = null) {
        centerX = centerX || Math.floor(this.gridWidth / 2);
        centerY = centerY || Math.floor(this.gridHeight / 2);
        
        switch(type) {
            case 'fractal':
                this.drawFractal(centerX, centerY);
                break;
            case 'mandala':
                this.drawMandala(centerX, centerY);
                break;
            case 'spiral':
                this.drawSpiral(centerX, centerY);
                break;
            case 'matrix':
                this.drawMatrix(centerX, centerY);
                break;
            case 'hexagon':
                this.drawHexagon(centerX, centerY);
                break;
            case 'crystal':
                this.drawCrystal(centerX, centerY);
                break;
            case 'circuit':
                this.drawCircuit(centerX, centerY);
                break;
            case 'flower':
                this.drawFlower(centerX, centerY);
                break;
            case 'galaxy':
                this.drawGalaxy(centerX, centerY);
                break;
        }
        
        this.history.saveState();
        this.updateModeIndicator(`${type.charAt(0).toUpperCase() + type.slice(1)} construct generated!`);
    }

    drawFractal(centerX, centerY) {
        const iterations = 5;
        const branches = 4;
        
        this.drawFractalBranch(centerX, centerY, 8, 0, iterations, branches);
    }

    drawFractalBranch(x, y, length, angle, iterations, branches) {
        if (iterations <= 0 || length < 1) return;
        
        const endX = x + Math.cos(angle) * length;
        const endY = y + Math.sin(angle) * length;
        
        // Draw line
        const steps = Math.floor(length);
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const pixelX = Math.floor(x + (endX - x) * t);
            const pixelY = Math.floor(y + (endY - y) * t);
            
            if (pixelX >= 0 && pixelX < this.gridWidth && pixelY >= 0 && pixelY < this.gridHeight) {
                this.setPixel(pixelX, pixelY, {
                    color: '#00ff80',
                    type: 'fractal'
                });
            }
        }
        
        // Recursive branches
        for (let i = 0; i < branches; i++) {
            const newAngle = angle + (Math.PI / 4) * (i - branches / 2);
            this.drawFractalBranch(endX, endY, length * 0.7, newAngle, iterations - 1, Math.max(1, branches - 1));
        }
    }

    drawMandala(centerX, centerY) {
        const layers = 5;
        const petals = 8;
        
        for (let layer = 1; layer <= layers; layer++) {
            const radius = layer * 3;
            
            for (let petal = 0; petal < petals; petal++) {
                const angle = (petal / petals) * Math.PI * 2;
                
                for (let r = 1; r <= radius; r++) {
                    const x = Math.floor(centerX + Math.cos(angle) * r);
                    const y = Math.floor(centerY + Math.sin(angle) * r);
                    
                    if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                        this.setPixel(x, y, {
                            color: layer % 2 === 0 ? '#ff0080' : '#8000ff',
                            type: 'quantum'
                        });
                    }
                }
            }
        }
    }

    drawSpiral(centerX, centerY) {
        const maxRadius = 15;
        const turns = 3;
        
        for (let i = 0; i < 200; i++) {
            const t = i / 200;
            const angle = t * turns * Math.PI * 2;
            const radius = t * maxRadius;
            
            const x = Math.floor(centerX + Math.cos(angle) * radius);
            const y = Math.floor(centerY + Math.sin(angle) * radius);
            
            if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                this.setPixel(x, y, {
                    color: `hsl(${t * 360}, 100%, 50%)`,
                    type: 'particle'
                });
            }
        }
    }

    drawMatrix(centerX, centerY) {
        const size = 10;
        
        for (let x = centerX - size; x <= centerX + size; x += 2) {
            for (let y = centerY - size; y <= centerY + size; y += 2) {
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    this.setPixel(x, y, {
                        color: '#00ff00',
                        type: 'static'
                    });
                }
            }
        }
    }

    drawHexagon(centerX, centerY) {
        const radius = 8;
        const sides = 6;
        
        for (let side = 0; side < sides; side++) {
            const angle1 = (side / sides) * Math.PI * 2;
            const angle2 = ((side + 1) / sides) * Math.PI * 2;
            
            const x1 = centerX + Math.cos(angle1) * radius;
            const y1 = centerY + Math.sin(angle1) * radius;
            const x2 = centerX + Math.cos(angle2) * radius;
            const y2 = centerY + Math.sin(angle2) * radius;
            
            const steps = Math.floor(Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2));
            
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                const x = Math.floor(x1 + (x2 - x1) * t);
                const y = Math.floor(y1 + (y2 - y1) * t);
                
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    this.setPixel(x, y, {
                        color: '#ffff00',
                        type: 'lightning'
                    });
                }
            }
        }
    }

    drawCrystal(centerX, centerY) {
        const points = [
            [0, -10], [6, -3], [6, 3], [0, 10], [-6, 3], [-6, -3]
        ];
        
        for (let i = 0; i < points.length; i++) {
            const [x1, y1] = points[i];
            const [x2, y2] = points[(i + 1) % points.length];
            
            const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
            
            for (let j = 0; j <= steps; j++) {
                const t = j / steps;
                const x = Math.floor(centerX + x1 + (x2 - x1) * t);
                const y = Math.floor(centerY + y1 + (y2 - y1) * t);
                
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    this.setPixel(x, y, {
                        color: '#00ffff',
                        type: 'spectrum'
                    });
                }
            }
        }
    }

    drawCircuit(centerX, centerY) {
        // Horizontal and vertical lines
        for (let i = -8; i <= 8; i += 4) {
            // Horizontal
            for (let x = centerX - 8; x <= centerX + 8; x++) {
                if (x >= 0 && x < this.gridWidth) {
                    const y = centerY + i;
                    if (y >= 0 && y < this.gridHeight) {
                        this.setPixel(x, y, {
                            color: '#ff8000',
                            type: 'lightning'
                        });
                    }
                }
            }
            
            // Vertical
            for (let y = centerY - 8; y <= centerY + 8; y++) {
                if (y >= 0 && y < this.gridHeight) {
                    const x = centerX + i;
                    if (x >= 0 && x < this.gridWidth) {
                        this.setPixel(x, y, {
                            color: '#ff8000',
                            type: 'lightning'
                        });
                    }
                }
            }
        }
        
        // Connection nodes
        for (let i = -8; i <= 8; i += 4) {
            for (let j = -8; j <= 8; j += 4) {
                const x = centerX + i;
                const y = centerY + j;
                
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    this.setPixel(x, y, {
                        color: '#ffff00',
                        type: 'nova'
                    });
                }
            }
        }
    }

    drawFlower(centerX, centerY) {
        const petals = 8;
        const petalLength = 6;
        
        for (let petal = 0; petal < petals; petal++) {
            const angle = (petal / petals) * Math.PI * 2;
            
            for (let r = 1; r <= petalLength; r++) {
                // Main petal line
                const x = Math.floor(centerX + Math.cos(angle) * r);
                const y = Math.floor(centerY + Math.sin(angle) * r);
                
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    this.setPixel(x, y, {
                        color: '#ff4080',
                        type: 'quantum'
                    });
                }
                
                // Petal width
                if (r > 2) {
                    const sideAngle1 = angle + 0.3;
                    const sideAngle2 = angle - 0.3;
                    const sideR = r * 0.7;
                    
                    const x1 = Math.floor(centerX + Math.cos(sideAngle1) * sideR);
                    const y1 = Math.floor(centerY + Math.sin(sideAngle1) * sideR);
                    const x2 = Math.floor(centerX + Math.cos(sideAngle2) * sideR);
                    const y2 = Math.floor(centerY + Math.sin(sideAngle2) * sideR);
                    
                    if (x1 >= 0 && x1 < this.gridWidth && y1 >= 0 && y1 < this.gridHeight) {
                        this.setPixel(x1, y1, {
                            color: '#ff80c0',
                            type: 'particle'
                        });
                    }
                    
                    if (x2 >= 0 && x2 < this.gridWidth && y2 >= 0 && y2 < this.gridHeight) {
                        this.setPixel(x2, y2, {
                            color: '#ff80c0',
                            type: 'particle'
                        });
                    }
                }
            }
        }
        
        // Center
        this.setPixel(centerX, centerY, {
            color: '#ffff00',
            type: 'nova'
        });
    }

    drawGalaxy(centerX, centerY) {
        const arms = 3;
        const armLength = 12;
        
        for (let arm = 0; arm < arms; arm++) {
            const baseAngle = (arm / arms) * Math.PI * 2;
            
            for (let i = 0; i < 30; i++) {
                const t = i / 30;
                const angle = baseAngle + t * Math.PI * 2;
                const radius = t * armLength;
                
                const x = Math.floor(centerX + Math.cos(angle) * radius);
                const y = Math.floor(centerY + Math.sin(angle) * radius);
                
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    const color = t < 0.3 ? '#ffffff' : t < 0.6 ? '#ffff80' : '#ff8000';
                    this.setPixel(x, y, {
                        color: color,
                        type: t < 0.5 ? 'nova' : 'particle'
                    });
                }
                
                // Star scatter
                if (Math.random() < 0.3) {
                    const scatterX = x + Math.floor(Math.random() * 3) - 1;
                    const scatterY = y + Math.floor(Math.random() * 3) - 1;
                    
                    if (scatterX >= 0 && scatterX < this.gridWidth && scatterY >= 0 && scatterY < this.gridHeight) {
                        this.setPixel(scatterX, scatterY, {
                            color: '#ffffff',
                            type: 'quantum'
                        });
                    }
                }
            }
        }
        
        // Galactic core
        for (let r = 1; r <= 3; r++) {
            for (let angle = 0; angle < 360; angle += 45) {
                const x = Math.floor(centerX + Math.cos(angle * Math.PI / 180) * r);
                const y = Math.floor(centerY + Math.sin(angle * Math.PI / 180) * r);
                
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    this.setPixel(x, y, {
                        color: '#ff0080',
                        type: 'vortex'
                    });
                }
            }
        }
    }

    // Background generators
    generateBackground(type) {
        switch(type) {
            case 'cybermesh':
                this.generateCyberMesh();
                break;
            case 'neuralnet':
                this.generateNeuralNet();
                break;
            case 'datamatrix':
                this.generateDataMatrix();
                break;
            case 'circuitboard':
                this.generateCircuitBoard();
                break;
            case 'hexgrid':
                this.generateHexGrid();
                break;
            case 'starfield':
                this.generateStarField();
                break;
        }
        
        this.history.saveState();
        this.updateModeIndicator(`${type.charAt(0).toUpperCase() + type.slice(1)} background generated!`);
    }

    generateCyberMesh() {
        const gridSize = 15;
        
        for (let x = 0; x < this.gridWidth; x += gridSize) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (y >= 0 && y < this.gridHeight) {
                    this.setPixel(x, y, {
                        color: '#004080',
                        type: 'static'
                    });
                }
            }
        }
        
        for (let y = 0; y < this.gridHeight; y += gridSize) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (x >= 0 && x < this.gridWidth) {
                    this.setPixel(x, y, {
                        color: '#004080',
                        type: 'static'
                    });
                }
            }
        }
        
        // Intersection points
        for (let x = 0; x < this.gridWidth; x += gridSize) {
            for (let y = 0; y < this.gridHeight; y += gridSize) {
                if (Math.random() < 0.3) {
                    this.setPixel(x, y, {
                        color: '#00ffff',
                        type: 'lightning'
                    });
                }
            }
        }
    }

    generateNeuralNet() {
        // Nodes
        const nodes = [];
        const nodeCount = 20;
        
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.floor(Math.random() * this.gridWidth),
                y: Math.floor(Math.random() * this.gridHeight)
            });
        }
        
        // Connections
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const distance = Math.sqrt(
                    (nodes[i].x - nodes[j].x) ** 2 + (nodes[i].y - nodes[j].y) ** 2
                );
                
                if (distance < 30 && Math.random() < 0.4) {
                    const steps = Math.floor(distance);
                    
                    for (let step = 0; step <= steps; step++) {
                        const t = step / steps;
                        const x = Math.floor(nodes[i].x + (nodes[j].x - nodes[i].x) * t);
                        const y = Math.floor(nodes[i].y + (nodes[j].y - nodes[i].y) * t);
                        
                        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                            this.setPixel(x, y, {
                                color: '#8000ff',
                                type: 'particle'
                            });
                        }
                    }
                }
            }
        }
        
        // Render nodes
        nodes.forEach(node => {
            this.setPixel(node.x, node.y, {
                color: '#ff0080',
                type: 'nova'
            });
        });
    }

    generateDataMatrix() {
        for (let x = 0; x < this.gridWidth; x += 8) {
            for (let y = 0; y < this.gridHeight; y += 8) {
                if (Math.random() < 0.6) {
                    const blockSize = Math.floor(Math.random() * 4) + 2;
                    
                    for (let bx = 0; bx < blockSize && x + bx < this.gridWidth; bx++) {
                        for (let by = 0; by < blockSize && y + by < this.gridHeight; by++) {
                            this.setPixel(x + bx, y + by, {
                                color: '#00ff40',
                                type: 'static'
                            });
                        }
                    }
                }
            }
        }
    }

    generateCircuitBoard() {
        // Horizontal traces
        for (let y = 5; y < this.gridHeight; y += 10) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (Math.random() < 0.8) {
                    this.setPixel(x, y, {
                        color: '#ff8000',
                        type: 'lightning'
                    });
                }
            }
        }
        
        // Vertical traces
        for (let x = 5; x < this.gridWidth; x += 10) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (Math.random() < 0.8) {
                    this.setPixel(x, y, {
                        color: '#ff8000',
                        type: 'lightning'
                    });
                }
            }
        }
        
        // Components
        for (let x = 5; x < this.gridWidth; x += 20) {
            for (let y = 5; y < this.gridHeight; y += 20) {
                if (Math.random() < 0.5) {
                    // Component body
                    for (let cx = -2; cx <= 2; cx++) {
                        for (let cy = -1; cy <= 1; cy++) {
                            if (x + cx >= 0 && x + cx < this.gridWidth && 
                                y + cy >= 0 && y + cy < this.gridHeight) {
                                this.setPixel(x + cx, y + cy, {
                                    color: '#404040',
                                    type: 'static'
                                });
                            }
                        }
                    }
                    
                    // Component pins
                    this.setPixel(x - 3, y, { color: '#ffff00', type: 'nova' });
                    this.setPixel(x + 3, y, { color: '#ffff00', type: 'nova' });
                }
            }
        }
    }

    generateHexGrid() {
        const hexSize = 8;
        const hexHeight = hexSize * Math.sqrt(3);
        
        for (let row = 0; row < this.gridHeight / hexHeight; row++) {
            for (let col = 0; col < this.gridWidth / (hexSize * 1.5); col++) {
                const x = col * hexSize * 1.5;
                const y = row * hexHeight + (col % 2) * hexHeight / 2;
                
                if (Math.random() < 0.3) {
                    this.drawHexagon(Math.floor(x), Math.floor(y));
                }
            }
        }
    }

    generateStarField() {
        const starCount = Math.floor(Math.random() * 100) + 50;
        
        for (let i = 0; i < starCount; i++) {
            const x = Math.floor(Math.random() * this.gridWidth);
            const y = Math.floor(Math.random() * this.gridHeight);
            const intensity = Math.random();
            
            let color, type;
            
            if (intensity > 0.9) {
                color = '#ffffff';
                type = 'nova';
            } else if (intensity > 0.7) {
                color = '#ffff80';
                type = 'quantum';
            } else if (intensity > 0.4) {
                color = '#8080ff';
                type = 'particle';
            } else {
                color = '#404080';
                type = 'static';
            }
            
            this.setPixel(x, y, { color, type });
            
            // Larger stars get halos
            if (intensity > 0.8) {
                for (let dx = -1; dx <= 1; dx++) {
                    for (let dy = -1; dy <= 1; dy++) {
                        if (dx !== 0 || dy !== 0) {
                            const haloX = x + dx;
                            const haloY = y + dy;
                            
                            if (haloX >= 0 && haloX < this.gridWidth && 
                                haloY >= 0 && haloY < this.gridHeight && 
                                Math.random() < 0.3) {
                                this.setPixel(haloX, haloY, {
                                    color: '#404080',
                                    type: 'quantum'
                                });
                            }
                        }
                    }
                }
            }
        }
    }

    drawGrid() {
        this.gridCtx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
        this.gridCtx.strokeStyle = 'rgba(0, 255, 65, 0.1)';
        this.gridCtx.lineWidth = 1;
        
        for (let x = 0; x <= this.gridWidth; x++) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(x * this.pixelSize, 0);
            this.gridCtx.lineTo(x * this.pixelSize, this.canvas.height);
            this.gridCtx.stroke();
        }
        
        for (let y = 0; y <= this.gridHeight; y++) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(0, y * this.pixelSize);
            this.gridCtx.lineTo(this.canvas.width, y * this.pixelSize);
            this.gridCtx.stroke();
        }
    }

    animate() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdate;
        
        if (deltaTime >= 66) { // ~15 FPS for animations
            this.animationTime += deltaTime * 0.001;
            this.renderFrame();
            this.lastUpdate = currentTime;
        }
        
        requestAnimationFrame(() => this.animate());
    }

    renderFrame() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                const pixel = this.pixels[y][x];
                if (pixel) {
                    this.drawPixel(x, y, pixel);
                }
            }
        }
        
        // Add frame to GIF if recording
        if (this.recording && this.recordingFrames < this.maxFrames) {
            if (this.recordingFrames % 4 === 0) { // 15fps (every 4th frame of 60fps)
                this.gif.addFrame(this.canvas, { delay: 66 });
            }
            this.recordingFrames++;
            
            if (this.recordingFrames >= this.maxFrames) {
                this.stopRecording();
            }
        }
    }

    drawPixel(x, y, pixel) {
        const screenX = x * this.pixelSize;
        const screenY = y * this.pixelSize;
        
        let color = pixel.color;
        
        // Color cycling
        if (this.colorCycling && this.animatedTypes.has(pixel.type)) {
            const hue = (Date.now() * 0.1 + x * 10 + y * 10) % 360;
            color = `hsl(${hue}, 100%, 50%)`;
        }
        
        // Animated effects
        if (this.animatedTypes.has(pixel.type)) {
            color = this.applyPixelAnimation(pixel, color, x, y);
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(screenX, screenY, this.pixelSize, this.pixelSize);
    }

    applyPixelAnimation(pixel, baseColor, x, y) {
        const time = this.animationTime;
        const localTime = time + x * 0.1 + y * 0.1;
        
        switch(pixel.type) {
            case 'quantum':
                if (Math.sin(localTime * 4) > 0.5) {
                    const particles = Math.floor(Math.random() * 3);
                    return particles > 0 ? baseColor : 'rgba(0,0,0,0)';
                }
                return baseColor;
                
            case 'chaos':
                if (Math.random() < 0.3) {
                    const colors = ['#ff0040', '#ff8000', '#ffff00', '#00ff80', '#0080ff', '#8000ff'];
                    return colors[Math.floor(Math.random() * colors.length)];
                }
                return baseColor;
                
            case 'flicker':
                return Math.sin(localTime * 8) > 0 ? baseColor : 'rgba(0,0,0,0)';
                
            case 'strobe':
                return Math.sin(localTime * 12) > 0.8 ? '#ffffff' : baseColor;
                
            case 'static':
                if (Math.random() < 0.4) {
                    const intensity = Math.random();
                    return `rgba(${intensity * 255}, ${intensity * 255}, ${intensity * 255}, 1)`;
                }
                return baseColor;
                
            case 'distort':
                const distortHue = (time * 100 + x * 20 + y * 20) % 360;
                return `hsl(${distortHue}, 100%, ${50 + Math.sin(localTime * 6) * 30}%)`;
                
            case 'particle':
                const flow = Math.sin(localTime * 2 + x * 0.5) * Math.cos(localTime * 2 + y * 0.5);
                return flow > 0.3 ? baseColor : 'rgba(0,0,0,0)';
                
            case 'lightning':
                if (Math.random() < 0.1) {
                    return '#ffffff';
                }
                return Math.sin(localTime * 10) > 0.7 ? baseColor : 'rgba(0,0,0,0)';
                
            case 'temporal':
                const phase = Math.sin(localTime * 3) * 0.5 + 0.5;
                return `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(baseColor.slice(5, 7), 16)}, ${phase})`;
                
            case 'nova':
                const pulse = Math.sin(localTime * 6) * 0.3 + 0.7;
                const nova = Math.floor(255 * pulse);
                return `rgb(${nova}, ${nova}, ${nova})`;
                
            case 'fractal':
                const fractalPhase = (time * 2 + x * 0.2 + y * 0.2) % 1;
                return fractalPhase < 0.5 ? baseColor : '#404040';
                
            case 'phantom':
                const echo = Math.sin(localTime * 4 - Math.sqrt(x*x + y*y) * 0.5) * 0.4 + 0.6;
                return `rgba(${parseInt(baseColor.slice(1, 3), 16)}, ${parseInt(baseColor.slice(3, 5), 16)}, ${parseInt(baseColor.slice(5, 7), 16)}, ${echo})`;
                
            case 'surge':
                const wave = Math.sin(localTime * 5 + x * 0.3) * 0.5 + 0.5;
                return wave > 0.6 ? '#ffffff' : baseColor;
                
            case 'cascade':
                const cascade = Math.sin(localTime * 3 + y * 0.4) * 0.4 + 0.6;
                return `rgba(${parseInt(baseColor.slice(1, 3), 16) * cascade}, ${parseInt(baseColor.slice(3, 5), 16) * cascade}, ${parseInt(baseColor.slice(5, 7), 16) * cascade}, 1)`;
                
            case 'vortex':
                const angle = Math.atan2(y - this.gridHeight/2, x - this.gridWidth/2);
                const radius = Math.sqrt((x - this.gridWidth/2)**2 + (y - this.gridHeight/2)**2);
                const spiral = Math.sin(angle * 3 + radius * 0.3 - localTime * 4);
                return spiral > 0.3 ? baseColor : 'rgba(0,0,0,0)';
                
            case 'spectrum':
                const spectrumHue = (localTime * 60 + x * 5 + y * 5) % 360;
                return `hsl(${spectrumHue}, 100%, 60%)`;
                
            default:
                return baseColor;
        }
    }
}

// Auto-redirect to mobile version for mobile devices
function checkMobileAndRedirect() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?=.*Mobile)/i.test(navigator.userAgent);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const smallScreen = window.innerWidth < 768;
    
    if ((isMobile || (hasTouch && smallScreen)) && !isTablet && !window.location.pathname.includes('/mobile')) {
        // Show redirect message
        document.body.innerHTML = `
            <div style="
                display: flex; 
                flex-direction: column; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                background: linear-gradient(45deg, #0a0a23, #1a1a2e, #16213e);
                color: #00ff41;
                font-family: 'Orbitron', monospace;
                text-align: center;
                padding: 20px;
            ">
                <h1 style="font-size: 2em; margin-bottom: 20px;">🚀 Redirecting to Mobile...</h1>
                <p style="font-size: 1.2em; margin-bottom: 30px;">Optimized touch experience loading...</p>
                <div style="
                    width: 50px; 
                    height: 50px; 
                    border: 3px solid #00ff41; 
                    border-top: 3px solid transparent; 
                    border-radius: 50%; 
                    animation: spin 1s linear infinite;
                "></div>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
        
        setTimeout(() => {
            window.location.href = '/mobile';
        }, 2000);
        return true;
    }
    return false;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    if (!checkMobileAndRedirect()) {
        new PixelCollageBuilder();
    }
});
