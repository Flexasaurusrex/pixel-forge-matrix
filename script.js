<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pixel Collage Builder - Retrowave Edition</title>
    <meta name="description" content="Create stunning digital pixel collages with quantum textures, geometric constructs, and retrowave color cycling effects.">
    <meta name="keywords" content="pixel art, collage, retrowave, cyberpunk, digital art, creative tools">
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.min.js"></script>
</head>
<body>
    <div class="app-container">
        <div class="header">
            <h1>◈ PIXEL FORGE MATRIX v3.0 ◈</h1>
        </div>
        
        <div class="sidebar">
            <h3>◆ QUANTUM TEXTURES ◆</h3>
            <div class="pixel-library" id="pixelLibrary">
                <!-- Pixel items will be generated here -->
            </div>
            
            <h3>◆ GEOMETRIC CONSTRUCTS ◆</h3>
            <div class="sprite-library" id="spriteLibrary">
                <!-- Sprite items will be generated here -->
            </div>
            
            <h3>◆ BACKGROUND GENERATORS ◆</h3>
            <div class="sprite-library" id="patternLibrary">
                <!-- Pattern items will be generated here -->
            </div>
        </div>
        
        <div class="main-canvas">
            <canvas id="canvas" width="800" height="600"></canvas>
            <canvas id="gridOverlay" class="grid-overlay" width="800" height="600"></canvas>
        </div>
        
        <div class="tools">
            <div class="tool-section">
                <h4>◇ TOOLS ◇</h4>
                <button class="tool-btn active" id="paintTool">◈ PAINT</button>
                <button class="tool-btn" id="eraseTool">◇ ERASE</button>
                <button class="tool-btn" id="fillTool">◆ FILL</button>
                <button class="tool-btn" id="pickTool">◉ SAMPLE</button>
                <button class="tool-btn" id="sprayTool">※ SPRAY</button>
            </div>
            
            <div class="tool-section">
                <h4>◇ BRUSH SIZE ◇</h4>
                <div class="brush-size">
                    <button class="size-btn active" data-size="1">1</button>
                    <button class="size-btn" data-size="3">3</button>
                    <button class="size-btn" data-size="6">6</button>
                    <button class="size-btn" data-size="12">12</button>
                </div>
            </div>
            
            <div class="tool-section">
                <h4>◇ SPECTRUM ◇</h4>
                <div class="color-picker" id="colorPicker">
                    <!-- Color swatches will be generated here -->
                </div>
            </div>
            
            <div class="tool-section">
                <button class="tool-btn" id="retrowaveBtn">◈ RETROWAVE</button>
                <button class="tool-btn" id="colorCycleBtn">◇ COLOR CYCLE</button>
                <button class="tool-btn" id="recordGifBtn">◉ RECORD GIF</button>
                <button class="tool-btn" id="randomize">◈ RANDOMIZE</button>
                <button class="tool-btn" id="clearCanvas">◇ PURGE</button>
                <button class="tool-btn" id="toggleGrid">◆ GRID</button>
                <button class="tool-btn" id="saveImage">◉ EXPORT</button>
            </div>
        </div>
        
        <div class="footer">
            <div class="performance-stats">
                <span>XY: <span id="coords">0, 0</span></span>
                <span>PIXELS: <span id="pixelCount">0</span></span>
                <span>FPS: <span id="fps">60</span></span>
            </div>
            <div class="mode-indicator" id="modeIndicator">PAINT MODE</div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
