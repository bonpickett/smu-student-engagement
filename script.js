// Global variables
let mustangSvg;
let viz2025, viz2026;
let currentView = 'both'; // 'both', '2025', or '2026'

// Preload function to load assets before setup
function preload() {
  // Load the SVG file
  mustangSvg = loadImage('mustang.svg');
}

// Setup function - called once when the sketch starts
function setup() {
  // We'll create two separate p5 instances, one for each visualization
  viz2025 = new p5(sketch2025, 'viz-2025');
  viz2026 = new p5(sketch2026, 'viz-2026');
  
  // Setup view toggle buttons
  document.getElementById('view-both').addEventListener('click', () => setView('both'));
  document.getElementById('view-2025').addEventListener('click', () => setView('2025'));
  document.getElementById('view-2026').addEventListener('click', () => setView('2026'));
  
  // Handle window resize
  window.addEventListener('resize', function() {
    resizeVisualizations();
  });
}

// Resize both visualizations
function resizeVisualizations() {
  if (viz2025) {
    const container2025 = document.getElementById('viz-2025');
    viz2025.resizeCanvas(container2025.offsetWidth, container2025.offsetHeight);
    if (viz2025.dataArt) viz2025.dataArt.resize();
  }
  
  if (viz2026) {
    const container2026 = document.getElementById('viz-2026');
    viz2026.resizeCanvas(container2026.offsetWidth, container2026.offsetHeight);
    if (viz2026.dataArt) viz2026.dataArt.resize();
  }
}

// Switch between views
function setView(view) {
  currentView = view;
  const container = document.querySelector('.visualizations-container');
  
  // Update button states
  document.querySelectorAll('.class-selector button').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`view-${view}`).classList.add('active');
  
  // Update container class for CSS styling
  container.classList.remove('single-view', 'compare-mode');
  
  if (view === 'both') {
    container.classList.add('compare-mode');
    document.getElementById('viz-2025').classList.remove('active');
    document.getElementById('viz-2026').classList.remove('active');
  } else {
    container.classList.add('single-view');
    document.getElementById('viz-2025').classList.remove('active');
    document.getElementById('viz-2026').classList.remove('active');
    document.getElementById(`viz-${view}`).classList.add('active');
  }
  
  // Resize visualizations after changing view
  setTimeout(resizeVisualizations, 50);
}

// P5.js instance mode for Class of 2025 visualization
const sketch2025 = function(p) {
  p.dataArt = null;
  
  p.setup = function() {
    const container = document.getElementById('viz-2025');
    p.createCanvas(container.offsetWidth, container.offsetHeight);
    p.colorMode(p.RGB);
    p.textFont('Arial');
    p.frameRate(30);
    
    // Add a slight delay before initializing to ensure window size is correctly measured
    setTimeout(() => {
      // Initialize the visualization for 2025 data
      p.dataArt = new MustangsEngagementArt(p, class2025Data);
    }, 100);
  };
  
  p.draw = function() {
    if (p.dataArt) {
      p.dataArt.update();
      p.dataArt.display();
    }
  };
  
  p.windowResized = function() {
    const container = document.getElementById('viz-2025');
    if (currentView === 'both') {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    } else if (currentView === '2025') {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    }
    if (p.dataArt) p.dataArt.resize();
  };
  
  p.mouseMoved = function() {
    if (p.dataArt && p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
      p.dataArt.checkHover(p.mouseX, p.mouseY);
    }
  };
};

// P5.js instance mode for Class of 2026 visualization
const sketch2026 = function(p) {
  p.dataArt = null;
  
  p.setup = function() {
    const container = document.getElementById('viz-2026');
    p.createCanvas(container.offsetWidth, container.offsetHeight);
    p.colorMode(p.RGB);
    p.textFont('Arial');
    p.frameRate(30);
    
    // Add a slight delay before initializing to ensure window size is correctly measured
    setTimeout(() => {
      // Initialize the visualization for 2026 data
      p.dataArt = new MustangsEngagementArt(p, class2026Data);
    }, 100);
  };
  
  p.draw = function() {
    if (p.dataArt) {
      p.dataArt.update();
      p.dataArt.display();
    }
  };
  
  p.windowResized = function() {
    const container = document.getElementById('viz-2026');
    if (currentView === 'both') {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    } else if (currentView === '2026') {
      p.resizeCanvas(container.offsetWidth, container.offsetHeight);
    }
    if (p.dataArt) p.dataArt.resize();
  };
  
  p.mouseMoved = function() {
    if (p.dataArt && p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
      p.dataArt.checkHover(p.mouseX, p.mouseY);
    }
  };
};

// Data for Class of 2025
const class2025Data = [
  { groupRange: "0-5", avgTotal: 2.2, avgActive: 1.6, activeRatio: 72.8 },
  { groupRange: "6-9", avgTotal: 7.3, avgActive: 5.9, activeRatio: 81.3 },
  { groupRange: "10-13", avgTotal: 11.3, avgActive: 9.8, activeRatio: 86.2 },
  { groupRange: "14-17", avgTotal: 15.2, avgActive: 13.9, activeRatio: 90.8 },
  { groupRange: "18-21", avgTotal: 19.3, avgActive: 17.0, activeRatio: 88.2 },
  { groupRange: "22-25", avgTotal: 23.2, avgActive: 21.3, activeRatio: 92.0 },
  { groupRange: "26-29", avgTotal: 28.1, avgActive: 25.2, activeRatio: 89.8 },
  { groupRange: "30-33", avgTotal: 31.2, avgActive: 27.0, activeRatio: 86.4 },
  { groupRange: "34-37", avgTotal: 37.0, avgActive: 31.0, activeRatio: 83.8 },
  { groupRange: "38-41", avgTotal: 39.2, avgActive: 35.2, activeRatio: 89.7 },
  { groupRange: "42-45", avgTotal: 43.0, avgActive: 39.0, activeRatio: 90.6 },
  { groupRange: "50-59", avgTotal: 50.0, avgActive: 45.0, activeRatio: 90.0 }
];

// Data for Class of 2026
const class2026Data = [
  { groupRange: "0-5", avgTotal: 3.8, avgActive: 0.1, activeRatio: 1.7 },
  { groupRange: "6-9", avgTotal: 7.9, avgActive: 0.9, activeRatio: 11.0 },
  { groupRange: "10-13", avgTotal: 11.5, avgActive: 2.3, activeRatio: 20.3 },
  { groupRange: "14-17", avgTotal: 15.5, avgActive: 3.8, activeRatio: 24.5 },
  { groupRange: "18-21", avgTotal: 19.5, avgActive: 5.0, activeRatio: 25.7 },
  { groupRange: "22-25", avgTotal: 23.6, avgActive: 6.2, activeRatio: 26.3 },
  { groupRange: "26-29", avgTotal: 27.4, avgActive: 7.0, activeRatio: 25.5 },
  { groupRange: "30-33", avgTotal: 31.4, avgActive: 8.1, activeRatio: 25.6 },
  { groupRange: "34-37", avgTotal: 35.5, avgActive: 9.5, activeRatio: 26.9 },
  { groupRange: "38-41", avgTotal: 39.4, avgActive: 9.8, activeRatio: 24.9 },
  { groupRange: "42-45", avgTotal: 43.6, avgActive: 15.0, activeRatio: 34.3 },
  { groupRange: "46-49", avgTotal: 47.7, avgActive: 10.9, activeRatio: 22.8 },
  { groupRange: "50-59", avgTotal: 54.3, avgActive: 12.8, activeRatio: 23.6 },
  { groupRange: "60-69", avgTotal: 64.5, avgActive: 11.1, activeRatio: 17.2 },
  { groupRange: "70+", avgTotal: 79.0, avgActive: 7.0, activeRatio: 8.4 }
];

// Visualization class - using animated concentric rings
class MustangsEngagementArt {
  constructor(p, studentData) {
    this.p = p; // Store the p5 instance
    this.studentData = studentData;
    
    // SMU brand colors in RGB format
    this.smuBlue = [53, 76, 161];
    this.smuRed = [204, 0, 53]; 
    this.smuYellow = [249, 200, 14];
    this.smuTeal = [89, 195, 195];
    this.white = [255, 255, 255];
    
    // Color palette for mustangs - start with white, end with red
    this.colorPalette = [
      this.white,      // Lowest activation (0%)
      this.white,      // Lower activation
      this.smuYellow,  // Medium activation
      this.smuRed      // Highest activation
    ];
    
    this.mustangs = [];
    this.centerX = p.width / 2;
    this.centerY = p.height / 2;
    this.maxRadius = p.min(p.width, p.height) * 0.4;
    this.hoverMustang = null;
    this.time = 0;
    
    // Animation settings - smoother motion
    this.animationSpeed = 0.6;
    
    // Add animation parameters for rings
    this.ringAnimationSpeed = 0.005; // Controls rotation speed
    this.pulseAnimationSpeed = 0.8;  // Controls pulsing speed
    this.rotationAngles = [];        // Store rotation angles for each mustang
    this.dashOffsets = [];           // Store dash pattern offsets for animation
    
    this.initializeVisualization();
  }
  
  // Get color by interpolating through the palette based on activation ratio
  getColorFromPalette(ratio) {
    const p = this.p;
    
    // Define max ratio differently for each class
    const maxRatio = this.studentData === class2026Data ? 35 : 100;
    
    // Ensure very low values in 2026 data still show a color gradient
    let normalizedRatio;
    if (this.studentData === class2026Data) {
      // For 2026 data, scale up the ratio to show more color variation
      normalizedRatio = p.constrain(ratio / maxRatio, 0, 1);
    } else {
      // For 2025 data, use the same approach as before
      if (ratio < 30) {
        normalizedRatio = ratio / 120;
      } else {
        normalizedRatio = 0.25 + ((ratio - 30) / 70) * 0.75;
      }
      normalizedRatio = p.constrain(normalizedRatio, 0, 1);
    }
    
    // Calculate which segment of the palette we're in
    const segments = this.colorPalette.length - 1;
    const segment = normalizedRatio * segments;
    const index = p.floor(segment);
    const t = segment - index; // fractional part for interpolation
    
    if (index >= segments) {
      return this.colorPalette[segments];
    }
    
    // Linear interpolation between the two closest colors
    const colorA = this.colorPalette[index];
    const colorB = this.colorPalette[index + 1];
    
    return [
      p.lerp(colorA[0], colorB[0], t),
      p.lerp(colorA[1], colorB[1], t),
      p.lerp(colorA[2], colorB[2], t)
    ];
  }
  
  initializeVisualization() {
    const p = this.p;
    
    // Create a grid layout for mustangs with adjusted spacing
    // Using fewer columns and rows to make everything larger
    const rows = 3;
    const cols = 4; // Reduced from 5 to 4 to make each item larger
    const totalMustangs = this.studentData.length;
    
    // Use a consistent starting point for both visualizations
    // This ensures proper alignment between classes
    const startY = p.height * 0.15; // Start at 15% from the top for both classes
    
    // Define consistent spacing for both classes
    const availableHeight = p.height * 0.9;
    
    // Calculate spacing based on available space
    const gridSpacingX = p.width * 0.8 / (cols - 1);
    const gridSpacingY = availableHeight * 0.8 / (rows - 1);
    
    const startX = this.centerX - (gridSpacingX * (cols - 1)) / 2;
    
    // Calculate the maximum mustang size and ring sizes - increased by 25%
    const maxMustangSize = Math.min(gridSpacingX * 0.4, gridSpacingY * 0.4); // Increased from 0.3
    const maxRingSize = Math.min(gridSpacingX, gridSpacingY) * 0.5; // Increased from 0.4
    
    // Create mustangs for each student group range
    for (let i = 0; i < totalMustangs; i++) {
      // Calculate grid position
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      const x = startX + col * gridSpacingX;
      const y = startY + row * gridSpacingY;
      
      // Initialize animation values for this mustang
      this.rotationAngles[i] = 0;
      this.dashOffsets[i] = p.random(0, 100); // Random starting offset
      
      // Determine mustang size based on total group count - larger base size
      const maxGroupCount = this.studentData === class2026Data ? 80 : 50;
      // Calculate base size from data but cap it to prevent overlap
      const baseSize = p.map(p.sqrt(this.studentData[i].avgTotal), 0, p.sqrt(maxGroupCount), 40, 110); // Increased from 30-90
      const size = Math.min(baseSize, maxMustangSize);
      
      // Calculate ring sizes based on data
      // Outer ring size based on total groups
      const outerRingSize = p.map(this.studentData[i].avgTotal, 0, maxGroupCount, size * 1.3, maxRingSize);
      // Inner ring size based on active groups and maintaining the ratio
      const innerRingSize = (this.studentData[i].avgActive / this.studentData[i].avgTotal) * outerRingSize;
      
      // Get color based on activation ratio
      const colorRgb = this.getColorFromPalette(this.studentData[i].activeRatio);
      
      const mustang = {
        x: x,
        y: y,
        targetX: x,
        targetY: y,
        size: size,
        data: this.studentData[i],
        colorRgb: colorRgb,
        angle: 0,
        verticalOffset: 0, // For running animation - vertical component
        tiltAngle: 0,      // For running animation - rotational component
        gallopSpeed: p.random(0.04, 0.05) * this.animationSpeed, // Smoother animation
        hovering: false,
        row: row,
        col: col,
        // New properties for concentric rings
        outerRingSize: outerRingSize,
        innerRingSize: innerRingSize,
        // Animation properties for rings
        outerRingPulse: 0,
        innerRingPulse: 0,
        ringOpacity: 0.7,
        // Add animation properties
        rotationSpeed: p.random(0.001, 0.003) * (i % 2 === 0 ? 1 : -1), // Alternate directions
        pulsePhase: p.random(0, p.TWO_PI),                              // Random phase for pulse
        dashOffset: this.dashOffsets[i],
        // All mustangs facing same direction
        flipX: false
      };
      
      this.mustangs.push(mustang);
    }
  }
  
  resize() {
    const p = this.p;
    this.centerX = p.width / 2;
    this.centerY = p.height / 2;
    
    // Recalculate grid layout with adjusted spacing
    const rows = 3;
    const cols = 4; // Reduced from 5 to 4
    
    // Use consistent values for both visualizations
    const availableHeight = p.height * 0.9;
    const gridSpacingX = p.width * 0.8 / (cols - 1);
    const gridSpacingY = availableHeight * 0.8 / (rows - 1);
    
    const startX = this.centerX - (gridSpacingX * (cols - 1)) / 2;
    const startY = p.height * 0.15; // Adjusted starting point
    
    // Calculate the maximum mustang size and ring sizes - increased by 25%
    const maxMustangSize = Math.min(gridSpacingX * 0.4, gridSpacingY * 0.4); // Increased from 0.3
    const maxRingSize = Math.min(gridSpacingX, gridSpacingY) * 0.5; // Increased from 0.4
    
    // Reposition mustangs
    for (let i = 0; i < this.mustangs.length; i++) {
      const mustang = this.mustangs[i];
      const row = Math.floor(i / cols); // Recalculate row based on new column count
      const col = i % cols;
      
      mustang.row = row; // Update the row property
      mustang.col = col; // Update the col property
      
      mustang.targetX = startX + col * gridSpacingX;
      mustang.targetY = startY + row * gridSpacingY;
      
      // Recalculate size to prevent overlap
      const maxGroupCount = this.studentData === class2026Data ? 80 : 50;
      const baseSize = p.map(p.sqrt(mustang.data.avgTotal), 0, p.sqrt(maxGroupCount), 40, 110); // Increased
      mustang.size = Math.min(baseSize, maxMustangSize);
      
      // Recalculate ring sizes
      mustang.outerRingSize = p.map(mustang.data.avgTotal, 0, maxGroupCount, mustang.size * 1.3, maxRingSize);
      mustang.innerRingSize = (mustang.data.avgActive / mustang.data.avgTotal) * mustang.outerRingSize;
    }
  }
  
  update() {
    const p = this.p;
    this.time += 0.01;
    
    const isDimming = this.hoverMustang !== null;
    
    // Update mustangs
    for (let i = 0; i < this.mustangs.length; i++) {
      const mustang = this.mustangs[i];
      
      mustang.x = p.lerp(mustang.x, mustang.targetX, 0.1);
      mustang.y = p.lerp(mustang.y, mustang.targetY, 0.1);
      
      // Continuously animate rings (slower when not hovering)
      const animationSpeedFactor = mustang.hovering ? 1.0 : 0.3;
      
      // Update rotation angle based on rotation speed
      this.rotationAngles[i] += mustang.rotationSpeed * animationSpeedFactor;
      
      // Update dash offset for continuous motion
      mustang.dashOffset -= 0.2 * animationSpeedFactor;
      if (mustang.dashOffset < 0) mustang.dashOffset += 100;
      
      // Only animate mustang if hovering
      if (mustang.hovering) {
        const runCycle = this.time * 3.5;
        mustang.verticalOffset = p.sin(runCycle) * 5.0;
        mustang.tiltAngle = p.sin(runCycle - p.PI/6) * 0.04;
        
        // Enhanced animation for rings when hovering
        mustang.outerRingPulse = p.sin(this.time * this.pulseAnimationSpeed * 2 + mustang.pulsePhase) * 4;
        mustang.innerRingPulse = p.sin(this.time * this.pulseAnimationSpeed * 2 + mustang.pulsePhase + p.PI/4) * 3;
        mustang.ringOpacity = 0.9; // Increased opacity when hovering
      } else {
        mustang.verticalOffset = 0;
        mustang.tiltAngle = 0;
        
        // Subtle animation for rings when not hovering
        mustang.outerRingPulse = p.sin(this.time * this.pulseAnimationSpeed + mustang.pulsePhase) * 1.5;
        mustang.innerRingPulse = p.sin(this.time * this.pulseAnimationSpeed + mustang.pulsePhase + p.PI/3) * 1;
        mustang.ringOpacity = isDimming && mustang !== this.hoverMustang ? 0.3 : 0.7;
      }
    }
  }
  
  display() {
    const p = this.p;
    
    // Draw background elements
    this.drawBackgroundElements();
    
    // Check if we need to apply dimming effect
    const isDimming = this.hoverMustang !== null;
    
    // First, draw all the rings (they should be behind the mustangs)
    for (let i = 0; i < this.mustangs.length; i++) {
      const mustang = this.mustangs[i];
      // Draw the rings with appropriate dimming
      if (!isDimming || mustang === this.hoverMustang) {
        this.drawConcentricRings(mustang, false, i);
      } else {
        this.drawConcentricRings(mustang, true, i);
      }
    }
    
    // Then draw the mustangs on top of the rings
    for (let mustang of this.mustangs) {
      // Draw dimmed mustangs first (if any hovered)
      if (isDimming && mustang !== this.hoverMustang) {
        this.drawMustangSvg(mustang, true); // true = dimmed
      }
    }
    
    // Draw the hovered mustang last (on top)
    if (this.hoverMustang) {
      this.drawMustangSvg(this.hoverMustang, false); // false = not dimmed
    }
    
    // If no mustang is hovered, draw all normally
    if (!isDimming) {
      for (let mustang of this.mustangs) {
        this.drawMustangSvg(mustang, false);
      }
    }
    
    // Draw hover information
    if (this.hoverMustang) {
      this.drawMustangInfo(this.hoverMustang);
    }
  }
  
  // New method to draw animated concentric rings
  drawConcentricRings(mustang, dimmed = false, index) {
    const p = this.p;
    
    // Optional subtle background for the rings
    p.noStroke();
    p.fill(0, 0, 0, 10);
    p.ellipse(mustang.x, mustang.y, mustang.outerRingSize * 1.1);
    
    // Draw outer ring (total groups)
    p.noFill();
    p.strokeWeight(5);
    
    // Determine opacity based on hover/dimmed state
    const ringOpacity = dimmed ? 0.3 : mustang.ringOpacity;
    
    // Rotation angle for this mustang
    const rotationAngle = this.rotationAngles[index];
    
    // Draw outer ring (total groups) - Teal color with rotation and dash pattern
    p.push();
    p.translate(mustang.x, mustang.y);
    p.rotate(rotationAngle);
    
    // Set dash pattern based on hovering state
    if (mustang.hovering) {
      p.drawingContext.setLineDash([2, 4]); // Shorter dashes when hovering
    } else {
      p.drawingContext.setLineDash([4, 8]); // Longer dashes when not hovering
    }
    
    // Animate the dash pattern
    p.drawingContext.lineDashOffset = mustang.dashOffset;
    
    p.stroke(
      this.smuTeal[0],
      this.smuTeal[1],
      this.smuTeal[2],
      255 * ringOpacity
    );
    
    // Draw the outer ring with pulse
    p.ellipse(
      0, 0,
      mustang.outerRingSize + mustang.outerRingPulse
    );
    
    // Draw inner ring (active groups) - Red color with counter-rotation
    p.rotate(-rotationAngle * 2); // Counter-rotate
    
    // Set different dash pattern for inner ring
    if (mustang.hovering) {
      p.drawingContext.setLineDash([3, 2]); // Different pattern when hovering
    } else {
      p.drawingContext.setLineDash([6, 4]); // Different pattern when not hovering
    }
    
    // Animate the dash pattern in the opposite direction
    p.drawingContext.lineDashOffset = -mustang.dashOffset * 1.5;
    
    p.strokeWeight(6);
    p.stroke(
      this.smuRed[0],
      this.smuRed[1],
      this.smuRed[2],
      255 * ringOpacity
    );
    
    // Draw the inner ring with pulse
    p.ellipse(
      0, 0,
      mustang.innerRingSize + mustang.innerRingPulse
    );
    
    // Reset the dash pattern
    p.drawingContext.setLineDash([]);
    p.pop();
    
    // Optional subtle measurement tick marks when hovering
    if (mustang.hovering) {
      p.stroke(255, 255, 255, 30);
      p.strokeWeight(1);
      
      // Draw subtle measurement guides
      p.line(
        mustang.x - mustang.outerRingSize/2, mustang.y,
        mustang.x + mustang.outerRingSize/2, mustang.y
      );
      p.line(
        mustang.x, mustang.y - mustang.outerRingSize/2,
        mustang.x, mustang.y + mustang.outerRingSize/2
      );
    }
  }
  
  drawBackgroundElements() {
    const p = this.p;
    
    // Clear the canvas first
    p.clear();
    
    // Use a semi-transparent background to blend with the page background
    p.background(0, 0, 0, 20);
    
    // Background circles have been removed
  }
  
  drawMustangSvg(mustang, dimmed = false) {
    const p = this.p;
    
    p.push();
    p.translate(mustang.x, mustang.y + mustang.verticalOffset);
    p.rotate(mustang.tiltAngle);
    
    if (mustang.flipX) {
      p.scale(-1, 1);
    }
    
    // Apply the color tint
    if (dimmed) {
      p.tint(
        mustang.colorRgb[0] * 0.6,
        mustang.colorRgb[1] * 0.6,
        mustang.colorRgb[2] * 0.6,
        200
      );
    } else if (mustang.hovering) {
      p.tint(
        p.constrain(mustang.colorRgb[0] * 1.2, 0, 255),
        p.constrain(mustang.colorRgb[1] * 1.2, 0, 255),
        p.constrain(mustang.colorRgb[2] * 1.2, 0, 255)
      );
    } else {
      p.tint(mustang.colorRgb[0], mustang.colorRgb[1], mustang.colorRgb[2]);
    }
    
    // Calculate aspect ratio adjustment
    const targetWidth = mustang.size;
    const targetHeight = targetWidth * (mustangSvg.height / mustangSvg.width);
    
    // Draw the SVG image
    p.imageMode(p.CENTER);
    p.image(mustangSvg, 0, 0, targetWidth, targetHeight);
    
    // Remove tint
    p.noTint();
    
    p.pop();
    
    // Display text information if appropriate
    if (!this.hoverMustang || mustang === this.hoverMustang) {
      p.push();
      p.textAlign(p.CENTER, p.CENTER);
      p.textStyle(p.BOLD);
      
      // Draw group range text - no outline
      let groupTextY = mustang.y + mustang.size * 0.6;
      
      // Clean white text for group range with no outline
      p.fill(255, 255, 255, dimmed ? 150 : 255);
      p.textSize(mustang.size * 0.24);
      p.text(mustang.data.groupRange, mustang.x, groupTextY);
      
      // Activation percentage text - no outline
      let percentTextY = groupTextY + mustang.size * 0.25;
      p.textSize(mustang.size * 0.20);
      
      // Yellow percentage text with no outline
      p.fill(this.smuYellow[0], this.smuYellow[1], this.smuYellow[2], dimmed ? 180 : 255);
      p.text(`${mustang.data.activeRatio.toFixed(1)}%`, mustang.x, percentTextY);
      
      p.pop();
    }
  }
  
  drawMustangInfo(mustang) {
    const p = this.p;
    const data = mustang.data;
    
    // Position the info panel - adjust if too close to edge
    let infoX = mustang.x + mustang.size;
    const infoY = mustang.y - mustang.size * 0.5;
    const infoWidth = 260; // Increased from 240 for better readability
    
    // If too close to right edge, position on left side
    if (infoX + infoWidth > p.width - 20) {
      infoX = mustang.x - mustang.size - infoWidth;
    }
    
    // Draw info panel background
    p.fill(33, 46, 121, 245);
    p.stroke(204, 0, 53);
    p.strokeWeight(2);
    p.rectMode(p.CORNER);
    p.rect(infoX, infoY, infoWidth, 140, 10);
    
    // Draw info text
    p.noStroke();
    p.textAlign(p.LEFT, p.TOP);
    p.fill(255);
    p.textSize(20); // Increased from 18 for better readability
    p.text(`Group Range: ${data.groupRange}`, infoX + 12, infoY + 12);
    
    p.textSize(18); // Increased from 16 for better readability
    p.fill(240);
    p.text(`Total Groups: ${data.avgTotal.toFixed(1)}`, infoX + 12, infoY + 42);
    
    p.fill(249, 220, 92);
    p.text(`Active Groups: ${data.avgActive.toFixed(1)}`, infoX + 12, infoY + 72);
    
    p.fill(89, 195, 195);
    p.text(`Inactive Groups: ${(data.avgTotal - data.avgActive).toFixed(1)}`, infoX + 12, infoY + 102);
  }
  
  checkHover(x, y) {
    let hoveredMustang = null;
    
    // Reset hover state
    for (let mustang of this.mustangs) {
      mustang.hovering = false;
    }
    
    // Check if mouse is over any mustang
    for (let mustang of this.mustangs) {
      const d = this.p.dist(x, y, mustang.x, mustang.y);
      if (d < mustang.size * 0.8) {
        hoveredMustang = mustang;
        mustang.hovering = true;
        break;
      }
    }
    
    this.hoverMustang = hoveredMustang;
  }
}