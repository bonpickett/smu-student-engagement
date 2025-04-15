/**
 * mosaic.js - Core visualization logic for SMU Spirit Mosaic
 * Renders the student data as an interactive mosaic
 */

class SpiritMosaic {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container element not found: ${containerId}`);
      return;
    }
    
    // Canvas setup
    this.canvas = document.createElement('canvas');
    this.container.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');
    
    // Initialize core properties
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    // View parameters
    this.zoomLevel = 0.4; // Start zoomed out to see the pattern
    this.viewX = 0;
    this.viewY = 0;
    this.minZoom = 0.2;
    this.maxZoom = 5.0;
    this.tileSize = 15; // Smaller tiles to make the pattern more visible
    
    // Display settings
    this.displayMode = 'mosaic'; // 'mosaic', 'network', 'evolution'
    this.colorBy = 'category'; // 'category', 'style', 'intensity'
    this.selectedStudentId = null;
    this.hoveredStudentId = null;
    this.animationFrame = 0;
    this.animationSpeed = 0.05;
    
    // Interaction state
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    // Initialize logo images object
    this.logoImages = {};
    
    // Load the SVG and logo images
    this.loadSVGImage();
    this.loadLogoImages();
    
    // Bind event handlers
    this.bindEvents();
  }
  
  // Set up event listeners
  bindEvents() {
    // Mouse events for panning and interaction
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
    
    // Mouse wheel for zooming
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Window resize event
    window.addEventListener('resize', this.handleResize.bind(this));
  }
  
  // Handle window resize
  handleResize() {
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.render();
  }
  
  // Mouse down event handler
  handleMouseDown(e) {
    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    
    // Check if a student was clicked
    const student = this.getStudentAtPosition(e.clientX, e.clientY);
    if (student) {
      this.selectStudent(student.id);
    }
    
    this.canvas.style.cursor = 'grabbing';
  }
  
  // Mouse move event handler
  handleMouseMove(e) {
    if (this.isDragging) {
      // Pan the view
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      
      this.viewX += dx / this.zoomLevel;
      this.viewY += dy / this.zoomLevel;
      
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      
      this.render();
    } else {
      // Check for hover
      const student = this.getStudentAtPosition(e.clientX, e.clientY);
      if (student) {
        this.hoveredStudentId = student.id;
        this.canvas.style.cursor = 'pointer';
      } else {
        this.hoveredStudentId = null;
        this.canvas.style.cursor = 'grab';
      }
      this.render();
    }
  }
  
  // Mouse up event handler
  handleMouseUp() {
    this.isDragging = false;
    this.canvas.style.cursor = 'grab';
  }
  
  // Mouse wheel event handler for zooming
  handleWheel(e) {
    e.preventDefault();
    
    // Calculate zoom based on scroll direction
    const delta = -Math.sign(e.deltaY) * 0.1;
    const newZoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel * (1 + delta)));
    
    // Calculate mouse position in world space
    const mouseX = (e.clientX - this.container.getBoundingClientRect().left);
    const mouseY = (e.clientY - this.container.getBoundingClientRect().top);
    
    // Calculate world point under mouse
    const worldX = (mouseX / this.zoomLevel) - this.viewX;
    const worldY = (mouseY / this.zoomLevel) - this.viewY;
    
    // Apply zoom
    this.zoomLevel = newZoom;
    
    // Adjust view to keep point under mouse fixed
    this.viewX = -(worldX * this.zoomLevel - mouseX);
    this.viewY = -(worldY * this.zoomLevel - mouseY);
    
    this.render();
  }
  
  // Touch start handler
  handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.lastMouseX = touch.clientX;
      this.lastMouseY = touch.clientY;
      this.isDragging = true;
      
      // Check if a student was touched
      const student = this.getStudentAtPosition(touch.clientX, touch.clientY);
      if (student) {
        this.selectStudent(student.id);
      }
    }
  }
  
  // Touch move handler
  handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1 && this.isDragging) {
      const touch = e.touches[0];
      
      // Pan the view
      const dx = touch.clientX - this.lastMouseX;
      const dy = touch.clientY - this.lastMouseY;
      
      this.viewX += dx / this.zoomLevel;
      this.viewY += dy / this.zoomLevel;
      
      this.lastMouseX = touch.clientX;
      this.lastMouseY = touch.clientY;
      
      this.render();
    }
  }
  
  // Touch end handler
  handleTouchEnd() {
    this.isDragging = false;
  }
  
  // Find student at a specific screen position
  getStudentAtPosition(screenX, screenY) {
    // Convert screen coordinates to world coordinates
    const rect = this.canvas.getBoundingClientRect();
    const canvasX = screenX - rect.left;
    const canvasY = screenY - rect.top;
    
    const worldX = (canvasX / this.zoomLevel) - this.viewX;
    const worldY = (canvasY / this.zoomLevel) - this.viewY;
    
    // Check each student
    for (const student of dataManager.filteredStudents) {
      const pos = dataManager.getStudentPosition(student.id);
      const x = pos.x * this.width;
      const y = pos.y * this.height;
      
      // Adjust hit box size based on zoom level
      const effectiveTileSize = this.getTileSize(student);
      
      if (
        worldX >= x - effectiveTileSize/2 &&
        worldX <= x + effectiveTileSize/2 &&
        worldY >= y - effectiveTileSize/2 &&
        worldY <= y + effectiveTileSize/2
      ) {
        return student;
      }
    }
    
    return null;
  }
  
  // Calculate the size of a student tile
  getTileSize(student) {
    // Base size varies by number of events
    const eventCount = student.events.length;
    let size = this.tileSize * (0.8 + (eventCount / 20)); // Scale by events, but not too much
    
    // Increase size for selected student
    if (student.id === this.selectedStudentId) {
      size *= 1.5;
    } 
    // Slightly increase size for hovered student
    else if (student.id === this.hoveredStudentId) {
      size *= 1.2;
    }
    
    return size;
  }
  
  // Select a student for detailed view
  selectStudent(studentId) {
    if (this.selectedStudentId !== studentId) {
      this.selectedStudentId = studentId;
      
      // Trigger event for details panel update
      const event = new CustomEvent('studentSelected', {
        detail: { studentId }
      });
      document.dispatchEvent(event);
      
      this.render();
    }
  }
  
  // Update the visualization with new data
  update(displayMode, colorBy, filterCategory) {
    this.displayMode = displayMode;
    this.colorBy = colorBy;
    
    // Apply filters in data manager
    dataManager.applyFilters(filterCategory);
    
    this.render();
  }
  
  // Reset the view (zoom and position)
  resetView() {
    this.zoomLevel = 1.0;
    this.viewX = 0;
    this.viewY = 0;
    this.render();
  }
  
  // Zoom in
  zoomIn() {
    const newZoom = Math.min(this.zoomLevel * 1.2, this.maxZoom);
    
    // Keep center point fixed
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // Calculate world point at center
    const worldX = (centerX / this.zoomLevel) - this.viewX;
    const worldY = (centerY / this.zoomLevel) - this.viewY;
    
    // Apply zoom
    this.zoomLevel = newZoom;
    
    // Adjust view to keep center fixed
    this.viewX = -(worldX * this.zoomLevel - centerX);
    this.viewY = -(worldY * this.zoomLevel - centerY);
    
    this.render();
  }
  
  // Zoom out
  zoomOut() {
    const newZoom = Math.max(this.zoomLevel / 1.2, this.minZoom);
    
    // Keep center point fixed
    const centerX = this.width / 2;
    const centerY = this.height / 2;
    
    // Calculate world point at center
    const worldX = (centerX / this.zoomLevel) - this.viewX;
    const worldY = (centerY / this.zoomLevel) - this.viewY;
    
    // Apply zoom
    this.zoomLevel = newZoom;
    
    // Adjust view to keep center fixed
    this.viewX = -(worldX * this.zoomLevel - centerX);
    this.viewY = -(worldY * this.zoomLevel - centerY);
    
    this.render();
  }
  
  // Start animation loop
  startAnimation() {
    this.animationRunning = true;
    this.animate();
  }
  
  // Animation loop
  animate() {
    if (!this.animationRunning) return;
    
    this.animationFrame += this.animationSpeed;
    this.render();
    
    requestAnimationFrame(this.animate.bind(this));
  }
  
  // Stop animation
  stopAnimation() {
    this.animationRunning = false;
  }
  
  // Main render function
  render() {
    if (!this.ctx) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Apply view transformation
    this.ctx.save();
    this.ctx.translate(this.viewX * this.zoomLevel, this.viewY * this.zoomLevel);
    this.ctx.scale(this.zoomLevel, this.zoomLevel);
    
    // Choose render method based on display mode
    switch (this.displayMode) {
      case 'network':
        this.renderNetworkView();
        break;
      case 'evolution':
        this.renderEvolutionView();
        break;
      case 'mosaic':
      default:
        this.renderMosaicView();
        break;
    }
    
    this.ctx.restore();
  }
  
  // Render the mosaic view
  renderMosaicView() {
    // First pass: Draw connections between related students if they're not too far
    if (this.zoomLevel < 2.0) {
      this.renderNetworkConnections(0.15); // Faint connections
    }
    
    // Draw all student tiles
    // First draw non-pattern tiles
    for (const student of dataManager.filteredStudents) {
      const pos = dataManager.getStudentPosition(student.id);
      if (!pos.fixed) {
        this.drawStudentTile(student);
      }
    }
    
    // Then draw pattern tiles on top to make them more visible
    for (const student of dataManager.filteredStudents) {
      const pos = dataManager.getStudentPosition(student.id);
      if (pos.fixed) {
        this.drawStudentTile(student);
      }
    }
  }
  
  // Render the network view
  renderNetworkView() {
    // Ensure connections are generated
    if (!dataManager.students[0].connections || dataManager.students[0].connections.length === 0) {
      dataManager.generateConnections();
    }
    
    // Draw all connections
    this.renderNetworkConnections(0.8); // Strong connections
    
    // Draw all student tiles
    for (const student of dataManager.filteredStudents) {
      this.drawStudentTile(student);
    }
  }
  
  // Render the evolution view (animations over time)
  renderEvolutionView() {
    // Determine current time frame (0-8 months)
    const timeScale = (Math.sin(this.animationFrame) + 1) / 2; // 0 to 1 oscillation
    const currentMonth = Math.floor(timeScale * 8) + 1; // Months 1-8
    
    // Draw all student tiles, scaled by events up to current month
    for (const student of dataManager.filteredStudents) {
      // Count events up to current month
      const eventsUpToNow = student.events.filter(e => e.month <= currentMonth);
      const monthlyActivityScale = eventsUpToNow.length / Math.max(1, student.events.length);
      
      // Draw with dynamic scaling
      this.drawStudentTile(student, monthlyActivityScale);
    }
    
    // Draw month indicator
    this.drawMonthIndicator(currentMonth);
  }
  
  // Draw connections between related students
  renderNetworkConnections(opacity) {
    const drawnConnections = new Set(); // Track connections already drawn
    
    for (const student of dataManager.filteredStudents) {
      if (!student.connections) continue;
      
      const pos1 = dataManager.getStudentPosition(student.id);
      const x1 = pos1.x * this.width;
      const y1 = pos1.y * this.height;
      
      for (const connection of student.connections) {
        // Check if connection is to a filtered student
        const otherStudent = dataManager.getStudentById(connection.studentId);
        if (!otherStudent || !dataManager.filteredStudents.includes(otherStudent)) continue;
        
        // Create a unique key for this connection pair to avoid duplicates
        const connKey = [student.id, connection.studentId].sort().join('-');
        if (drawnConnections.has(connKey)) continue;
        drawnConnections.add(connKey);
        
        const pos2 = dataManager.getStudentPosition(connection.studentId);
        const x2 = pos2.x * this.width;
        const y2 = pos2.y * this.height;
        
        // Set style based on connection type or strength
        let strokeColor;
        let currentOpacity = opacity;
        
        // Highlight connections for selected student
        let lineWidth = 0.5;
        if (this.selectedStudentId && 
            (student.id === this.selectedStudentId || connection.studentId === this.selectedStudentId)) {
          lineWidth = 2;
          currentOpacity = 1.0;
        }
        
        if (connection.eventKey.includes('academic')) {
          strokeColor = `rgba(53, 76, 161, ${currentOpacity})`;
        } else if (connection.eventKey.includes('social')) {
          strokeColor = `rgba(249, 200, 14, ${currentOpacity})`;
        } else if (connection.eventKey.includes('professional')) {
          strokeColor = `rgba(89, 195, 195, ${currentOpacity})`;
        } else if (connection.eventKey.includes('cultural')) {
          strokeColor = `rgba(180, 100, 180, ${currentOpacity})`;
        } else if (connection.eventKey.includes('athletic')) {
          strokeColor = `rgba(204, 0, 53, ${currentOpacity})`;
        } else {
          strokeColor = `rgba(100, 100, 100, ${currentOpacity})`;
        }
        
        // Draw the connection
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = strokeColor;
        this.ctx.lineWidth = lineWidth;
        this.ctx.stroke();
      }
    }
  }
  
  // Draw a student tile
  drawStudentTile(student, scaleModifier = 1.0) {
    // Get student position
    const pos = dataManager.getStudentPosition(student.id);
    const x = pos.x * this.width;
    const y = pos.y * this.height;
    
    // Calculate size
    const baseSize = this.getTileSize(student) * scaleModifier;
    
    // Get color based on current visualization settings
    let logoKey;
    
    // Special handling for pattern students vs non-pattern students
    const isPatternStudent = pos.fixed;
    
    switch (this.colorBy) {
      case 'category':
        // Color based on primary category
        switch (student.primaryCategory) {
          case 'academic':
            logoKey = 'mustang_blue'; // SMU blue
            break;
          case 'social':
            logoKey = 'mustang_yellow'; // SMU yellow
            break;
          case 'professional':
            logoKey = 'mustang_teal'; // SMU teal
            break;
          case 'cultural':
            logoKey = 'mustang_gray'; // Gray
            break;
          case 'athletic':
            logoKey = 'mustang_red'; // SMU red
            break;
          default:
            logoKey = 'mustang_blue'; // Default
        }
        break;
        
      case 'style':
        // Color by engagement style
        switch (student.style) {
          case 'sampler':
            logoKey = 'mustang_blue'; // SMU blue
            break;
          case 'specialist':
            logoKey = 'mustang_red';  // SMU red
            break;
          case 'super-connector':
            logoKey = 'mustang_teal'; // SMU teal
            break;
          case 'selective':
            logoKey = 'mustang_yellow'; // SMU yellow
            break;
          default:
            logoKey = 'mustang_blue';
        }
        break;
        
      case 'intensity':
        // Color by engagement intensity (number of events)
        const intensity = Math.min(1, student.events.length / 10); // Cap at 10 events
        
        // Assign color based on intensity
        if (intensity < 0.33) {
            logoKey = 'mustang_blue';
        } else if (intensity < 0.66) {
            logoKey = 'mustang_teal';
        } else {
            logoKey = 'mustang_red';
        }
        break;
        
      default:
        logoKey = 'mustang_blue';
    }
    
    // Get the logo image
    const logoImage = this.logoImages[logoKey];
    
    // Highlight selected student
    let strokeColor = 'transparent';
    let strokeWidth = 0;
    
    if (student.id === this.selectedStudentId) {
      strokeColor = 'white';
      strokeWidth = 2;
    } else if (student.id === this.hoveredStudentId) {
      strokeColor = 'rgba(255, 255, 255, 0.5)';
      strokeWidth = 1;
    }
    
    // Apply animation effects in evolution view
    let rotation = 0;
    if (this.displayMode === 'evolution') {
      rotation = this.animationFrame * 0.1;
    }
    
    // Draw the student as a logo
    this.ctx.save();
    this.ctx.translate(x, y);
    
    if (rotation !== 0) {
      this.ctx.rotate(rotation);
    }
    
    // Draw the logo if loaded
    if (logoImage && logoImage.complete) {
      // Set opacity based on pattern/non-pattern
      this.ctx.globalAlpha = isPatternStudent ? 1.0 : 0.7;
      
      // Calculate logo size to fit within baseSize
      const logoSize = baseSize * 1.5; // Make logo slightly larger than the standard tile
      const logoX = -logoSize / 2;
      const logoY = -logoSize / 2;
      
      // Draw the logo
      this.ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
    } else {
      // Fallback to basic shape if logo not loaded
      this.drawFallbackTile(baseSize, student, isPatternStudent);
    }
    
    // Add stroke if selected or hovered
    if (strokeWidth > 0) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.strokeRect(-baseSize / 2, -baseSize / 2, baseSize, baseSize);
    }
    
    // Display student ID on hover when zoomed in
    if ((student.id === this.hoveredStudentId || student.id === this.selectedStudentId) 
        && this.zoomLevel > 2.0) {
      this.ctx.fillStyle = 'white';
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 0.5;
      this.ctx.font = '10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.strokeText(student.id, 0, baseSize/2 + 5);
      this.ctx.fillText(student.id, 0, baseSize/2 + 5);
    }
    
    this.ctx.restore();
  }
  
  // Fallback tile drawing if logo images are not loaded
  drawFallbackTile(size, student, isPatternStudent) {
    let fillColor;
    const alpha = isPatternStudent ? 1.0 : 0.7;
    
    // Determine fill color based on the student's properties and visualization settings
    switch (this.colorBy) {
      case 'category': {
        // Use category colors from CATEGORY_COLORS in data.js
        const categoryColors = CATEGORY_COLORS[student.primaryCategory] || [100, 100, 100];
        fillColor = `rgba(${categoryColors[0]}, ${categoryColors[1]}, ${categoryColors[2]}, ${alpha})`;
        break;
      }
        
      case 'style': {
        // Color by engagement style
        let r, g, b;
        switch (student.style) {
          case 'sampler':
            r = 53; g = 76; b = 161; // SMU blue
            break;
          case 'specialist':
            r = 204; g = 0; b = 53;  // SMU red
            break;
          case 'super-connector':
            r = 89; g = 195; b = 195; // SMU teal
            break;
          case 'selective':
            r = 249; g = 200; b = 14; // SMU yellow
            break;
          default:
            r = 100; g = 100; b = 100;
        }
        fillColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        break;
      }
        
      case 'intensity': {
        // Color by engagement intensity (number of events)
        const intensity = Math.min(1, student.events.length / 10); // Cap at 10 events
        const r = Math.round(53 + 151 * intensity);
        const g = Math.round(76 + 120 * intensity);
        const b = Math.round(161 * (1 - intensity) + 53 * intensity);
        fillColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        break;
      }
        
      default:
        fillColor = isPatternStudent ? 'rgba(100, 100, 100, 1.0)' : 'rgba(180, 180, 180, 0.7)';
    }
    
    // Draw a rectangle as fallback
    this.ctx.fillStyle = fillColor;
    this.ctx.fillRect(-size/2, -size/2, size, size);
  }
  
  // Load the logo images
  loadLogoImages() {
    // Define the logo color variants needed
    const logoVariants = [
      { key: 'mustang_red', file: 'mustang_red.png' },
      { key: 'mustang_blue', file: 'mustang_blue.png' },
      { key: 'mustang_teal', file: 'mustang_teal.png' },
      { key: 'mustang_yellow', file: 'mustang_yellow.png' },
      { key: 'mustang_gray', file: 'mustang_gray.png' }
    ];
    
    // Initialize each logo variant
    logoVariants.forEach(variant => {
      const img = new Image();
      
      img.onload = () => {
        console.log(`${variant.key} logo loaded successfully`);
        this.render(); // Re-render when image loads
      };
      
      img.onerror = (err) => {
        console.error(`Failed to load ${variant.key} logo:`, err);
        // Continue with fallback shapes
      };
      
      // Set the source
      img.src = variant.file;
      
      // Store the image in the logoImages object
      this.logoImages[variant.key] = img;
    });
    
    console.log("Started loading mustang logo variants");
  }
  
  // Draw month indicator for evolution view
  drawMonthIndicator(month) {
    const monthNames = [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August'
    ];
    
    // Draw text in screen coordinates, not world coordinates
    this.ctx.save();
    this.ctx.resetTransform();
    
    this.ctx.font = '16px Arial';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'bottom';
    this.ctx.fillText(`Month: ${monthNames[month-1]}`, this.width - 20, this.height - 20);
    
    this.ctx.restore();
  }
  
  // Load the SVG image for reference
  loadSVGImage() {
    const img = new Image();
    img.onload = () => {
      console.log("SVG image loaded successfully");
      this.svgImage = img;
      this.render();
    };
    img.onerror = (err) => {
      console.error("Failed to load SVG image:", err);
    };
    img.src = 'mustang.svg';
  }
}