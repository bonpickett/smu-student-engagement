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
    this.zoomLevel = 1.0;
    this.viewX = 0;
    this.viewY = 0;
    this.minZoom = 0.2;
    this.maxZoom = 5.0;
    this.tileSize = 20; // Base size of student tiles
    
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
    
    // Draw SMU pattern outline at very zoomed-out level
    if (this.zoomLevel < 0.5) {
      this.drawSMUPattern();
    }
    
    // Draw all student tiles
    for (const student of dataManager.filteredStudents) {
      this.drawStudentTile(student);
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
        if (connection.eventKey.includes('academic')) {
          strokeColor = `rgba(53, 76, 161, ${opacity})`;
        } else if (connection.eventKey.includes('social')) {
          strokeColor = `rgba(249, 200, 14, ${opacity})`;
        } else if (connection.eventKey.includes('professional')) {
          strokeColor = `rgba(89, 195, 195, ${opacity})`;
        } else if (connection.eventKey.includes('cultural')) {
          strokeColor = `rgba(180, 100, 180, ${opacity})`;
        } else if (connection.eventKey.includes('athletic')) {
          strokeColor = `rgba(204, 0, 53, ${opacity})`;
        } else {
          strokeColor = `rgba(100, 100, 100, ${opacity})`;
        }
        
        // Highlight connections for selected student
        let lineWidth = 0.5;
        if (this.selectedStudentId && 
            (student.id === this.selectedStudentId || connection.studentId === this.selectedStudentId)) {
          lineWidth = 2;
          opacity = 1.0;
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
    let fillColor;
    
    switch (this.colorBy) {
      case 'category':
        // Color by primary category
        const categoryColors = CATEGORY_COLORS[student.primaryCategory] || [100, 100, 100];
        fillColor = `rgb(${categoryColors[0]}, ${categoryColors[1]}, ${categoryColors[2]})`;
        break;
        
      case 'style':
        // Color by engagement style
        switch (student.style) {
          case 'sampler':
            fillColor = 'rgb(53, 76, 161)'; // SMU blue
            break;
          case 'specialist':
            fillColor = 'rgb(204, 0, 53)';  // SMU red
            break;
          case 'super-connector':
            fillColor = 'rgb(89, 195, 195)'; // SMU teal
            break;
          case 'selective':
            fillColor = 'rgb(249, 200, 14)'; // SMU yellow
            break;
          default:
            fillColor = 'rgb(100, 100, 100)';
        }
        break;
        
      case 'intensity':
        // Color by engagement intensity (number of events)
        const intensity = Math.min(1, student.events.length / 10); // Cap at 10 events
        fillColor = `rgb(${Math.round(53 + 151 * intensity)}, ${Math.round(76 + 120 * intensity)}, ${Math.round(161 * (1 - intensity) + 53 * intensity)})`;
        break;
        
      default:
        fillColor = 'rgb(100, 100, 100)';
    }
    
    // Apply pattern based on engagement style
    const style = STYLE_PATTERNS[student.style] || { pattern: 'solid', textureScale: 0.3 };
    
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
    
    // Draw the student tile with appropriate pattern
    this.ctx.save();
    this.ctx.translate(x, y);
    
    if (rotation !== 0) {
      this.ctx.rotate(rotation);
    }
    
    // Draw tile shape based on pattern
    switch (style.pattern) {
      case 'dotted':
        this.drawDottedTile(baseSize, fillColor, strokeColor, strokeWidth);
        break;
      case 'dashed':
        this.drawDashedTile(baseSize, fillColor, strokeColor, strokeWidth);
        break;
      case 'cross':
        this.drawCrossTile(baseSize, fillColor, strokeColor, strokeWidth);
        break;
      case 'solid':
      default:
        this.drawSolidTile(baseSize, fillColor, strokeColor, strokeWidth);
        break;
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
  
  // Draw a solid tile
  drawSolidTile(size, fillColor, strokeColor, strokeWidth) {
    this.ctx.beginPath();
    this.ctx.rect(-size/2, -size/2, size, size);
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    
    if (strokeWidth > 0) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.stroke();
    }
  }
  
  // Draw a dotted pattern tile
  drawDottedTile(size, fillColor, strokeColor, strokeWidth) {
    // Draw base shape
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size/2, 0, Math.PI * 2);
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    
    if (strokeWidth > 0) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.stroke();
    }
  }
  
  // Draw a dashed pattern tile
  drawDashedTile(size, fillColor, strokeColor, strokeWidth) {
    // Draw base with dashed pattern
    this.ctx.beginPath();
    
    // Draw a diamond shape
    this.ctx.moveTo(0, -size/2);
    this.ctx.lineTo(size/2, 0);
    this.ctx.lineTo(0, size/2);
    this.ctx.lineTo(-size/2, 0);
    this.ctx.closePath();
    
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    
    if (strokeWidth > 0) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.stroke();
    }
  }
  
  // Draw a cross pattern tile
  drawCrossTile(size, fillColor, strokeColor, strokeWidth) {
    // Draw plus sign shape
    const armWidth = size / 3;
    
    this.ctx.beginPath();
    
    // Horizontal arm
    this.ctx.rect(-size/2, -armWidth/2, size, armWidth);
    
    // Vertical arm
    this.ctx.rect(-armWidth/2, -size/2, armWidth, size);
    
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    
    if (strokeWidth > 0) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = strokeWidth;
      this.ctx.stroke();
    }
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
  
  // Draw the SMU pattern outline for zoomed-out view
  drawSMUPattern() {
    this.ctx.beginPath();
    
    // Draw a path through the pattern points
    let firstPoint = true;
    for (const pos of SMU_PATTERN) {
      const x = pos[0] * this.width;
      const y = pos[1] * this.height;
      
      if (firstPoint) {
        this.ctx.moveTo(x, y);
        firstPoint = false;
      } else {
        this.ctx.lineTo(x, y);
      }
    }
    
    this.ctx.strokeStyle = 'rgba(204, 0, 53, 0.3)'; // Faint SMU red
    this.ctx.lineWidth = 5;
    this.ctx.stroke();
  }
}