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

    // Include the massive drawPixel method and all other drawing methods here
    // (I'll continue with the rest in the next update due to length constraints)
    
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
}

// Initialize the app when the page loads
window.addEventListener('DOMContentLoaded', () => {
    new PixelCollageBuilder();
});
