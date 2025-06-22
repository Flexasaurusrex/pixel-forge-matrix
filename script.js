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
        console.log('🎯 Initializing Pixel Forge Matrix...');
        
        // Get canvas elements
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridCanvas = document.getElementById('gridOverlay');
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
        this.showGrid = true;
        
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
        
        // Initialize everything
        this.initializePixels();
        this.generatePixelLibrary();
        this.generateSpriteLibrary();
        this.generatePatternLibrary();
        this.generateColorPicker();
        this.setupEventListeners();
        this.setupKeyboardShortcuts();
        this.drawGrid();
        this.animate();
        this.startFpsCounter();
        
        // Update UI
        this.updateToolIndicator();
        this.updateModeIndicator('Ready to create!');
        this.updatePixelCount();
        
        console.log('✅ Pixel Forge Matrix initialized successfully!');
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

    generatePixelLibrary() {
        const library = document.getElementById('pixelLibrary');
        if (!library) return;
        
        const pixelTypes = [
            { type: 'quantum', char: '⚛', color: '#00ff41', desc: 'QUANTUM DOT' },
            { type: 'chaos', char: '※', color: '#ff006e', desc: 'CHAOS FIELD' },
            { type: 'flicker', char: '◈', color: '#00f5ff', desc: 'FLICKER STORM' },
            { type: 'strobe', char: '⚡', color: '#ffff00', desc: 'STROBE PULSE' },
            { type: 'static', char: '▣', color: '#ff4081', desc: 'STATIC BURST' },
            { type: 'distort', char: '◉', color: '#9c27b0', desc: 'REALITY TEAR' },
            { type: 'particle', char: '⬢', color: '#4caf50', desc: 'PARTICLE FLUX' },
            { type: 'lightning', char: '⟡', color: '#ff9800', desc: 'LIGHTNING ARC' },
            { type: 'temporal', char: '◎', color: '#03dac6', desc: 'TIME RIFT' },
            { type: 'nova', char: '※', color: '#607d8b', desc: 'NOVA BURST' },
            { type: 'fractal', char: '◊', color: '#795548', desc: 'FRACTAL NOISE' },
            { type: 'phantom', char: '⬡', color: '#e91e63', desc: 'PHANTOM ECHO' },
            { type: 'surge', char: '⚡', color: '#2196f3', desc: 'ENERGY SURGE' },
            { type: 'cascade', char: '◈', color: '#00bcd4', desc: 'CASCADE WAVE' },
            { type: 'vortex', char: '◉', color: '#8b00ff', desc: 'VOID VORTEX' },
            { type: 'spectrum', char: '⬢', color: '#ffc107', desc: 'SPECTRUM SHIFT' }
        ];
        
        pixelTypes.forEach((pixel, index) => {
            const item = document.createElement('div');
            item.className = 'pixel-item';
            item.innerHTML = `
                <div style="font-size: 20px; color: ${pixel.color}">${pixel.char}</div>
                <div style="font-size: 8px; color: #666; margin-top: 2px;">${pixel.desc}</div>
            `;
            item.dataset.type = pixel.type;
            item.addEventListener('click', () => this.selectPixelType(pixel.type, item));
            library.appendChild(item);
            
            if (index === 0) {
                item.classList.add('selected');
            }
        });
    }

    generateSpriteLibrary() {
        const library = document.getElementById('spriteLibrary');
        if (!library) return;
        
        const sprites = [
            { name: 'fractal', pattern: '◈◇◈', description: 'FRACTAL' },
            { name: 'mandala', pattern: '※◆※', description: 'MANDALA' },
            { name: 'spiral', pattern: '◉◎◉', description: 'SPIRAL' },
            { name: 'matrix', pattern: '▣▢▣', description: 'MATRIX' },
            { name: 'hexagon', pattern: '⬡⬢⬡', description: 'HEXAGON' },
            { name: 'crystal', pattern: '◊♦◊', description: 'CRYSTAL' },
            { name: 'circuit', pattern: '┼┿┼', description: 'CIRCUIT' },
            { name: 'flower', pattern: '✿❀✿', description: 'FLOWER' },
            { name: 'galaxy', pattern: '✦※✦', description: 'GALAXY' }
        ];
        
        sprites.forEach(sprite => {
            const item = document.createElement('div');
            item.className = 'sprite-item';
            item.innerHTML = `
                <div style="color: #00ff41; font-size: 14px;">${sprite.pattern}</div>
                <div style="color: #00ff41; font-size: 10px; margin-top: 2px;">${sprite.description}</div>
            `;
            item.dataset.sprite = sprite.name;
            item.addEventListener('click', () => this.selectSprite(sprite.name, item));
            library.appendChild(item);
        });
    }

    generatePatternLibrary() {
        const library = document.getElementById('patternLibrary');
        if (!library) return;
        
        const patterns = [
            { name: 'cybermesh', pattern: '▦▦▦', description: 'CYBER MESH', color: '#00ff41' },
            { name: 'neuralnet', pattern: '◈◇◈', description: 'NEURAL NET', color: '#ff006e' },
            { name: 'datamatrix', pattern: '■□■', description: 'DATA MATRIX', color: '#00f5ff' },
            { name: 'circuitboard', pattern: '┼╋┼', description: 'CIRCUIT BOARD', color: '#ffff00' },
            { name: 'hexgrid', pattern: '⬢⬡⬢', description: 'HEX GRID', color: '#ff4081' },
            { name: 'starfield', pattern: '✦✧✦', description: 'STAR FIELD', color: '#9c27b0' }
        ];
        
        patterns.forEach(pattern => {
            const item = document.createElement('div');
            item.className = 'sprite-item';
            item.innerHTML = `
                <div style="color: ${pattern.color}; font-size: 14px;">${pattern.pattern}</div>
                <div style="color: #ff006e; font-size: 10px; margin-top: 2px;">${pattern.description}</div>
            `;
            item.dataset.pattern = pattern.name;
            item.addEventListener('click', () => this.selectPattern(pattern.name, item));
            library.appendChild(item);
        });
    }

    generateColorPicker() {
        const picker = document.getElementById('colorPicker');
        if (!picker) return;
        
        const colors = [
            '#00ff41', '#ff006e', '#00f5ff', '#ffff00',
            '#ff4081', '#4caf50', '#ff9800', '#9c27b0',
            '#03dac6', '#607d8b', '#795548', '#e91e63',
            '#000000', '#ffffff', '#808080', '#ff0000',
            '#2196f3', '#00bcd4', '#ffc107', '#9e9e9e'
        ];
        
        colors.forEach((color, index) => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.addEventListener('click', () => this.selectColor(color, swatch));
            picker.appendChild(swatch);
            
            if (index === 0) {
                swatch.classList.add('selected');
            }
        });
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        this.canvas.addEventListener('mousemove', (e) => this.updateCoordinates(e));
        
        // Tool buttons
        const safeAddListener = (id, callback) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('click', callback);
            }
        };
        
        safeAddListener('paintTool', () => this.setTool('paint'));
        safeAddListener('eraseTool', () => this.setTool('erase'));
        safeAddListener('fillTool', () => this.setTool('fill'));
        safeAddListener('pickTool', () => this.setTool('sample'));
        safeAddListener('sprayTool', () => this.setTool('spray'));
        
        // Brush size buttons
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setBrushSize(parseInt(e.target.dataset.size), e.target));
        });
        
        // History buttons
        safeAddListener('undoBtn', () => this.history.undo());
        safeAddListener('redoBtn', () => this.history.redo());
        
        // Action buttons
        safeAddListener('retrowaveBtn', () => this.cycleRetrowavePalette());
        safeAddListener('colorCycleBtn', () => this.toggleColorCycling());
        safeAddListener('recordGifBtn', () => this.toggleRecording());
        safeAddListener('randomize', () => this.epicRandomize());
        safeAddListener('clearCanvas', () => this.clearCanvas());
        safeAddListener('toggleGrid', () => this.toggleGrid());
        safeAddListener('saveImage', () => this.saveImage());
        
        // Story Mode button
        const storyModeBtn = document.getElementById('storyModeBtn');
        if (storyModeBtn) {
            storyModeBtn.addEventListener('click', () => this.launchStoryMode());
        }
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

    selectPixelType(type, element) {
        document.querySelectorAll('#pixelLibrary .pixel-item').forEach(item => {
            item.classList.remove('selected');
        });
        element.classList.add('selected');
        this.currentPixelType = type;
        this.updateToolIndicator();
    }

    selectSprite(sprite, element) {
        document.querySelectorAll('#spriteLibrary .sprite-item').forEach(item => {
            item.classList.remove('selected');
        });
        element.classList.add('selected');
        const centerX = Math.floor(this.gridWidth / 2);
        const centerY = Math.floor(this.gridHeight / 2);
        this.drawGeometricConstruct(sprite, centerX, centerY);
    }

    selectPattern(pattern, element) {
        document.querySelectorAll('#patternLibrary .sprite-item').forEach(item => {
            item.classList.remove('selected');
        });
        element.classList.add('selected');
        this.generateBackground(pattern);
    }

    selectColor(color, element) {
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('selected');
        });
        element.classList.add('selected');
        this.currentColor = color;
    }

    setTool(tool) {
        this.currentTool = tool;
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const toolBtn = document.getElementById(tool + 'Tool');
        if (toolBtn) {
            toolBtn.classList.add('active');
        }
        this.updateToolIndicator();
        this.updateModeIndicator(`${tool.toUpperCase()} MODE`);
    }

    setBrushSize(size, element) {
        this.currentBrushSize = size;
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        if (element) {
            element.classList.add('active');
        }
        this.updateToolIndicator();
    }

    setPixelType(type) {
        this.currentPixelType = type;
        this.updateToolIndicator();
    }

    updateToolIndicator() {
        const indicator = document.getElementById('toolIndicator');
        if (indicator) {
            indicator.textContent = `${this.currentTool.toUpperCase()} | ${this.currentPixelType.toUpperCase()} | Size: ${this.currentBrushSize}`;
        }
    }

    updateModeIndicator(message) {
        const indicator = document.getElementById('modeIndicator');
        if (indicator) {
            indicator.textContent = message;
        }
    }

    updateCoordinates(e) {
        const pos = this.getMousePos(e);
        const coordsElement = document.getElementById('coords');
        if (coordsElement) {
            coordsElement.textContent = `${pos.x}, ${pos.y}`;
        }
    }

    updatePixelCount() {
        let count = 0;
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.pixels[y][x] !== null) count++;
            }
        }
        const pixelCountElement = document.getElementById('pixelCount');
        if (pixelCountElement) {
            pixelCountElement.textContent = count;
        }
    }

    startFpsCounter() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const updateFps = () => {
            frameCount++;
            const now = performance.now();
            
            if (now - lastTime >= 1000) {
                const fpsElement = document.getElementById('fps');
                if (fpsElement) {
                    fpsElement.textContent = frameCount;
                }
                frameCount = 0;
                lastTime = now;
            }
            
            requestAnimationFrame(updateFps);
        };
        
        updateFps();
    }

    // Story Mode methods
    launchStoryMode() {
        this.updateModeIndicator('🌌 LAUNCHING COSMIC STORYTELLER');
        const btn = document.getElementById('storyModeBtn');
        if (btn) {
            btn.style.background = 'linear-gradient(45deg, #ff006e, #8338ec)';
            btn.style.transform = 'scale(0.95)';
        }
        this.createCosmicTransition();
        setTimeout(() => {
            window.location.href = '/storyteller';
        }, 1500);
    }

    createCosmicTransition() {
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
        
        this.updatePixelCount();
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

    cycleRetrowavePalette() {
        this.retroPalette = (this.retroPalette + 1) % this.retrowavePalettes.length;
        this.updateModeIndicator(`Retrowave Palette ${this.retroPalette + 1} activated!`);
        
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
        this.maxFrames = 60;
        this.updateModeIndicator('🔴 Recording GIF...');
        
        document.getElementById('recordGifBtn').textContent = '⏹️ STOP';
        document.getElementById('recordGifBtn').style.background = 'linear-gradient(45deg, #ff0040, #ff4080)';
    }

    stopRecording() {
        if (this.recording) {
            this.recording = false;
            this.updateModeIndicator('Processing GIF...');
            
            document.getElementById('recordGifBtn').textContent = '📹 RECORD';
            document.getElementById('recordGifBtn').style.background = '';
            
            this.gif.render();
        }
    }

    epicRandomize() {
        this.updateModeIndicator('🎲 Generating epic randomness...');
        this.randomizeCanvas();
        this.history.saveState();
    }

    randomizeCanvas() {
        this.initializePixels();
        
        if (Math.random() < 0.6) {
            const bgTypes = ['cybermesh', 'neuralnet', 'datamatrix', 'circuitboard', 'hexgrid', 'starfield'];
            const bgType = bgTypes[Math.floor(Math.random() * bgTypes.length)];
            this.generateBackground(bgType);
        }
        
        const constructCount = Math.floor(Math.random() * 3) + 1;
        const constructTypes = ['fractal', 'mandala', 'spiral', 'matrix', 'hexagon', 'crystal', 'circuit', 'flower', 'galaxy'];
        
        for (let i = 0; i < constructCount; i++) {
            const construct = constructTypes[Math.floor(Math.random() * constructTypes.length)];
            const x = Math.floor(Math.random() * this.gridWidth);
            const y = Math.floor(Math.random() * this.gridHeight);
            this.drawGeometricConstruct(construct, x, y);
        }
        
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
        
        this.updateModeIndicator('Epic randomness generated!');
        this.updatePixelCount();
    }

    clearCanvas() {
        this.initializePixels();
        this.history.saveState();
        this.updateModeIndicator('Canvas cleared!');
        this.updatePixelCount();
    }

    toggleGrid() {
        this.showGrid = !this.showGrid;
        if (this.showGrid) {
            this.drawGrid();
        } else {
            this.gridCtx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
        }
        this.updateModeIndicator(this.showGrid ? 'Grid enabled!' : 'Grid disabled!');
    }

    saveImage() {
        const link = document.createElement('a');
        link.download = `pixel-forge-creation-${Date.now()}.png`;
        link.href = this.canvas.toDataURL();
        link.click();
        this.updateModeIndicator('Image exported successfully!');
    }

    // Basic implementations for missing methods
    drawGeometricConstruct(type, centerX, centerY) {
        // Simple implementation - just place a small pattern
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                if (Math.abs(dx) + Math.abs(dy) <= 2) {
                    this.setPixel(centerX + dx, centerY + dy, {
                        color: this.currentColor,
                        type: this.currentPixelType
                    });
                }
            }
        }
        this.history.saveState();
        this.updatePixelCount();
    }

    generateBackground(type) {
        // Simple background generation
        for (let x = 0; x < this.gridWidth; x += 10) {
            for (let y = 0; y < this.gridHeight; y += 10) {
                if (Math.random() < 0.3) {
                    this.setPixel(x, y, {
                        color: this.currentColor,
                        type: this.currentPixelType
                    });
                }
            }
        }
        this.history.saveState();
        this.updatePixelCount();
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
        
        if (deltaTime >= 66) {
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
        
        if (this.recording && this.recordingFrames < this.maxFrames) {
            if (this.recordingFrames % 4 === 0) {
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
        
        if (this.colorCycling && this.animatedTypes.has(pixel.type)) {
            const hue = (Date.now() * 0.1 + x * 10 + y * 10) % 360;
            color = `hsl(${hue}, 100%, 50%)`;
        }
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(screenX, screenY, this.pixelSize, this.pixelSize);
    }
}

// Auto-redirect to mobile version for mobile devices
function checkMobileAndRedirect() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTablet = /iPad|Android(?=.*Mobile)/i.test(navigator.userAgent);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const smallScreen = window.innerWidth < 768;
    
    if ((isMobile || (hasTouch && smallScreen)) && !isTablet && !window.location.pathname.includes('/mobile')) {
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
    console.log('🚀 DOM Content Loaded - Starting Pixel Forge Matrix...');
    
    if (!checkMobileAndRedirect()) {
        try {
            console.log('💻 Initializing desktop version...');
            const app = new PixelCollageBuilder();
            window.pixelForge = app;
            console.log('✅ Pixel Forge Matrix ready!');
        } catch (error) {
            console.error('❌ Failed to initialize:', error);
            const errorDiv = document.createElement('div');
            errorDiv.style.cssText = `
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                background: #ff006e; color: white; padding: 20px; border-radius: 10px;
                font-family: 'Orbitron', monospace; text-align: center; z-index: 10000;
            `;
            errorDiv.innerHTML = `
                <h3>⚠️ Initialization Error</h3>
                <p>Check console (F12) for details</p>
                <button onclick="location.reload()" style="background: white; color: #ff006e; border: none; padding: 10px; margin-top: 10px; border-radius: 5px; cursor: pointer;">Reload</button>
            `;
            document.body.appendChild(errorDiv);
        }
    }
});
