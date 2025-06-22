class PixelCollageBuilder {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridCanvas = document.getElementById('gridOverlay');
        this.gridCtx = this.gridCanvas.getContext('2d');
        
        this.pixelSize = 4;
        this.gridSize = 4;
        this.currentTool = 'paint';
        this.currentColor = '#00ff41';
        this.brushSize = 1;
        this.isDrawing = false;
        this.showGrid = true;
        this.pixelCount = 0;
        
        this.gridWidth = this.canvas.width / this.gridSize;
        this.gridHeight = this.canvas.height / this.gridSize;
        
        this.pixels = new Array(this.gridWidth).fill(null).map(() => new Array(this.gridHeight).fill(null));
        
        this.selectedPixelType = 'quantum';
        this.selectedSprite = null;
        this.lastFpsTime = 0;
        this.frameCount = 0;
        this.retrowaveIndex = 0;
        this.colorCycling = false;
        this.cycleTime = 0;
        
        // GIF Recording
        this.recording = false;
        this.gif = null;
        this.recordingFrames = 0;
        this.maxRecordingFrames = 120; // 4 seconds at 30fps
        this.recordingStartTime = 0;
        
        // Retrowave color palettes
        this.retrowavePalettes = [
            {
                name: 'NEON NIGHTS',
                colors: ['#ff006e', '#00f5ff', '#8000ff', '#ff8000', '#00ff80', '#ff0080', '#0080ff', '#ffff00', '#ff4081', '#9c27b0', '#03dac6', '#ff9800', '#000000', '#ffffff', '#808080', '#ff0040', '#40ff80', '#8040ff', '#ff8040', '#4080ff']
            },
            {
                name: 'MIAMI VICE',
                colors: ['#ff1493', '#00ffff', '#ff69b4', '#1e90ff', '#ff6347', '#40e0d0', '#da70d6', '#87ceeb', '#ff7f50', '#20b2aa', '#ff00ff', '#00bfff', '#ff4500', '#48d1cc', '#c71585', '#00ced1', '#ff1493', '#5f9ea0', '#ff6b6b', '#4ecdc4']
            },
            {
                name: 'SYNTHWAVE',
                colors: ['#b967db', '#01cdfe', '#05ffa1', '#b967db', '#fffb96', '#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff', '#06ffa5', '#1d1d1d', '#ffffff', '#ff9500', '#c77dff', '#e0aaff', '#560bad', '#480ca8', '#3c096c', '#240046']
            },
            {
                name: 'CYBERPUNK',
                colors: ['#00ff41', '#ff006e', '#00f5ff', '#ffff00', '#ff4081', '#9c27b0', '#03dac6', '#607d8b', '#ff9800', '#4caf50', '#e91e63', '#2196f3', '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff']
            },
            {
                name: 'OUTRUN',
                colors: ['#ff073a', '#39ff14', '#ff0080', '#00ffff', '#ffff00', '#8a2be2', '#ff4500', '#00ff7f', '#dc143c', '#00bfff', '#ff1493', '#7fff00', '#ff6347', '#40e0d0', '#ff69b4', '#1e90ff', '#ffa500', '#9370db', '#32cd32', '#ff4081']
            }
        ];
        
        // Retrowave cycling colors for animation
        this.retrowaveCycleColors = [
            '#ff006e', '#ff0080', '#ff00ff', '#8000ff', 
            '#0080ff', '#00f5ff', '#00ffff', '#00ff80',
            '#00ff00', '#80ff00', '#ffff00', '#ff8000',
            '#ff4000', '#ff0000', '#ff0040', '#ff0060'
        ];
        
        this.init();
        this.startFpsCounter();
    }
    
    init() {
        this.setupCanvas();
        this.generatePixelLibrary();
        this.generateSpriteLibrary();
        this.generatePatternLibrary();
        this.generateColorPicker();
        this.setupEventListeners();
        this.drawGrid();
        this.updatePixelCount();
        this.startAnimationLoop();
    }
    
    startFpsCounter() {
        const updateFps = () => {
            this.frameCount++;
            const now = performance.now();
            if (now - this.lastFpsTime >= 1000) {
                document.getElementById('fps').textContent = this.frameCount;
                this.frameCount = 0;
                this.lastFpsTime = now;
            }
            requestAnimationFrame(updateFps);
        };
        updateFps();
    }
    
    startAnimationLoop() {
        const animate = () => {
            this.cycleTime += 0.05;
            
            // Redraw time-based pixel effects
            for (let x = 0; x < this.gridWidth; x++) {
                for (let y = 0; y < this.gridHeight; y++) {
                    const pixel = this.pixels[x][y];
                    if (pixel) {
                        // Apply color cycling if enabled
                        if (this.colorCycling) {
                            this.applyColorCycling(x, y, pixel);
                        }
                        
                        // Redraw animated pixel types
                        if (this.isAnimatedPixelType(pixel.type)) {
                            this.clearPixel(x, y);
                            this.drawPixel(x, y);
                        }
                    }
                }
            }
            
            // Capture frame for GIF recording
            if (this.recording) {
                this.captureGifFrame();
            }
            
            requestAnimationFrame(animate);
        };
        animate();
    }
    
    setupCanvas() {
        this.canvas.style.imageRendering = 'pixelated';
        this.ctx.imageSmoothingEnabled = false;
    }
    
    generatePixelLibrary() {
        const library = document.getElementById('pixelLibrary');
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
        
        pixelTypes.forEach(pixel => {
            const item = document.createElement('div');
            item.className = 'pixel-item';
            item.innerHTML = `<div style="font-size: 20px; color: ${pixel.color}">${pixel.char}</div><div style="font-size: 8px; color: #666; margin-top: 2px;">${pixel.desc}</div>`;
            item.dataset.type = pixel.type;
            item.addEventListener('click', () => this.selectPixelType(pixel.type, item));
            library.appendChild(item);
        });
        
        library.children[0].classList.add('selected');
    }
    
    generateSpriteLibrary() {
        const library = document.getElementById('spriteLibrary');
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
            
            const preview = document.createElement('div');
            preview.className = 'preview';
            preview.textContent = sprite.pattern;
            preview.style.color = this.getRandomColor();
            
            const label = document.createElement('div');
            label.textContent = sprite.description;
            label.style.color = '#00ff41';
            
            item.appendChild(preview);
            item.appendChild(label);
            item.dataset.sprite = sprite.name;
            item.addEventListener('click', () => this.selectSprite(sprite.name, item));
            library.appendChild(item);
        });
    }
    
    generatePatternLibrary() {
        const library = document.getElementById('patternLibrary');
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
            
            const preview = document.createElement('div');
            preview.className = 'preview';
            preview.textContent = pattern.pattern;
            preview.style.color = pattern.color;
            
            const label = document.createElement('div');
            label.textContent = pattern.description;
            label.style.color = '#ff006e';
            
            item.appendChild(preview);
            item.appendChild(label);
            item.dataset.pattern = pattern.name;
            item.addEventListener('click', () => this.selectPattern(pattern.name, item));
            library.appendChild(item);
        });
    }
    
    generateColorPicker() {
        const picker = document.getElementById('colorPicker');
        const colors = [
            '#00ff41', '#ff006e', '#00f5ff', '#ffff00',
            '#ff4081', '#4caf50', '#ff9800', '#9c27b0',
            '#03dac6', '#607d8b', '#795548', '#e91e63',
            '#000000', '#ffffff', '#808080', '#ff0000',
            '#2196f3', '#00bcd4', '#ffc107', '#9e9e9e'
        ];
        
        colors.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.addEventListener('click', () => this.selectColor(color, swatch));
            picker.appendChild(swatch);
        });
        
        picker.children[0].classList.add('selected');
    }
    
    setupEventListeners() {
        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());
        this.canvas.addEventListener('mousemove', (e) => this.updateCoordinates(e));
        
        // Tool buttons
        document.getElementById('paintTool').addEventListener('click', () => this.selectTool('paint'));
        document.getElementById('eraseTool').addEventListener('click', () => this.selectTool('erase'));
        document.getElementById('fillTool').addEventListener('click', () => this.selectTool('fill'));
        document.getElementById('pickTool').addEventListener('click', () => this.selectTool('pick'));
        document.getElementById('sprayTool').addEventListener('click', () => this.selectTool('spray'));
        
        // Brush size buttons
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setBrushSize(parseInt(e.target.dataset.size), e.target));
        });
        
        // Action buttons
        document.getElementById('retrowaveBtn').addEventListener('click', () => this.cycleRetrowavePalette());
        document.getElementById('colorCycleBtn').addEventListener('click', () => this.toggleColorCycling());
        document.getElementById('recordGifBtn').addEventListener('click', () => this.toggleGifRecording());
        document.getElementById('randomize').addEventListener('click', () => this.randomizeCanvas());
        document.getElementById('clearCanvas').addEventListener('click', () => this.clearCanvas());
        document.getElementById('toggleGrid').addEventListener('click', () => this.toggleGrid());
        document.getElementById('saveImage').addEventListener('click', () => this.saveImage());
    }
    
    toggleColorCycling() {
        this.colorCycling = !this.colorCycling;
        const btn = document.getElementById('colorCycleBtn');
        
        if (this.colorCycling) {
            // Enable color cycling
            btn.classList.add('active');
            btn.style.background = 'linear-gradient(135deg, #ff006e, #00f5ff, #00ff41)';
            btn.style.animation = 'colorCyclePulse 1s infinite';
            this.updateModeIndicator('COLOR CYCLE ACTIVE');
            console.log('🌈 COLOR CYCLE ACTIVATED - CANVAS IS NOW ALIVE!');
        } else {
            // Disable color cycling
            btn.classList.remove('active');
            btn.style.background = '';
            btn.style.animation = '';
            this.updateModeIndicator('COLOR CYCLE DISABLED');
            console.log('⏹️ COLOR CYCLE DEACTIVATED');
        }
    }
    
    toggleGifRecording() {
        if (this.recording) {
            this.stopGifRecording();
        } else {
            this.startGifRecording();
        }
    }
    
    startGifRecording() {
        if (typeof GIF === 'undefined') {
            alert('GIF library not loaded! Please refresh and try again.');
            return;
        }
        
        this.recording = true;
        this.recordingFrames = 0;
        this.recordingStartTime = Date.now();
        
        // Initialize GIF encoder
        this.gif = new GIF({
            workers: 2,
            quality: 10,
            width: this.canvas.width,
            height: this.canvas.height,
            workerScript: 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js'
        });
        
        // Update button state
        const btn = document.getElementById('recordGifBtn');
        btn.classList.add('active');
        btn.textContent = '⏹ STOP REC';
        btn.style.background = 'linear-gradient(135deg, #ff0000, #ff4444)';
        btn.style.animation = 'recordingPulse 0.5s infinite alternate';
        
        this.updateModeIndicator('🔴 RECORDING GIF');
        
        console.log('🎬 GIF RECORDING STARTED - Capturing epic animation!');
        console.log(`📹 Will record ${this.maxRecordingFrames} frames for perfect loop`);
    }
    
    stopGifRecording() {
        if (!this.recording) return;
        
        this.recording = false;
        
        // Update button state
        const btn = document.getElementById('recordGifBtn');
        btn.classList.remove('active');
        btn.textContent = '⚙ ENCODING...';
        btn.style.background = 'linear-gradient(135deg, #ff8000, #ffaa00)';
        btn.style.animation = 'processingPulse 1s infinite';
        
        this.updateModeIndicator('⚙️ ENCODING GIF');
        
        // Render the GIF
        this.gif.on('finished', (blob) => {
            // Download the GIF
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `pixel-forge-animation-${Date.now()}.gif`;
            link.href = url;
            link.click();
            
            // Reset button
            btn.textContent = '◉ RECORD GIF';
            btn.style.background = '';
            btn.style.animation = '';
            this.updateModeIndicator('✅ GIF EXPORTED');
            
            console.log('🎉 GIF EXPORT COMPLETE!');
            console.log(`💾 Saved as: ${link.download}`);
            
            // Clean up
            URL.revokeObjectURL(url);
            setTimeout(() => {
                this.updateModeIndicator('PAINT MODE');
            }, 2000);
        });
        
        this.gif.render();
        
        console.log(`🎬 GIF RECORDING STOPPED - Captured ${this.recordingFrames} frames`);
        console.log('⚙️ Encoding perfect loop...');
    }
    
    captureGifFrame() {
        // Only capture every 2nd frame to keep file size reasonable (30fps -> 15fps)
        if (this.recordingFrames % 2 !== 0) {
            this.recordingFrames++;
            return;
        }
        
        // Stop recording after max frames for perfect loop
        if (this.recordingFrames >= this.maxRecordingFrames) {
            this.stopGifRecording();
            return;
        }
        
        // Capture current canvas frame
        this.gif.addFrame(this.canvas, {
            delay: 66, // ~15 fps (1000ms/15 = 66ms)
            copy: true
        });
        
        this.recordingFrames++;
        
        // Update progress
        const progress = Math.floor((this.recordingFrames / this.maxRecordingFrames) * 100);
        this.updateModeIndicator(`🔴 RECORDING ${progress}%`);
    }
    
    cycleRetrowavePalette() {
        const palette = this.retrowavePalettes[this.retrowaveIndex];
        
        // Update color picker with new palette
        const picker = document.getElementById('colorPicker');
        const swatches = picker.children;
        
        // Clear current selections
        Array.from(swatches).forEach(swatch => swatch.classList.remove('selected'));
        
        // Update each swatch with new palette colors
        for (let i = 0; i < Math.min(swatches.length, palette.colors.length); i++) {
            swatches[i].style.backgroundColor = palette.colors[i];
        }
        
        // Select first color in new palette
        if (swatches.length > 0) {
            swatches[0].classList.add('selected');
            this.currentColor = palette.colors[0];
        }
        
        // Update mode indicator to show current palette
        this.updateModeIndicator(`${palette.name} PALETTE`);
        
        // Add visual feedback - flash the button
        const btn = document.getElementById('retrowaveBtn');
        btn.style.background = 'linear-gradient(135deg, #ff006e, #00f5ff)';
        btn.style.color = '#000';
        btn.style.boxShadow = '0 0 20px #ff006e';
        
        setTimeout(() => {
            btn.style.background = '';
            btn.style.color = '';
            btn.style.boxShadow = '';
        }, 300);
        
        // Cycle to next palette
        this.retrowaveIndex = (this.retrowaveIndex + 1) % this.retrowavePalettes.length;
        
        console.log(`🌈 RETROWAVE PALETTE: ${palette.name}`);
        console.log('🎨 Colors:', palette.colors.slice(0, 8).join(', '));
    }
    
    applyColorCycling(x, y, pixel) {
        // Create different cycling patterns based on position and pixel type
        const baseIndex = Math.floor(this.cycleTime + x * 0.1 + y * 0.1) % this.retrowaveCycleColors.length;
        let cycledColor;
        
        switch (pixel.type) {
            case 'quantum':
            case 'chaos':
                // Fast rainbow cycling
                cycledColor = this.retrowaveCycleColors[(baseIndex + Math.floor(this.cycleTime * 4)) % this.retrowaveCycleColors.length];
                break;
            case 'strobe':
            case 'lightning':
                // Pulse between white and color
                cycledColor = Math.sin(this.cycleTime * 8) > 0 ? '#ffffff' : this.retrowaveCycleColors[baseIndex];
                break;
            case 'energy':
            case 'nova':
                // Slow warm cycling
                const warmColors = ['#ff006e', '#ff4081', '#ff9800', '#ffff00', '#00ff41'];
                cycledColor = warmColors[Math.floor(this.cycleTime + x + y) % warmColors.length];
                break;
            case 'vortex':
            case 'distort':
                // Purple-blue cycling
                const coolColors = ['#8000ff', '#9c27b0', '#00f5ff', '#0080ff'];
                cycledColor = coolColors[Math.floor(this.cycleTime * 2 + x + y) % coolColors.length];
                break;
            case 'spectrum':
                // Full spectrum cycling
                cycledColor = this.retrowaveCycleColors[Math.floor(this.cycleTime * 6 + x * 0.5 + y * 0.3) % this.retrowaveCycleColors.length];
                break;
            default:
                // Standard cycling for all other types
                cycledColor = this.retrowaveCycleColors[(baseIndex + Math.floor(this.cycleTime * 2)) % this.retrowaveCycleColors.length];
                break;
        }
        
        // Update pixel color and redraw
        if (pixel.color !== cycledColor) {
            pixel.color = cycledColor;
            this.clearPixel(x, y);
            this.drawPixel(x, y);
        }
    }
    
    selectPixelType(type, element) {
        document.querySelectorAll('#pixelLibrary .pixel-item').forEach(item => {
            item.classList.remove('selected');
        });
        element.classList.add('selected');
        this.selectedPixelType = type;
        this.selectedSprite = null;
        const descriptions = {
            'quantum': 'QUANTUM DOT',
            'chaos': 'CHAOS FIELD',
            'flicker': 'FLICKER STORM',
            'strobe': 'STROBE PULSE',
            'static': 'STATIC BURST',
            'distort': 'REALITY TEAR',
            'particle': 'PARTICLE FLUX',
            'lightning': 'LIGHTNING ARC',
            'temporal': 'TIME RIFT',
            'nova': 'NOVA BURST',
            'fractal': 'FRACTAL NOISE',
            'phantom': 'PHANTOM ECHO',
            'surge': 'ENERGY SURGE',
            'cascade': 'CASCADE WAVE',
            'vortex': 'VOID VORTEX',
            'spectrum': 'SPECTRUM SHIFT'
        };
        this.updateModeIndicator(descriptions[type] || 'PIXEL MODE');
    }
    
    selectSprite(sprite, element) {
        document.querySelectorAll('#spriteLibrary .sprite-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('#patternLibrary .sprite-item').forEach(item => {
            item.classList.remove('selected');
        });
        element.classList.add('selected');
        this.selectedSprite = sprite;
        this.selectedPixelType = 'sprite';
        this.updateModeIndicator('GEOMETRIC MODE');
    }
    
    selectPattern(pattern, element) {
        document.querySelectorAll('#spriteLibrary .sprite-item').forEach(item => {
            item.classList.remove('selected');
        });
        document.querySelectorAll('#patternLibrary .sprite-item').forEach(item => {
            item.classList.remove('selected');
        });
        element.classList.add('selected');
        this.selectedSprite = pattern;
        this.selectedPixelType = 'pattern';
        const descriptions = {
            'cybermesh': 'CYBER MESH',
            'neuralnet': 'NEURAL NETWORK',
            'datamatrix': 'DATA MATRIX',
            'circuitboard': 'CIRCUIT BOARD',
            'hexgrid': 'HEXAGON GRID',
            'starfield': 'STAR FIELD'
        };
        this.updateModeIndicator(descriptions[pattern] || 'BACKGROUND MODE');
    }
    
    selectColor(color, element) {
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.classList.remove('selected');
        });
        element.classList.add('selected');
        this.currentColor = color;
    }
    
    selectTool(tool) {
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(tool + 'Tool').classList.add('active');
        this.currentTool = tool;
        this.updateModeIndicator(tool.toUpperCase() + ' MODE');
    }
    
    updateModeIndicator(mode) {
        document.getElementById('modeIndicator').textContent = mode;
    }
    
    setBrushSize(size, element) {
        document.querySelectorAll('.size-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        element.classList.add('active');
        this.brushSize = size;
    }
    
    getCanvasPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / this.gridSize);
        const y = Math.floor((e.clientY - rect.top) / this.gridSize);
        return { x, y };
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        this.draw(e);
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    draw(e) {
        if (!this.isDrawing && this.currentTool !== 'fill' && this.currentTool !== 'pick') return;
        
        const pos = this.getCanvasPosition(e);
        
        switch (this.currentTool) {
            case 'paint':
                if (this.selectedPixelType === 'sprite') {
                    this.drawSprite(pos.x, pos.y);
                } else if (this.selectedPixelType === 'pattern') {
                    this.drawPattern(pos.x, pos.y);
                } else {
                    this.paintPixels(pos.x, pos.y);
                }
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
            case 'pick':
                if (this.isDrawing) {
                    this.pickColor(pos.x, pos.y);
                    this.isDrawing = false;
                }
                break;
            case 'spray':
                this.sprayPaint(pos.x, pos.y);
                break;
        }
        
        this.updatePixelCount();
    }
    
    drawPixel(x, y) {
        const pixel = this.pixels[x][y];
        if (!pixel) return;
        
        this.ctx.fillStyle = pixel.color;
        this.ctx.strokeStyle = pixel.color;
        const centerX = x * this.gridSize + this.gridSize / 2;
        const centerY = y * this.gridSize + this.gridSize / 2;
        const time = Date.now() * 0.01;
        const fastTime = Date.now() * 0.02;
        
        switch (pixel.type) {
            case 'quantum':
                // Original quantum madness - shifting probability cloud
                for (let i = 0; i < 12; i++) {
                    const qx = centerX + (Math.random() - 0.5) * this.gridSize * 1.5;
                    const qy = centerY + (Math.random() - 0.5) * this.gridSize * 1.5;
                    const alpha = Math.floor(Math.random() * 180 + 75).toString(16);
                    this.ctx.fillStyle = pixel.color + alpha;
                    this.ctx.fillRect(qx, qy, Math.random() * 2 + 1, Math.random() * 2 + 1);
                }
                break;
                
            case 'chaos':
                // Chaotic particle explosion
                for (let i = 0; i < 15; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const radius = Math.random() * this.gridSize;
                    const qx = centerX + Math.cos(angle + time) * radius;
                    const qy = centerY + Math.sin(angle + time) * radius;
                    const intensity = Math.floor(Math.random() * 200 + 55).toString(16);
                    const colors = ['#ff006e', '#00ff41', '#00f5ff'];
                    this.ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)] + intensity;
                    this.ctx.fillRect(qx, qy, Math.random() * 3, Math.random() * 3);
                }
                break;
                
            case 'flicker':
                // Flickering storm effect
                const flickerIntensity = Math.sin(fastTime + x + y) > 0.3 ? 1 : 0;
                if (flickerIntensity) {
                    for (let i = 0; i < 20; i++) {
                        const fx = centerX + (Math.random() - 0.5) * this.gridSize * 2;
                        const fy = centerY + (Math.random() - 0.5) * this.gridSize * 2;
                        const brightness = Math.random() > 0.7 ? 'ff' : '80';
                        this.ctx.fillStyle = pixel.color + brightness;
                        this.ctx.fillRect(fx, fy, 1, 1);
                    }
                }
                break;
                
            case 'strobe':
                // Intense strobing pulses
                const strobe = Math.floor(fastTime * 4) % 2;
                if (strobe) {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
                    for (let i = 0; i < 8; i++) {
                        const sx = centerX + (Math.random() - 0.5) * this.gridSize * 3;
                        const sy = centerY + (Math.random() - 0.5) * this.gridSize * 3;
                        this.ctx.fillStyle = pixel.color;
                        this.ctx.fillRect(sx, sy, 2, 2);
                    }
                }
                break;
                
            case 'static':
                // TV static burst
                for (let i = 0; i < 25; i++) {
                    const sx = x * this.gridSize + Math.random() * this.gridSize;
                    const sy = y * this.gridSize + Math.random() * this.gridSize;
                    const grayValue = Math.floor(Math.random() * 255);
                    this.ctx.fillStyle = `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
                    this.ctx.fillRect(sx, sy, 1, 1);
                }
                // Add color sparks
                for (let i = 0; i < 5; i++) {
                    const sx = centerX + (Math.random() - 0.5) * this.gridSize;
                    const sy = centerY + (Math.random() - 0.5) * this.gridSize;
                    this.ctx.fillStyle = pixel.color;
                    this.ctx.fillRect(sx, sy, 2, 2);
                }
                break;
                
            case 'distort':
                // Reality distortion field
                for (let i = 0; i < 10; i++) {
                    const distortAngle = time + i;
                    const distortRadius = Math.sin(time * 2 + i) * this.gridSize / 2;
                    const dx = centerX + Math.cos(distortAngle) * distortRadius;
                    const dy = centerY + Math.sin(distortAngle) * distortRadius;
                    const alpha = Math.floor((Math.sin(time + i) * 0.5 + 0.5) * 150 + 50).toString(16);
                    this.ctx.fillStyle = pixel.color + alpha;
                    this.ctx.fillRect(dx - 1, dy - 1, 3, 3);
                }
                break;
                
            case 'particle':
                // Particle flux field
                for (let i = 0; i < 8; i++) {
                    const flow = (time * 20 + i * 45) % 360;
                    const px = centerX + Math.cos(flow * Math.PI / 180) * this.gridSize / 2;
                    const py = centerY + Math.sin(flow * Math.PI / 180) * this.gridSize / 2;
                    const trail = Math.floor((1 - i / 8) * 200).toString(16);
                    this.ctx.fillStyle = pixel.color + trail;
                    this.ctx.fillRect(px, py, 2, 2);
                }
                break;
                
            case 'lightning':
                // Lightning arc effect
                const lightningActive = Math.random() > 0.8;
                if (lightningActive) {
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    let lx = centerX;
                    let ly = centerY;
                    for (let i = 0; i < 6; i++) {
                        lx += (Math.random() - 0.5) * this.gridSize / 2;
                        ly += (Math.random() - 0.5) * this.gridSize / 2;
                        this.ctx.lineTo(lx, ly);
                    }
                    this.ctx.stroke();
                    // Add colored sparks
                    for (let i = 0; i < 5; i++) {
                        const lsx = centerX + (Math.random() - 0.5) * this.gridSize;
                        const lsy = centerY + (Math.random() - 0.5) * this.gridSize;
                        this.ctx.fillStyle = pixel.color;
                        this.ctx.fillRect(lsx, lsy, 1, 1);
                    }
                }
                break;
                
            case 'temporal':
                // Time rift effect
                for (let i = 0; i < 6; i++) {
                    const timeOffset = time + i * 2;
                    const tx = centerX + Math.sin(timeOffset) * this.gridSize / 3;
                    const ty = centerY + Math.cos(timeOffset * 1.5) * this.gridSize / 3;
                    const timeAlpha = Math.floor((Math.sin(timeOffset) * 0.5 + 0.5) * 180 + 75).toString(16);
                    this.ctx.fillStyle = pixel.color + timeAlpha;
                    this.ctx.fillRect(tx - 1, ty - 1, 3, 3);
                }
                break;
                
            case 'nova':
                // Nova burst effect
                const novaPhase = Math.sin(time + x + y);
                if (novaPhase > 0.7) {
                    // Explosion phase
                    for (let i = 0; i < 16; i++) {
                        const angle = (i / 16) * Math.PI * 2;
                        const radius = (novaPhase - 0.7) * this.gridSize * 4;
                        const nx = centerX + Math.cos(angle) * radius;
                        const ny = centerY + Math.sin(angle) * radius;
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.fillRect(nx, ny, 2, 2);
                    }
                }
                // Core particles
                for (let i = 0; i < 6; i++) {
                    const nx = centerX + (Math.random() - 0.5) * this.gridSize / 2;
                    const ny = centerY + (Math.random() - 0.5) * this.gridSize / 2;
                    this.ctx.fillStyle = pixel.color;
                    this.ctx.fillRect(nx, ny, 1, 1);
                }
                break;
                
            case 'fractal':
                // Fractal noise pattern
                for (let i = 0; i < 12; i++) {
                    const scale = Math.pow(0.7, i % 4);
                    const fx = centerX + Math.sin(time + i) * this.gridSize * scale;
                    const fy = centerY + Math.cos(time + i * 1.3) * this.gridSize * scale;
                    const fractalAlpha = Math.floor(scale * 200).toString(16);
                    this.ctx.fillStyle = pixel.color + fractalAlpha;
                    this.ctx.fillRect(fx, fy, scale * 3, scale * 3);
                }
                break;
                
            case 'phantom':
                // Phantom echo effect
                for (let echo = 0; echo < 5; echo++) {
                    const delay = echo * 0.5;
                    const px = centerX + Math.sin(time - delay) * this.gridSize / 4;
                    const py = centerY + Math.cos(time - delay) * this.gridSize / 4;
                    const echoAlpha = Math.floor((1 - echo / 5) * 150).toString(16);
                    this.ctx.fillStyle = pixel.color + echoAlpha;
                    this.ctx.fillRect(px - echo, py - echo, 2 + echo, 2 + echo);
                }
                break;
                
            case 'surge':
                // Energy surge effect
                const surge = Math.sin(time * 3 + x + y) * 0.5 + 0.5;
                for (let i = 0; i < Math.floor(surge * 15) + 5; i++) {
                    const sx = centerX + (Math.random() - 0.5) * this.gridSize * surge * 2;
                    const sy = centerY + (Math.random() - 0.5) * this.gridSize * surge * 2;
                    const surgeAlpha = Math.floor(surge * 255).toString(16);
                    this.ctx.fillStyle = pixel.color + surgeAlpha;
                    this.ctx.fillRect(sx, sy, surge * 3, surge * 3);
                }
                break;
                
            case 'cascade':
                // Cascade wave effect
                for (let wave = 0; wave < 4; wave++) {
                    const waveTime = time + wave;
                    const amplitude = Math.sin(waveTime) * this.gridSize / 3;
                    const cx = centerX + amplitude;
                    const cy = centerY + Math.sin(waveTime * 2) * this.gridSize / 4;
                    const waveAlpha = Math.floor((1 - wave / 4) * 200).toString(16);
                    this.ctx.fillStyle = pixel.color + waveAlpha;
                    this.ctx.fillRect(cx - wave, cy - wave, 2 + wave, 2 + wave);
                }
                break;
                
            case 'vortex':
                // Void vortex effect
                for (let i = 0; i < 10; i++) {
                    const spiral = time + i * 0.5;
                    const radius = (i / 10) * this.gridSize;
                    const vx = centerX + Math.cos(spiral) * radius;
                    const vy = centerY + Math.sin(spiral) * radius;
                    const vortexAlpha = Math.floor((1 - i / 10) * 180 + 75).toString(16);
                    this.ctx.fillStyle = pixel.color + vortexAlpha;
                    this.ctx.fillRect(vx - 1, vy - 1, 3, 3);
                }
                break;
                
            case 'spectrum':
                // Spectrum shift effect
                const colors = ['#ff0000', '#ff8000', '#ffff00', '#00ff00', '#0080ff', '#0000ff', '#8000ff'];
                for (let i = 0; i < 8; i++) {
                    const colorIndex = (Math.floor(time + i) + x + y) % colors.length;
                    const sx = centerX + (Math.random() - 0.5) * this.gridSize;
                    const sy = centerY + (Math.random() - 0.5) * this.gridSize;
                    this.ctx.fillStyle = colors[colorIndex] + 'c0';
                    this.ctx.fillRect(sx, sy, 2, 2);
                }
                break;
                
            default:
                this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
        }
    }
    
    drawSprite(centerX, centerY) {
        const sprites = {
            fractal: this.drawFractal,
            mandala: this.drawMandala,
            spiral: this.drawSpiral,
            matrix: this.drawMatrix,
            hexagon: this.drawHexagon,
            crystal: this.drawCrystal,
            circuit: this.drawCircuit,
            flower: this.drawFlower,
            galaxy: this.drawGalaxy
        };
        
        if (sprites[this.selectedSprite]) {
            sprites[this.selectedSprite].call(this, centerX, centerY);
        }
    }
    
    drawFractal(centerX, centerY) {
        const size = Math.min(this.brushSize * 3, 15);
        for (let i = 0; i < 3; i++) {
            const radius = size - i * 3;
            for (let angle = 0; angle < 360; angle += 45) {
                const rad = (angle * Math.PI) / 180;
                const x = centerX + Math.cos(rad) * radius;
                const y = centerY + Math.sin(rad) * radius;
                this.setPixel(Math.floor(x), Math.floor(y), {
                    color: this.currentColor,
                    type: 'surge'
                });
            }
        }
    }
    
    drawMandala(centerX, centerY) {
        const size = Math.min(this.brushSize * 2, 12);
        for (let ring = 0; ring < 3; ring++) {
            const radius = ring * 3 + 2;
            for (let angle = 0; angle < 360; angle += 30) {
                const rad = (angle * Math.PI) / 180;
                const x = centerX + Math.cos(rad) * radius;
                const y = centerY + Math.sin(rad) * radius;
                this.setPixel(Math.floor(x), Math.floor(y), {
                    color: this.currentColor,
                    type: 'nova'
                });
            }
        }
    }
    
    drawSpiral(centerX, centerY) {
        const size = Math.min(this.brushSize * 4, 20);
        for (let i = 0; i < size * 8; i++) {
            const angle = i * 0.5;
            const radius = i * 0.3;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            this.setPixel(Math.floor(x), Math.floor(y), {
                color: this.currentColor,
                type: 'vortex'
            });
        }
    }
    
    drawMatrix(centerX, centerY) {
        const size = this.brushSize * 2;
        for (let x = -size; x <= size; x++) {
            for (let y = -size; y <= size; y++) {
                if ((x + y) % 2 === 0) {
                    this.setPixel(centerX + x, centerY + y, {
                        color: this.currentColor,
                        type: 'static'
                    });
                }
            }
        }
    }
    
    drawHexagon(centerX, centerY) {
        const size = Math.min(this.brushSize * 2, 8);
        for (let angle = 0; angle < 360; angle += 60) {
            const rad = (angle * Math.PI) / 180;
            for (let r = 1; r <= size; r++) {
                const x = centerX + Math.cos(rad) * r;
                const y = centerY + Math.sin(rad) * r;
                this.setPixel(Math.floor(x), Math.floor(y), {
                    color: this.currentColor,
                    type: 'particle'
                });
            }
        }
    }
    
    drawCrystal(centerX, centerY) {
        const size = this.brushSize * 2;
        const points = [
            [0, -size], [size, 0], [0, size], [-size, 0],
            [size/2, -size/2], [size/2, size/2], [-size/2, size/2], [-size/2, -size/2]
        ];
        
        points.forEach(([dx, dy]) => {
            this.setPixel(centerX + dx, centerY + dy, {
                color: this.currentColor,
                type: 'spectrum'
            });
        });
    }
    
    drawCircuit(centerX, centerY) {
        const size = this.brushSize * 3;
        // Draw horizontal and vertical lines
        for (let i = -size; i <= size; i++) {
            this.setPixel(centerX + i, centerY, {
                color: this.currentColor,
                type: 'lightning'
            });
            this.setPixel(centerX, centerY + i, {
                color: this.currentColor,
                type: 'lightning'
            });
        }
        // Add junction points
        this.setPixel(centerX, centerY, {
            color: this.currentColor,
            type: 'strobe'
        });
    }
    
    drawFlower(centerX, centerY) {
        const size = Math.min(this.brushSize * 2, 6);
        // Center
        this.setPixel(centerX, centerY, {
            color: this.currentColor,
            type: 'nova'
        });
        // Petals
        for (let angle = 0; angle < 360; angle += 45) {
            const rad = (angle * Math.PI) / 180;
            const x = centerX + Math.cos(rad) * size;
            const y = centerY + Math.sin(rad) * size;
            this.setPixel(Math.floor(x), Math.floor(y), {
                color: this.currentColor,
                type: 'phantom'
            });
        }
    }
    
    drawGalaxy(centerX, centerY) {
        const size = Math.min(this.brushSize * 4, 15);
        for (let i = 0; i < size * 5; i++) {
            const angle = i * 0.8 + Math.random() * 0.5;
            const radius = Math.sqrt(i) * 1.5 + Math.random() * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            this.setPixel(Math.floor(x), Math.floor(y), {
                color: this.currentColor,
                type: 'chaos'
            });
        }
    }
    
    drawPattern(centerX, centerY) {
        const patterns = {
            cybermesh: this.drawCyberMesh,
            neuralnet: this.drawNeuralNet,
            datamatrix: this.drawDataMatrix,
            circuitboard: this.drawCircuitBoard,
            hexgrid: this.drawHexGrid,
            starfield: this.drawStarField
        };
        
        if (patterns[this.selectedSprite]) {
            patterns[this.selectedSprite].call(this, centerX, centerY);
        }
    }
    
    drawCyberMesh(centerX, centerY) {
        const size = this.brushSize * 8;
        const gridSize = 4;
        
        for (let x = -size; x <= size; x += gridSize) {
            for (let y = -size; y <= size; y += gridSize) {
                const px = centerX + x;
                const py = centerY + y;
                
                this.setPixel(px, py, { color: this.currentColor, type: 'quantum' });
                
                if (Math.random() > 0.3) {
                    for (let i = 1; i < gridSize; i++) {
                        this.setPixel(px + i, py, { color: this.currentColor + '80', type: 'static' });
                    }
                }
                
                if (Math.random() > 0.3) {
                    for (let i = 1; i < gridSize; i++) {
                        this.setPixel(px, py + i, { color: this.currentColor + '80', type: 'static' });
                    }
                }
                
                if (Math.random() > 0.7) {
                    this.setPixel(px + 1, py + 1, { color: '#ffffff', type: 'strobe' });
                }
            }
        }
    }
    
    drawNeuralNet(centerX, centerY) {
        const size = this.brushSize * 6;
        const neurons = [];
        
        for (let i = 0; i < 15; i++) {
            neurons.push({
                x: centerX + (Math.random() - 0.5) * size * 2,
                y: centerY + (Math.random() - 0.5) * size * 2
            });
        }
        
        for (let i = 0; i < neurons.length; i++) {
            for (let j = i + 1; j < neurons.length; j++) {
                const dist = Math.sqrt(
                    Math.pow(neurons[i].x - neurons[j].x, 2) + 
                    Math.pow(neurons[i].y - neurons[j].y, 2)
                );
                
                if (dist < size) {
                    const steps = Math.floor(dist);
                    for (let step = 0; step <= steps; step++) {
                        const t = step / steps;
                        const x = Math.floor(neurons[i].x + t * (neurons[j].x - neurons[i].x));
                        const y = Math.floor(neurons[i].y + t * (neurons[j].y - neurons[i].y));
                        this.setPixel(x, y, { color: this.currentColor + '60', type: 'particle' });
                    }
                }
            }
        }
        
        neurons.forEach(neuron => {
            this.setPixel(Math.floor(neuron.x), Math.floor(neuron.y), { 
                color: this.currentColor, 
                type: 'nova' 
            });
            for (let angle = 0; angle < 360; angle += 60) {
                const rad = angle * Math.PI / 180;
                const hx = Math.floor(neuron.x + Math.cos(rad) * 2);
                const hy = Math.floor(neuron.y + Math.sin(rad) * 2);
                this.setPixel(hx, hy, { color: this.currentColor + '40', type: 'quantum' });
            }
        });
    }
    
    drawDataMatrix(centerX, centerY) {
        const size = this.brushSize * 7;
        const blockSize = 3;
        
        for (let x = -size; x <= size; x += blockSize) {
            for (let y = -size; y <= size; y += blockSize) {
                const px = centerX + x;
                const py = centerY + y;
                const blockType = Math.random();
                
                if (blockType > 0.7) {
                    for (let bx = 0; bx < blockSize; bx++) {
                        for (let by = 0; by < blockSize; by++) {
                            this.setPixel(px + bx, py + by, { 
                                color: this.currentColor, 
                                type: 'chaos' 
                            });
                        }
                    }
                } else if (blockType > 0.4) {
                    for (let i = 0; i < blockSize; i++) {
                        this.setPixel(px + i, py, { color: this.currentColor, type: 'flicker' });
                        this.setPixel(px, py + i, { color: this.currentColor, type: 'flicker' });
                    }
                } else if (blockType > 0.2) {
                    this.setPixel(px, py, { color: '#ffffff', type: 'strobe' });
                    this.setPixel(px + blockSize - 1, py + blockSize - 1, { 
                        color: '#ffffff', 
                        type: 'strobe' 
                    });
                }
                
                if (Math.random() > 0.8) {
                    const corruptX = px + Math.floor(Math.random() * blockSize);
                    const corruptY = py + Math.floor(Math.random() * blockSize);
                    this.setPixel(corruptX, corruptY, { 
                        color: '#ff0000', 
                        type: 'lightning' 
                    });
                }
            }
        }
    }
    
    drawCircuitBoard(centerX, centerY) {
        const size = this.brushSize * 8;
        const traceWidth = 2;
        
        for (let i = -size; i <= size; i += 8) {
            for (let x = -size; x <= size; x++) {
                for (let w = 0; w < traceWidth; w++) {
                    this.setPixel(centerX + x, centerY + i + w, { 
                        color: this.currentColor, 
                        type: 'surge' 
                    });
                }
            }
            
            for (let y = -size; y <= size; y++) {
                for (let w = 0; w < traceWidth; w++) {
                    this.setPixel(centerX + i + w, centerY + y, { 
                        color: this.currentColor, 
                        type: 'surge' 
                    });
                }
            }
        }
        
        for (let x = -size; x <= size; x += 12) {
            for (let y = -size; y <= size; y += 12) {
                const px = centerX + x;
                const py = centerY + y;
                const componentType = Math.random();
                
                if (componentType > 0.7) {
                    for (let cx = 0; cx < 6; cx++) {
                        for (let cy = 0; cy < 4; cy++) {
                            this.setPixel(px + cx, py + cy, { 
                                color: '#333333', 
                                type: 'static' 
                            });
                        }
                    }
                    for (let pin = 0; pin < 6; pin++) {
                        this.setPixel(px + pin, py - 1, { color: '#silver', type: 'particle' });
                        this.setPixel(px + pin, py + 4, { color: '#silver', type: 'particle' });
                    }
                } else if (componentType > 0.4) {
                    this.setPixel(px + 2, py + 2, { color: '#ffff00', type: 'nova' });
                    for (let angle = 0; angle < 360; angle += 45) {
                        const rad = angle * Math.PI / 180;
                        const cx = px + 2 + Math.cos(rad) * 2;
                        const cy = py + 2 + Math.sin(rad) * 2;
                        this.setPixel(Math.floor(cx), Math.floor(cy), { 
                            color: '#ffff00', 
                            type: 'temporal' 
                        });
                    }
                } else {
                    for (let rx = 0; rx < 4; rx++) {
                        this.setPixel(px + rx, py + 1, { 
                            color: rx % 2 ? '#ff0000' : '#0000ff', 
                            type: 'phantom' 
                        });
                    }
                }
            }
        }
        
        for (let x = -size; x <= size; x += 6) {
            for (let y = -size; y <= size; y += 6) {
                if (Math.random() > 0.6) {
                    this.setPixel(centerX + x, centerY + y, { 
                        color: '#silver', 
                        type: 'vortex' 
                    });
                }
            }
        }
    }
    
    drawHexGrid(centerX, centerY) {
        const size = this.brushSize * 6;
        const hexRadius = 4;
        
        for (let row = -size / 6; row <= size / 6; row++) {
            for (let col = -size / 6; col <= size / 6; col++) {
                const hexX = centerX + col * hexRadius * 1.5;
                const hexY = centerY + row * hexRadius * Math.sqrt(3) + (col % 2) * hexRadius * Math.sqrt(3) / 2;
                
                for (let side = 0; side < 6; side++) {
                    const angle1 = (side * 60) * Math.PI / 180;
                    const angle2 = ((side + 1) * 60) * Math.PI / 180;
                    
                    const x1 = hexX + Math.cos(angle1) * hexRadius;
                    const y1 = hexY + Math.sin(angle1) * hexRadius;
                    const x2 = hexX + Math.cos(angle2) * hexRadius;
                    const y2 = hexY + Math.sin(angle2) * hexRadius;
                    
                    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
                    for (let step = 0; step <= steps; step++) {
                        const t = step / steps;
                        const x = Math.floor(x1 + t * (x2 - x1));
                        const y = Math.floor(y1 + t * (y2 - y1));
                        this.setPixel(x, y, { color: this.currentColor, type: 'cascade' });
                    }
                }
                
                const centerType = Math.random();
                if (centerType > 0.8) {
                    this.setPixel(Math.floor(hexX), Math.floor(hexY), { 
                        color: '#ffffff', 
                        type: 'nova' 
                    });
                } else if (centerType > 0.6) {
                    this.setPixel(Math.floor(hexX), Math.floor(hexY), { 
                        color: this.currentColor, 
                        type: 'spectrum' 
                    });
                }
                
                if (Math.random() > 0.7) {
                    for (let fx = -hexRadius / 2; fx <= hexRadius / 2; fx++) {
                        for (let fy = -hexRadius / 2; fy <= hexRadius / 2; fy++) {
                            if (fx * fx + fy * fy <= (hexRadius / 2) * (hexRadius / 2)) {
                                this.setPixel(Math.floor(hexX + fx), Math.floor(hexY + fy), { 
                                    color: this.currentColor + '40', 
                                    type: 'distort' 
                                });
                            }
                        }
                    }
                }
            }
        }
    }
    
    drawStarField(centerX, centerY) {
        const size = this.brushSize * 10;
        const numStars = 50;
        
        for (let i = 0; i < numStars; i++) {
            const starX = centerX + (Math.random() - 0.5) * size * 2;
            const starY = centerY + (Math.random() - 0.5) * size * 2;
            const starType = Math.random();
            
            if (starType > 0.9) {
                this.setPixel(Math.floor(starX), Math.floor(starY), { 
                    color: '#ffffff', 
                    type: 'nova' 
                });
                for (let ray = 0; ray < 8; ray++) {
                    const angle = (ray * 45) * Math.PI / 180;
                    for (let r = 1; r <= 6; r++) {
                        const rx = starX + Math.cos(angle) * r;
                        const ry = starY + Math.sin(angle) * r;
                        this.setPixel(Math.floor(rx), Math.floor(ry), { 
                            color: this.currentColor + '80', 
                            type: 'lightning' 
                        });
                    }
                }
            } else if (starType > 0.7) {
                this.setPixel(Math.floor(starX), Math.floor(starY), { 
                    color: this.currentColor, 
                    type: 'strobe' 
                });
                this.setPixel(Math.floor(starX - 2), Math.floor(starY), { 
                    color: this.currentColor + '60', 
                    type: 'phantom' 
                });
                this.setPixel(Math.floor(starX + 2), Math.floor(starY), { 
                    color: this.currentColor + '60', 
                    type: 'phantom' 
                });
                this.setPixel(Math.floor(starX), Math.floor(starY - 2), { 
                    color: this.currentColor + '60', 
                    type: 'phantom' 
                });
                this.setPixel(Math.floor(starX), Math.floor(starY + 2), { 
                    color: this.currentColor + '60', 
                    type: 'phantom' 
                });
            } else if (starType > 0.4) {
                this.setPixel(Math.floor(starX), Math.floor(starY), { 
                    color: this.currentColor, 
                    type: 'surge' 
                });
            } else {
                this.setPixel(Math.floor(starX), Math.floor(starY), { 
                    color: this.currentColor + '80', 
                    type: 'quantum' 
                });
            }
        }
        
        for (let cloud = 0; cloud < 5; cloud++) {
            const cloudX = centerX + (Math.random() - 0.5) * size;
            const cloudY = centerY + (Math.random() - 0.5) * size;
            const cloudSize = Math.random() * 8 + 4;
            
            for (let i = 0; i < 20; i++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * cloudSize;
                const px = cloudX + Math.cos(angle) * radius;
                const py = cloudY + Math.sin(angle) * radius;
                
                this.setPixel(Math.floor(px), Math.floor(py), { 
                    color: ['#ff69b4', '#9370db', '#00ced1'][cloud % 3] + '40', 
                    type: 'fractal' 
                });
            }
        }
    }
    
    setPixel(x, y, pixel) {
        if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
            this.pixels[x][y] = pixel;
            this.drawPixel(x, y);
        }
    }
    
    sprayPaint(centerX, centerY) {
        const size = this.brushSize;
        for (let i = 0; i < size * 2; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.random() * size;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            this.setPixel(Math.floor(x), Math.floor(y), {
                color: this.currentColor,
                type: this.selectedPixelType
            });
        }
    }
    
    paintPixels(centerX, centerY) {
        const half = Math.floor(this.brushSize / 2);
        for (let x = centerX - half; x <= centerX + half; x++) {
            for (let y = centerY - half; y <= centerY + half; y++) {
                this.setPixel(x, y, {
                    color: this.currentColor,
                    type: this.selectedPixelType
                });
            }
        }
    }
    
    erasePixels(centerX, centerY) {
        const half = Math.floor(this.brushSize / 2);
        for (let x = centerX - half; x <= centerX + half; x++) {
            for (let y = centerY - half; y <= centerY + half; y++) {
                if (x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight) {
                    this.pixels[x][y] = null;
                    this.clearPixel(x, y);
                }
            }
        }
    }
    
    floodFill(startX, startY) {
        const targetPixel = this.pixels[startX][startY];
        const newPixel = {
            color: this.currentColor,
            type: this.selectedPixelType
        };
        
        if (this.pixelsEqual(targetPixel, newPixel)) return;
        
        const stack = [[startX, startY]];
        
        while (stack.length > 0) {
            const [x, y] = stack.pop();
            
            if (x < 0 || x >= this.gridWidth || y < 0 || y >= this.gridHeight) continue;
            if (!this.pixelsEqual(this.pixels[x][y], targetPixel)) continue;
            
            this.pixels[x][y] = newPixel;
            this.drawPixel(x, y);
            
            stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }
    
    pickColor(x, y) {
        const pixel = this.pixels[x][y];
        if (pixel) {
            this.currentColor = pixel.color;
            document.querySelectorAll('.color-swatch').forEach(swatch => {
                swatch.classList.remove('selected');
                if (this.rgbToHex(swatch.style.backgroundColor) === pixel.color) {
                    swatch.classList.add('selected');
                }
            });
        }
    }
    
    rgbToHex(rgb) {
        const result = rgb.match(/\d+/g);
        if (!result) return rgb;
        return "#" + ((1 << 24) + (parseInt(result[0]) << 16) + (parseInt(result[1]) << 8) + parseInt(result[2])).toString(16).slice(1);
    }
    
    pixelsEqual(pixel1, pixel2) {
        if (pixel1 === null && pixel2 === null) return true;
        if (pixel1 === null || pixel2 === null) return false;
        return pixel1.color === pixel2.color && pixel1.type === pixel2.type;
    }
    
    clearPixel(x, y) {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize, this.gridSize);
        this.ctx.globalAlpha = 1;
        this.ctx.lineWidth = 1;
    }
    
    isAnimatedPixelType(type) {
        const animatedTypes = [
            'quantum', 'chaos', 'flicker', 'strobe', 'static', 'distort', 
            'particle', 'lightning', 'temporal', 'nova', 'fractal', 
            'phantom', 'surge', 'cascade', 'vortex', 'spectrum'
        ];
        return animatedTypes.includes(type);
    }
    
    getRandomColor() {
        const colors = ['#00ff41', '#ff006e', '#00f5ff', '#ffff00', '#ff4081', '#4caf50'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    drawGrid() {
        if (!this.showGrid) {
            this.gridCtx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
            return;
        }
        
        this.gridCtx.strokeStyle = '#00ff41';
        this.gridCtx.lineWidth = 0.5;
        this.gridCtx.globalAlpha = 0.15;
        
        for (let x = 0; x <= this.canvas.width; x += this.gridSize) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(x, 0);
            this.gridCtx.lineTo(x, this.canvas.height);
            this.gridCtx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += this.gridSize) {
            this.gridCtx.beginPath();
            this.gridCtx.moveTo(0, y);
            this.gridCtx.lineTo(this.canvas.width, y);
            this.gridCtx.stroke();
        }
    }
    
    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.drawGrid();
    }
    
    clearCanvas() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.pixels = new Array(this.gridWidth).fill(null).map(() => new Array(this.gridHeight).fill(null));
        this.updatePixelCount();
    }
    
    saveImage() {
        const link = document.createElement('a');
        link.download = 'pixel-forge-creation.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }
    
    updateCoordinates(e) {
        const pos = this.getCanvasPosition(e);
        document.getElementById('coords').textContent = `${pos.x}, ${pos.y}`;
    }
    
    updatePixelCount() {
        let count = 0;
        for (let x = 0; x < this.gridWidth; x++) {
            for (let y = 0; y < this.gridHeight; y++) {
                if (this.pixels[x][y] !== null) count++;
            }
        }
        this.pixelCount = count;
        document.getElementById('pixelCount').textContent = count;
    }
    
    randomizeCanvas() {
        // Clear canvas first
        this.clearCanvas();
        
        // Step 1: Generate epic background using pattern generators
        const backgrounds = ['cybermesh', 'neuralnet', 'datamatrix', 'circuitboard', 'hexgrid', 'starfield'];
        const selectedBg = backgrounds[Math.floor(Math.random() * backgrounds.length)];
        
        // Paint background in multiple locations for full coverage
        const oldSprite = this.selectedSprite;
        const oldType = this.selectedPixelType;
        this.selectedSprite = selectedBg;
        this.selectedPixelType = 'pattern';
        
        for (let i = 0; i < 8; i++) {
            const bgX = Math.floor(Math.random() * this.gridWidth);
            const bgY = Math.floor(Math.random() * this.gridHeight);
            this.drawPattern(bgX, bgY);
        }
        
        // Step 2: Add geometric constructs as focal points
        const geometrics = ['fractal', 'mandala', 'spiral', 'galaxy', 'crystal', 'circuit', 'flower'];
        this.selectedPixelType = 'sprite';
        
        for (let i = 0; i < 5; i++) {
            this.selectedSprite = geometrics[Math.floor(Math.random() * geometrics.length)];
            const geoX = Math.floor(Math.random() * this.gridWidth);
            const geoY = Math.floor(Math.random() * this.gridHeight);
            const colors = ['#00ff41', '#ff006e', '#00f5ff', '#ffff00', '#ff4081', '#9c27b0'];
            this.currentColor = colors[Math.floor(Math.random() * colors.length)];
            this.drawSprite(geoX, geoY);
        }
        
        // Step 3: Scatter quantum texture effects throughout
        const textures = ['quantum', 'chaos', 'strobe', 'lightning', 'nova', 'spectrum', 'vortex'];
        
        for (let i = 0; i < 150; i++) {
            const texture = textures[Math.floor(Math.random() * textures.length)];
            const x = Math.floor(Math.random() * this.gridWidth);
            const y = Math.floor(Math.random() * this.gridHeight);
            const colors = ['#00ff41', '#ff006e', '#00f5ff', '#ffff00', '#ff4081', '#4caf50', '#ff9800', '#9c27b0'];
            
            this.setPixel(x, y, {
                color: colors[Math.floor(Math.random() * colors.length)],
                type: texture
            });
        }
        
        // Step 4: Create energy corridors (connecting lines of effects)
        for (let corridor = 0; corridor < 3; corridor++) {
            const startX = Math.floor(Math.random() * this.gridWidth);
            const startY = Math.floor(Math.random() * this.gridHeight);
            const endX = Math.floor(Math.random() * this.gridWidth);
            const endY = Math.floor(Math.random() * this.gridHeight);
            
            const steps = Math.max(Math.abs(endX - startX), Math.abs(endY - startY));
            const corridorTexture = ['lightning', 'surge', 'particle'][corridor % 3];
            const corridorColor = ['#ffffff', '#00f5ff', '#ff006e'][corridor % 3];
            
            for (let step = 0; step <= steps; step++) {
                const t = step / steps;
                const x = Math.floor(startX + t * (endX - startX));
                const y = Math.floor(startY + t * (endY - startY));
                
                // Main corridor
                this.setPixel(x, y, {
                    color: corridorColor,
                    type: corridorTexture
                });
                
                // Corridor sparks
                if (Math.random() > 0.7) {
                    const sparkX = x + Math.floor((Math.random() - 0.5) * 6);
                    const sparkY = y + Math.floor((Math.random() - 0.5) * 6);
                    this.setPixel(sparkX, sparkY, {
                        color: corridorColor + '80',
                        type: 'chaos'
                    });
                }
            }
        }
        
        // Step 5: Add reality tears (void effects in corners)
        const corners = [
            {x: 10, y: 10}, {x: this.gridWidth - 10, y: 10},
            {x: 10, y: this.gridHeight - 10}, {x: this.gridWidth - 10, y: this.gridHeight - 10}
        ];
        
        corners.forEach(corner => {
            for (let i = 0; i < 20; i++) {
                const tearX = corner.x + Math.floor((Math.random() - 0.5) * 15);
                const tearY = corner.y + Math.floor((Math.random() - 0.5) * 15);
                this.setPixel(tearX, tearY, {
                    color: '#8b00ff',
                    type: 'distort'
                });
            }
        });
        
        // Step 6: Central explosion effect
        const centerX = Math.floor(this.gridWidth / 2);
        const centerY = Math.floor(this.gridHeight / 2);
        
        // Core explosion
        for (let radius = 1; radius <= 8; radius++) {
            for (let angle = 0; angle < 360; angle += 15) {
                const rad = angle * Math.PI / 180;
                const x = centerX + Math.cos(rad) * radius;
                const y = centerY + Math.sin(rad) * radius;
                
                const intensity = 1 - (radius / 8);
                const alpha = Math.floor(intensity * 255).toString(16).padStart(2, '0');
                
                this.setPixel(Math.floor(x), Math.floor(y), {
                    color: '#ffffff' + alpha,
                    type: radius < 4 ? 'nova' : 'phantom'
                });
            }
        }
        
        // Restore original settings
        this.selectedSprite = oldSprite;
        this.selectedPixelType = oldType;
        
        this.updatePixelCount();
        console.log('🚀 EPIC RANDOMIZATION COMPLETE! Generated procedural masterpiece with:');
        console.log(`📍 Background: ${selectedBg.toUpperCase()}`);
        console.log('⚡ 5 Geometric constructs');
        console.log('🌟 150 Quantum texture effects');
        console.log('🔥 3 Energy corridors');
        console.log('🌀 4 Reality tears');
        console.log('💥 Central nova explosion');
    }
}

// Initialize the app when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new PixelCollageBuilder();
});
