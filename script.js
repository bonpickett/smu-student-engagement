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
    
    // For single view mode, make sure the visualization container has enough height
    container.style.minHeight = "80vh"; // Ensure there's enough vertical space
  }
  
  // Resize visualizations after changing view
  setTimeout(resizeVisualizations, 50);
}

// P5.js instance mode for Class of 2025 visualization
const sketch2025 = function(p) {
  p.dataArt = null;
  
  p.setup = function() {
    const container = document.getElementById('viz-2025');
    
    // Create canvas
    p.createCanvas(container.offsetWidth, container.offsetHeight);
    
    // Set willReadFrequently directly on the canvas DOM element
    document.querySelectorAll('#viz-2025 canvas').forEach(canvas => {
      canvas.willReadFrequently = true;
    });
    
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
    
    // Create canvas
    p.createCanvas(container.offsetWidth, container.offsetHeight);
    
    // Set willReadFrequently directly on the canvas DOM element
    document.querySelectorAll('#viz-2026 canvas').forEach(canvas => {
      canvas.willReadFrequently = true;
    });
    
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
    { groupRange: "46-49", avgTotal: 45.0, avgActive: 40.5, activeRatio: 90.0 }, 
    { groupRange: "50-59", avgTotal: 50.0, avgActive: 45.0, activeRatio: 90.0 },
    { groupRange: "60-69", avgTotal: 65.0, avgActive: 58.5, activeRatio: 90.0 }, 
    { groupRange: "70+", avgTotal: 75.0, avgActive: 67.5, activeRatio: 90.0 }    
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

// Visualization class - using SMU-themed community network representation
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
    
    // Add animation parameters
    this.horseshoeRotationSpeed = 0.005; // Controls rotation speed
    this.pulseAnimationSpeed = 0.8;  // Controls pulsing speed
    this.rotationAngles = [];        // Store rotation angles for each mustang
    this.dashOffsets = [];           // Store dash pattern offsets for animation
    
    // Parameters for growing effect on hover - increased for more dramatic effect
    this.growFactor = 2.0;           // How much to grow the hovered mustang (2.0 = 100% larger/double size)
    this.growEasing = 0.08;          // Slightly slower easing for smoother growth with larger size
    this.originalSizes = [];         // Store original sizes for reference
    
    // New parameters for SMU-themed visualization
    this.miniMustangCount = []; // Store count of mini nodes for each element
    this.miniMustangPositions = []; // Store positions of nodes
    
    // New parameters for centering hover effect
    this.centeringEasing = 0.06;     // Easing factor for centering animation (reduced for smoother movement)
    this.centeringEnabled = true;    // Flag to enable/disable centering feature
    this.originalPositions = [];     // Store original grid positions
    
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
  
  // Create community network representation for total groups
  createCommunityCircle(p, diameter, color) {
    return {
      draw: function(x, y, rotation = 0, opacity = 1) {
        p.push();
        p.translate(x, y);
        p.rotate(rotation);
        
        // Draw main community circle
        p.noFill();
        p.stroke(color[0], color[1], color[2], opacity * 255);
        p.strokeWeight(3);
        p.ellipse(0, 0, diameter, diameter);
        
        // Add network lines inside the circle
        const numLines = 8;
        const angleStep = p.TWO_PI / numLines;
        
        p.strokeWeight(1.5);
        p.stroke(color[0], color[1], color[2], opacity * 180);
        
        // Create a web-like pattern
        for (let i = 0; i < numLines/2; i++) {
          const angle1 = i * angleStep;
          const x1 = (diameter/2) * p.cos(angle1);
          const y1 = (diameter/2) * p.sin(angle1);
          
          for (let j = 0; j < numLines/2; j++) {
            if (i !== j) {
              const angle2 = (j + numLines/2) * angleStep;
              const x2 = (diameter/2) * p.cos(angle2);
              const y2 = (diameter/2) * p.sin(angle2);
              
              p.line(x1, y1, x2, y2);
            }
          }
        }
        
        p.pop();
      }
    };
  }
  
  // Create connection nodes for active groups
  createConnectionNode(p, color) {
    return {
      draw: function(x, y, size, rotation = 0, opacity = 1, isActive = true) {
        p.push();
        p.translate(x, y);
        p.rotate(rotation);
        
        // Draw connection node
        if (isActive) {
          // Active node
          p.fill(color[0], color[1], color[2], opacity * 255);
          p.noStroke();
          p.ellipse(0, 0, size, size);
          
          // Add glow effect
          p.noFill();
          p.stroke(color[0], color[1], color[2], opacity * 120);
          p.strokeWeight(2);
          p.ellipse(0, 0, size * 1.3, size * 1.3);
        } else {
          // Inactive node - more subtle
          p.noFill();
          p.stroke(color[0], color[1], color[2], opacity * 150);
          p.strokeWeight(1);
          p.ellipse(0, 0, size, size);
          
          // Add X mark for inactive
          p.stroke(color[0], color[1], color[2], opacity * 100);
          p.line(-size/4, -size/4, size/4, size/4);
          p.line(-size/4, size/4, size/4, -size/4);
        }
        
        p.pop();
      }
    };
  }
  
  // Create connection lines between nodes
  createConnectionLines(p, color) {
    return {
      draw: function(x, y, radius, numConnections, rotation = 0, opacity = 1) {
        p.push();
        p.translate(x, y);
        p.rotate(rotation);
        
        p.noFill();
        p.stroke(color[0], color[1], color[2], opacity * 200);
        p.strokeWeight(1.5);
        
        // Draw radial connection lines
        const angleStep = p.TWO_PI / numConnections;
        
        for (let i = 0; i < numConnections; i++) {
          const angle = i * angleStep;
          const x2 = radius * p.cos(angle);
          const y2 = radius * p.sin(angle);
          
          // Draw dashed line
          p.drawingContext.setLineDash([5, 5]);
          p.line(0, 0, x2, y2);
        }
        
        // Reset line dash
        p.drawingContext.setLineDash([]);
        
        p.pop();
      }
    };
  }
  
  // Create person icon for the nodes
  createPersonIcon(p, color) {
    return {
      draw: function(x, y, size, rotation = 0, opacity = 1) {
        p.push();
        p.translate(x, y);
        p.rotate(rotation);
        
        // Draw person icon
        p.noStroke();
        p.fill(color[0], color[1], color[2], opacity * 255);
        
        // Head
        p.ellipse(0, -size/3, size/2.5, size/2.5);
        
        // Body
        p.ellipse(0, size/6, size/2, size/1.8);
        
        // Add simple details to make it more human-like
        p.fill(255, 255, 255, opacity * 200);
        p.ellipse(-size/10, -size/3, size/12, size/8); // Left eye
        p.ellipse(size/10, -size/3, size/12, size/8);  // Right eye
        
        p.pop();
      }
    };
  }
  
  initializeVisualization() {
    const p = this.p;
    
    // Create a grid layout for mustangs with adjusted spacing
    // Using fewer columns and rows to make everything larger
    const rows = 4;
    const cols = 4; // Reduced from 5 to 4 to make each item larger
    const totalMustangs = this.studentData.length;
    
    // Use a consistent starting point for both visualizations
    // Ensure there's enough space at the bottom by positioning relative to total height
    // For the "both" view, we need to add more space at the top for the titles
    const isBothView = currentView === 'both';
    const startY = p.height * (isBothView ? 0.17 : 0.1); // Start higher in single view, lower in both view
    
    // Define consistent spacing for both classes
    // Use a smaller portion of the available height to ensure all rows fit
    const availableHeight = p.height * 0.85; // Increased from 0.9 to avoid cutoff
    
    // Calculate spacing based on available space
    const gridSpacingX = p.width * 0.8 / (cols - 1);
    const gridSpacingY = availableHeight / rows; // Changed to divide by rows instead of rows-1
    
    const startX = this.centerX - (gridSpacingX * (cols - 1)) / 2;
    
    // Calculate the maximum mustang size and community circle sizes
    const maxMustangSize = Math.min(gridSpacingX * 0.4, gridSpacingY * 0.4);
    const maxCircleSize = Math.min(gridSpacingX, gridSpacingY) * 0.8; // Larger for better visibility
    
    // Create mustangs for each student group range
    for (let i = 0; i < totalMustangs; i++) {
      // Calculate grid position
      const row = Math.floor(i / cols);
      const col = i % cols;
      
      const x = startX + col * gridSpacingX;
      const y = startY + row * gridSpacingY;
      
      // Store original position for later reference
      this.originalPositions[i] = { x: x, y: y };
      
      // Initialize animation values for this mustang
      this.rotationAngles[i] = 0;
      this.dashOffsets[i] = p.random(0, 100); // Random starting offset
      
      // Determine mustang size based on total group count - larger base size
      const maxGroupCount = this.studentData === class2026Data ? 80 : 50;
      // Calculate base size from data but cap it to prevent overlap
      const baseSize = p.map(p.sqrt(this.studentData[i].avgTotal), 0, p.sqrt(maxGroupCount), 40, 110);
      const size = Math.min(baseSize, maxMustangSize);
      
      // Store the original size for the growing effect
      this.originalSizes[i] = size;
      
      // Calculate community network sizes based on data
      // Community circle diameter (outer representation - total groups)
      const circleDiameter = p.map(this.studentData[i].avgTotal, 0, maxGroupCount, size * 2.0, maxCircleSize);
      
      // Connection radius (for active nodes)
      const connectionRadius = circleDiameter * 0.4;
      
      // Calculate number of nodes to show based on total groups
      // We'll split them between active and inactive
      const totalNodes = Math.min(12, Math.ceil(this.studentData[i].avgTotal / 3));
      const activeNodes = Math.ceil((this.studentData[i].avgActive / this.studentData[i].avgTotal) * totalNodes);
      const inactiveNodes = totalNodes - activeNodes;
      
      // Store node counts
      this.miniMustangCount[i] = { active: activeNodes, inactive: inactiveNodes, total: totalNodes };
      this.miniMustangPositions[i] = [];
      
      // Calculate positions for nodes around the mustang
      for (let j = 0; j < totalNodes; j++) {
        // Distribute nodes evenly in a circle
        const angle = j * (p.TWO_PI / totalNodes);
        const distance = connectionRadius;
        const nodeX = distance * p.cos(angle);
        const nodeY = distance * p.sin(angle);
        
        // Add some randomness to size and rotation
        const rotation = p.random(-p.PI/8, p.PI/8);
        const isActive = j < activeNodes; // First nodes will be active
        
        this.miniMustangPositions[i].push({
          x: nodeX,
          y: nodeY,
          angle: angle,
          rotation: rotation,
          originalX: nodeX,
          originalY: nodeY,
          size: size * 0.25, // Size relative to main mustang
          speed: p.random(0.02, 0.05),
          isActive: isActive
        });
      }
      
      // Get color based on activation ratio
      const colorRgb = this.getColorFromPalette(this.studentData[i].activeRatio);
      
      const mustang = {
        x: x,
        y: y,
        targetX: x,
        targetY: y,
        originalX: x, // Store original X position for returning after hover
        originalY: y, // Store original Y position for returning after hover
        size: size,
        displaySize: size, // New property for animated size
        originalSize: size, // Keep track of the original size
        data: this.studentData[i],
        colorRgb: colorRgb,
        angle: 0,
        verticalOffset: 0, // For animation - vertical component
        tiltAngle: 0,      // For animation - rotational component
        gallopSpeed: p.random(0.04, 0.05) * this.animationSpeed, // Smoother animation
        hovering: false,
        row: row,
        col: col,
        // New properties for community-themed representation
        circleDiameter: circleDiameter,
        originalCircleDiameter: circleDiameter,
        connectionRadius: connectionRadius,
        originalConnectionRadius: connectionRadius,
        // Animation properties
        circlePulse: 0,
        nodePulse: 0,
        elementOpacity: 0.85,
        // Animation timing
        rotationSpeed: p.random(0.001, 0.003) * (i % 2 === 0 ? 1 : -1), // Alternate directions
        pulsePhase: p.random(0, p.TWO_PI),                              // Random phase for pulse
        dashOffset: this.dashOffsets[i],
        // All mustangs facing same direction
        flipX: false,
        // Edge detection flag - for centering on hover
        isNearEdge: false
      };
      
      this.mustangs.push(mustang);
    }
    
    // Create the reusable community visualization objects
    this.communityCircle = this.createCommunityCircle(p, 100, this.smuTeal);
    this.connectionNode = this.createConnectionNode(p, this.smuRed);
    this.connectionLines = this.createConnectionLines(p, this.smuYellow);
    this.personIcon = this.createPersonIcon(p, this.smuYellow);
  }
  
  resize() {
    const p = this.p;
    this.centerX = p.width / 2;
    this.centerY = p.height / 2;
    
    // Recalculate grid layout with adjusted spacing
    const rows = 4;
    const cols = 4; // Reduced from 5 to 4
    
    // Adjust these values to ensure all rows are visible in single-view mode
    // Use a larger portion of the available height
    const availableHeight = p.height * 0.85; // Increased from 0.9 to ensure all content fits
    const gridSpacingX = p.width * 0.8 / (cols - 1);
    const gridSpacingY = availableHeight / rows; // Use full division by rows to space items evenly
    
    const startX = this.centerX - (gridSpacingX * (cols - 1)) / 2;
    
    // Adjust starting Y position based on view mode
    // When in "both" view, we need more space at the top for the titles
    const isBothView = currentView === 'both';
    const startY = p.height * (isBothView ? 0.17 : 0.1); // Start higher in single view, lower in both view
    
    // Calculate the maximum mustang size and circle sizes
    const maxMustangSize = Math.min(gridSpacingX * 0.4, gridSpacingY * 0.4);
    const maxCircleSize = Math.min(gridSpacingX, gridSpacingY) * 0.8;
    
    // Reposition mustangs
    for (let i = 0; i < this.mustangs.length; i++) {
      const mustang = this.mustangs[i];
      const row = Math.floor(i / cols); // Recalculate row based on new column count
      const col = i % cols;
      
      mustang.row = row; // Update the row property
      mustang.col = col; // Update the col property
      
      // Calculate new grid position
      const newX = startX + col * gridSpacingX;
      const newY = startY + row * gridSpacingY;
      
      // Update original position
      mustang.originalX = newX;
      mustang.originalY = newY;
      this.originalPositions[i] = { x: newX, y: newY };
      
      // If not hovering, update target position too
      if (!mustang.hovering) {
        mustang.targetX = newX;
        mustang.targetY = newY;
      } else if (this.centeringEnabled) {
        // If hovering and centering is enabled, keep target as center
        mustang.targetX = this.centerX;
        mustang.targetY = this.centerY;
      }
      
      // Recalculate size to prevent overlap
      const maxGroupCount = this.studentData === class2026Data ? 80 : 50;
      const baseSize = p.map(p.sqrt(mustang.data.avgTotal), 0, p.sqrt(maxGroupCount), 40, 110);
      mustang.originalSize = Math.min(baseSize, maxMustangSize);
      
      // Update current size based on hover state
      if (mustang.hovering) {
        mustang.size = mustang.originalSize * this.growFactor;
      } else {
        mustang.size = mustang.originalSize;
      }
      
      // Store the new original size
      this.originalSizes[i] = mustang.originalSize;
      
      // Recalculate community network sizes
      mustang.originalCircleDiameter = p.map(mustang.data.avgTotal, 0, maxGroupCount, mustang.originalSize * 2.0, maxCircleSize);
      mustang.originalConnectionRadius = mustang.originalCircleDiameter * 0.4;
      
      // Update current circle sizes based on hover state
      if (mustang.hovering) {
        mustang.circleDiameter = mustang.originalCircleDiameter * this.growFactor;
        mustang.connectionRadius = mustang.originalConnectionRadius * this.growFactor;
      } else {
        mustang.circleDiameter = mustang.originalCircleDiameter;
        mustang.connectionRadius = mustang.originalConnectionRadius;
      }
      
      // Also update node positions if needed
      if (this.miniMustangCount[i] && this.miniMustangCount[i].total) {
        const totalNodes = this.miniMustangCount[i].total;
        
        // Recalculate node positions around the circle
        for (let j = 0; j < totalNodes; j++) {
          if (this.miniMustangPositions[i] && this.miniMustangPositions[i][j]) {
            const angle = j * (p.TWO_PI / totalNodes);
            const distance = mustang.originalConnectionRadius;
            const nodeX = distance * p.cos(angle);
            const nodeY = distance * p.sin(angle);
            
            const node = this.miniMustangPositions[i][j];
            node.originalX = nodeX;
            node.originalY = nodeY;
            node.angle = angle;
            node.size = mustang.originalSize * 0.25;
          }
        }
      }
    }
  }
  
  // Check if a mustang is close to the screen edge
  checkIfNearEdge(mustang) {
    const p = this.p;
    const buffer = mustang.size * 1.2; // Buffer distance from the edge
    
    // Check if mustang is close to any edge of the screen
    const isCloseToLeftEdge = mustang.x < buffer;
    const isCloseToRightEdge = mustang.x > p.width - buffer;
    const isCloseToTopEdge = mustang.y < buffer;
    const isCloseToBottomEdge = mustang.y > p.height - buffer;
    
    return isCloseToLeftEdge || isCloseToRightEdge || isCloseToTopEdge || isCloseToBottomEdge;
  }
  
  update() {
    const p = this.p;
    this.time += 0.01;
    
    const isDimming = this.hoverMustang !== null;
    
    // Update mustangs
    for (let i = 0; i < this.mustangs.length; i++) {
      const mustang = this.mustangs[i];
      
      // Update target position based on hover state
      if (this.centeringEnabled) {
        if (mustang.hovering) {
          // If hovering, move towards center of screen
          mustang.targetX = this.centerX;
          mustang.targetY = this.centerY;
        } else {
          // If not hovering, move back to original position
          mustang.targetX = mustang.originalX;
          mustang.targetY = mustang.originalY;
        }
      }
      
      // Apply easing to movement - using different easing based on hover state
      // More sophisticated easing for smoother movement
      // Calculate distance to target
      const distToTarget = p.dist(mustang.x, mustang.y, mustang.targetX, mustang.targetY);
      
      // Dynamic easing - start fast, slow down as it approaches target
      let positionEasing;
      if (mustang.hovering) {
        // Smoother, more deliberate movement to center when hovered
        positionEasing = p.map(distToTarget, 0, 300, this.centeringEasing * 0.5, this.centeringEasing * 1.2);
      } else {
        // Gentle return to original position
        positionEasing = this.centeringEasing * 0.8;
      }
      
      // Apply the calculated easing
      mustang.x = p.lerp(mustang.x, mustang.targetX, positionEasing);
      mustang.y = p.lerp(mustang.y, mustang.targetY, positionEasing);
      
      // Continuously animate elements (slower when not hovering)
      const animationSpeedFactor = mustang.hovering ? 1.0 : 0.3;
      
      // Update rotation angle based on rotation speed
      this.rotationAngles[i] += mustang.rotationSpeed * animationSpeedFactor;
      
      // Update dash offset for continuous motion
      mustang.dashOffset -= 0.2 * animationSpeedFactor;
      if (mustang.dashOffset < 0) mustang.dashOffset += 100;
      
      // Handle size growth on hover
      if (mustang.hovering) {
        // Grow the mustang when hovering
        const targetSize = this.originalSizes[i] * this.growFactor;
        mustang.size = p.lerp(mustang.size, targetSize, this.growEasing);
        
        // Also grow the community elements proportionally
        mustang.circleDiameter = p.lerp(mustang.circleDiameter, mustang.originalCircleDiameter * this.growFactor, this.growEasing);
        mustang.connectionRadius = p.lerp(mustang.connectionRadius, mustang.originalConnectionRadius * this.growFactor, this.growEasing);
        
        // Additional animation when hovering
        const floatCycle = this.time * 2.5;
        mustang.verticalOffset = p.sin(floatCycle) * 2.0;
        mustang.tiltAngle = p.sin(floatCycle - p.PI/6) * 0.02;
        
        // Enhanced animation for elements when hovering
        mustang.circlePulse = p.sin(this.time * this.pulseAnimationSpeed * 2 + mustang.pulsePhase) * 4;
        mustang.nodePulse = p.sin(this.time * this.pulseAnimationSpeed * 3 + mustang.pulsePhase + p.PI/4) * 3;
        mustang.elementOpacity = 0.95; // Increased opacity when hovering
        
        // Update node animations - make them more active when hovering
        if (this.miniMustangCount[i] && this.miniMustangCount[i].total) {
          const totalNodes = this.miniMustangCount[i].total;
          for (let j = 0; j < totalNodes; j++) {
            if (this.miniMustangPositions[i] && this.miniMustangPositions[i][j]) {
              const node = this.miniMustangPositions[i][j];
              
              // Create more dynamic movement for nodes when hovering
              // Nodes move closer/further from center to show activity
              const time = this.time * node.speed * 2;
              const originalRadius = mustang.connectionRadius;
              const pulseRadius = 0.2 * originalRadius * (node.isActive ? 0.7 : 0.3);
              const radiusOffset = p.sin(time + j * 0.7) * pulseRadius;
              
              // Calculate position with pulsing radius
              const currentRadius = originalRadius + radiusOffset;
              node.x = currentRadius * p.cos(node.angle + p.sin(time * 0.2) * 0.05);
              node.y = currentRadius * p.sin(node.angle + p.sin(time * 0.2) * 0.05);
              
              // Add slight rotation to the node itself
              node.rotation = p.sin(time * 0.5) * 0.1;
            }
          }
        }
      } else {
        // Shrink back to normal size when not hovering
        mustang.size = p.lerp(mustang.size, this.originalSizes[i], this.growEasing);
        
        // Also shrink the community elements back to normal
        mustang.circleDiameter = p.lerp(mustang.circleDiameter, mustang.originalCircleDiameter, this.growEasing);
        mustang.connectionRadius = p.lerp(mustang.connectionRadius, mustang.originalConnectionRadius, this.growEasing);
        
        // Reset animation when not hovering
        mustang.verticalOffset = 0;
        mustang.tiltAngle = 0;
        
        // Subtle animation for elements when not hovering
        mustang.circlePulse = p.sin(this.time * this.pulseAnimationSpeed + mustang.pulsePhase) * 1.5;
        mustang.nodePulse = p.sin(this.time * this.pulseAnimationSpeed + mustang.pulsePhase + p.PI/3) * 1;
        mustang.elementOpacity = isDimming && mustang !== this.hoverMustang ? 0.4 : 0.85;
        
        // Update node animations - more subtle when not hovering
        if (this.miniMustangCount[i] && this.miniMustangCount[i].total) {
          const totalNodes = this.miniMustangCount[i].total;
          for (let j = 0; j < totalNodes; j++) {
            if (this.miniMustangPositions[i] && this.miniMustangPositions[i][j]) {
              const node = this.miniMustangPositions[i][j];
              
              // More subtle movement when not hovering
              const time = this.time * node.speed * 0.5;
              
              // Slight movement around original position
              // Active nodes move more than inactive ones
              const moveAmt = node.isActive ? 2 : 1;
              node.x = node.originalX + p.sin(time + j * 1.2) * moveAmt;
              node.y = node.originalY + p.cos(time * 0.8 + j) * moveAmt;
              node.rotation = p.sin(time * 0.3) * 0.05;
            }
          }
        }
      }
      
      // Update edge detection flag
      mustang.isNearEdge = this.checkIfNearEdge(mustang);
    }
  }
  
  display() {
    const p = this.p;
    
    // Draw background elements
    this.drawBackgroundElements();
    
    // Check if we need to apply dimming effect
    const isDimming = this.hoverMustang !== null;
    
    // First, draw the community circles (total groups representation)
    for (let i = 0; i < this.mustangs.length; i++) {
      const mustang = this.mustangs[i];
      // Draw the community circles with appropriate dimming
      if (!isDimming || mustang === this.hoverMustang) {
        this.drawCommunityCircle(mustang, false, i);
      } else {
        this.drawCommunityCircle(mustang, true, i);
      }
    }
    
    // Draw the connection lines from mustang to nodes
    for (let i = 0; i < this.mustangs.length; i++) {
      const mustang = this.mustangs[i];
      // Draw the connection lines with appropriate dimming
      if (!isDimming || mustang === this.hoverMustang) {
        this.drawConnectionLines(mustang, false, i);
      } else {
        this.drawConnectionLines(mustang, true, i);
      }
    }
    
    // Next, draw the connection nodes (both active and inactive)
    for (let i = 0; i < this.mustangs.length; i++) {
      const mustang = this.mustangs[i];
      // Draw the nodes with appropriate dimming
      if (!isDimming || mustang === this.hoverMustang) {
        this.drawConnectionNodes(mustang, false, i);
      } else {
        this.drawConnectionNodes(mustang, true, i);
      }
    }
    
    // Then draw the main mustangs on top
    for (let mustang of this.mustangs) {
      // Draw dimmed mustangs first (if any hovered)
      if (isDimming && mustang !== this.hoverMustang) {
        this.drawMustangSvg(mustang, true); // true = dimmed
      }
    }
    
    // Draw the hovered mustang
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
  
  // Method to draw the community circle representation
  drawCommunityCircle(mustang, dimmed = false, index) {
    const p = this.p;
    
    // Determine opacity based on hover/dimmed state
    const opacity = dimmed ? 0.3 : mustang.elementOpacity;
    
    // Calculate diameter with pulse effect
    const diameter = mustang.circleDiameter + (mustang.circlePulse || 0);
    
    // Draw the community circle
    this.communityCircle.draw(
      mustang.x, 
      mustang.y,
      this.rotationAngles[index] * 0.1, // Slight rotation
      opacity
    );
  }
  
  // Method to draw the connection lines
  drawConnectionLines(mustang, dimmed = false, index) {
    const p = this.p;
    
    // Determine opacity based on hover/dimmed state
    const opacity = dimmed ? 0.3 : mustang.elementOpacity;
    
    // Draw the connection lines
    if (this.miniMustangCount[index] && this.miniMustangCount[index].total) {
      const totalNodes = this.miniMustangCount[index].total;
      
      this.connectionLines.draw(
        mustang.x,
        mustang.y,
        mustang.connectionRadius, // Radius for connections
        totalNodes, // Number of connections
        this.rotationAngles[index] * -0.05, // Slight counter-rotation
        opacity
      );
    }
  }
  
  // Method to draw the connection nodes
  drawConnectionNodes(mustang, dimmed = false, index) {
    const p = this.p;
    
    // Determine opacity based on hover/dimmed state
    const opacity = dimmed ? 0.3 : mustang.elementOpacity;
    
    // Get the node information for this element
    if (this.miniMustangCount[index] && this.miniMustangCount[index].total) {
      const totalNodes = this.miniMustangCount[index].total;
      
      // Draw each node
      for (let j = 0; j < totalNodes; j++) {
        if (this.miniMustangPositions[index] && this.miniMustangPositions[index][j]) {
          const node = this.miniMustangPositions[index][j];
          
          // Adjust position based on the main mustang position
          const x = mustang.x + node.x;
          const y = mustang.y + node.y;
          
          // First draw the connection node
          this.connectionNode.draw(
            x,
            y,
            node.size * (mustang.hovering ? this.growFactor : 1), // Scale when hovering
            node.rotation,
            opacity,
            node.isActive // Pass whether node is active or not
          );
          
          // Then draw a person icon for active nodes only
          if (node.isActive) {
            this.personIcon.draw(
              x,
              y,
              node.size * 0.9 * (mustang.hovering ? this.growFactor : 1), // Slightly smaller than the node
              node.rotation,
              opacity
            );
          }
        }
      }
    }
  }
  
  drawBackgroundElements() {
    const p = this.p;
    
    // Clear the canvas first
    p.clear();
    
    // Use a semi-transparent background to blend with the page background
    p.background(0, 0, 0, 20);
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
    
    // Check if mustangSvg is defined before using it
    if (mustangSvg) {
      // Calculate aspect ratio adjustment using the current (possibly grown) size
      const targetWidth = mustang.size;
      const targetHeight = targetWidth * (mustangSvg.height / mustangSvg.width);
      
      // Draw the SVG image
      p.imageMode(p.CENTER);
      p.image(mustangSvg, 0, 0, targetWidth, targetHeight);
    } else {
      // Fallback if SVG is not loaded - draw a simple shape
      p.noStroke();
      p.fill(mustang.colorRgb[0], mustang.colorRgb[1], mustang.colorRgb[2]);
      p.ellipse(0, 0, mustang.size, mustang.size * 0.75);
    }
    
    // Remove tint
    p.noTint();
    
    p.pop();
    
    // Only display text if not hovering (when hovering, info box shows data instead)
    if (!mustang.hovering) {
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
      
      // Use white text with a dark outline for better visibility against yellow elements
      // First draw outline/shadow
      p.fill(0, 0, 0, dimmed ? 100 : 150);
      for (let ox = -1; ox <= 1; ox += 1) {
        for (let oy = -1; oy <= 1; oy += 1) {
          if (ox !== 0 || oy !== 0) {
            p.text(`${mustang.data.activeRatio.toFixed(1)}%`, mustang.x + ox, percentTextY + oy);
          }
        }
      }
      
      // Then draw the white text on top
      p.fill(255, 255, 255, dimmed ? 180 : 255);
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
    const infoWidth = 340; // Increased width to fit longer text
    
    // If too close to right edge, position on left side
    if (infoX + infoWidth > p.width - 20) {
      infoX = mustang.x - mustang.size - infoWidth;
    }
    
    // Draw info panel background with SMU blue
    p.fill(this.smuBlue[0], this.smuBlue[1], this.smuBlue[2], 245);
    p.stroke(this.smuRed[0], this.smuRed[1], this.smuRed[2]);
    p.strokeWeight(2);
    p.rectMode(p.CORNER);
    p.rect(infoX, infoY, infoWidth, 160, 10); // Adjusted height for content
    
    // Add community theme detail to info panel
    p.strokeWeight(1);
    p.stroke(this.smuYellow[0], this.smuYellow[1], this.smuYellow[2], 100);
    p.drawingContext.setLineDash([5, 5]);
    p.line(infoX + 10, infoY + 35, infoX + infoWidth - 10, infoY + 35);
    p.drawingContext.setLineDash([]);
    
    // Draw small nodes at either end of the line
    p.fill(this.smuYellow[0], this.smuYellow[1], this.smuYellow[2], 180);
    p.noStroke();
    p.ellipse(infoX + 10, infoY + 35, 6, 6);
    p.ellipse(infoX + infoWidth - 10, infoY + 35, 6, 6);
    
    // Draw info text
    p.noStroke();
    p.textAlign(p.LEFT, p.TOP);
    
    // Group Range (White) - Title
    p.fill(255);
    p.textSize(20);
    p.text(`Group Range: ${data.groupRange}`, infoX + 15, infoY + 12);
    
    // Total Groups (Teal) - With updated text
    p.fill(this.smuTeal[0], this.smuTeal[1], this.smuTeal[2]);
    p.textSize(18);
    p.text(`Average Total Groups/Student: ${data.avgTotal.toFixed(1)}`, infoX + 15, infoY + 45);
    
    // Active Groups - White
    p.fill(255, 255, 255);
    p.text(`Active Groups: ${data.avgActive.toFixed(1)}`, infoX + 15, infoY + 75);
    
    // Inactive Groups - White
    p.fill(255, 255, 255);
    p.text(`Inactive Groups: ${(data.avgTotal - data.avgActive).toFixed(1)}`, infoX + 15, infoY + 105);
    
    // Activity Ratio - White
    p.fill(255, 255, 255);
    p.text(`Activity Ratio: ${data.activeRatio.toFixed(1)}%`, infoX + 15, infoY + 135);
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
        
        // Check if the mustang is near the edge of the screen
        mustang.isNearEdge = this.checkIfNearEdge(mustang);
        break;
      }
    }
    
    this.hoverMustang = hoveredMustang;
    
    // If we have a newly hovered mustang, update its target position to the center
    if (this.hoverMustang && this.centeringEnabled) {
      this.hoverMustang.targetX = this.centerX;
      this.hoverMustang.targetY = this.centerY;
    }
  }
}