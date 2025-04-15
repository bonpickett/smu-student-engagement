/**
 * mosaic.js - Evolution View for SMU Spirit Mosaic
 * Focuses solely on the evolution view with manual month control in side panels
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
    this.zoomLevel = 1.0; // Default zoom level
    this.viewX = 0;
    this.viewY = 0;
    this.minZoom = 0.2;
    this.maxZoom = 5.0;
    this.tileSize = 18; // Increased base size for tiles even more
    
    // Display settings
    this.displayMode = 'evolution'; // Only evolution view
    this.colorBy = 'category'; // 'category', 'style', 'intensity'
    this.selectedStudentId = null;
    this.hoveredStudentId = null;
    
    // Month control
    this.currentMonth = 1; // Start at month 1
    
    // Interaction state
    this.isDragging = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    // Initialize logo images object
    this.logoImages = {};
    
    // Load the logo images
    this.loadLogoImages();
    
    // Bind event handlers
    this.bindEvents();
    
    // Add category bands visualization
    this.showCategoryBands = true;
    
    // Listen for student details panel close event
    document.addEventListener('studentDetailsClose', () => {
      this.selectedStudentId = null;
      this.render();
    });
  }
  
  // Set current month
  setCurrentMonth(month) {
    this.currentMonth = month;
  }
  
  // Set color by property
  setColorBy(colorBy) {
    this.colorBy = colorBy;
  }
  
  // Get current statistics for the month
  getCurrentStats() {
    return this.calculateMonthlyStats();
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
    
    // Normal hit testing
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
  
  // Calculate the size of a student tile based on engagement level
  getTileSize(student) {
    // Larger base size 
    const baseSize = this.tileSize * 1.0; // Increased to full size
    
    // More noticeable scaling based on events
    const eventCount = student.events.length;
    let size = baseSize * (0.9 + (eventCount / 100)); // More variation between students
    
    // For selected students, make them larger
    if (student.id === this.selectedStudentId) {
      size *= 1.5; // Make selected students larger
    }
    // For hover effect only - selection is handled differently now
    else if (this.hoveredStudentId === student.id) {
      size *= 1.25; // Enhanced hover effect
    }
    
    return size;
  }
  
  // Select a student for detailed view
  selectStudent(studentId) {
    if (this.selectedStudentId !== studentId) {
      // Store previous selection for animation
      const previousSelectedId = this.selectedStudentId;
      
      // Update selection
      this.selectedStudentId = studentId;
      
      // If we have a selected student, animate it to the center
      if (studentId) {
        // Get position of the newly selected student
        const studentPos = dataManager.getStudentPosition(studentId);
        const startX = studentPos.x * this.width;
        const startY = studentPos.y * this.height;
        
        // Calculate center of the visible area in world coordinates
        const centerX = this.width / 2 / this.zoomLevel - this.viewX;
        const centerY = this.height / 2 / this.zoomLevel - this.viewY;
        
        // Save the original position for reference
        this._selectedStudentOriginalPos = { x: startX, y: startY };
        
        // Don't move the view - instead we'll animate the mustang to the center
        // in the draw function by interpolating its position
        
        // Calculate animation start time
        this._animationStartTime = Date.now();
        this._animationDuration = 500; // 500ms for animation
        
        // Store animation parameters
        this._animation = {
          startX: startX,
          startY: startY,
          endX: centerX,
          endY: centerY,
          startTime: Date.now(),
          duration: 500 // 500ms
        };
        
        // Request animation frame to start animation
        requestAnimationFrame(() => this.animateSelection());
      } else {
        // No student selected, clear animation data
        this._animation = null;
      }
      
      // Trigger event for details panel update
      const event = new CustomEvent('studentSelected', {
        detail: { studentId }
      });
      document.dispatchEvent(event);
      
      this.render();
    }
  }
  
  // Animate the selected student moving to center
  animateSelection() {
    if (!this._animation) return;
    
    const now = Date.now();
    const elapsed = now - this._animation.startTime;
    const progress = Math.min(1, elapsed / this._animation.duration);
    
    // Ease-in-out function for smooth animation
    const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const easedProgress = easeInOut(progress);
    
    // Store current animation position
    this._currentAnimationPosition = {
      x: this._animation.startX + (this._animation.endX - this._animation.startX) * easedProgress,
      y: this._animation.startY + (this._animation.endY - this._animation.startY) * easedProgress
    };
    
    // Render the current frame
    this.render();
    
    // Continue animation if not complete
    if (progress < 1) {
      requestAnimationFrame(() => this.animateSelection());
    }
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
  
  // Main render function
  render() {
    if (!this.ctx) return;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);
    
    // Draw category bands in the background with more prominent distinction
    if (this.showCategoryBands) {
      this.drawCategoryBands();
    }
    
    // Apply view transformation
    this.ctx.save();
    this.ctx.translate(this.viewX * this.zoomLevel, this.viewY * this.zoomLevel);
    this.ctx.scale(this.zoomLevel, this.zoomLevel);
    
    // Render evolution view
    this.renderEvolutionView();
    
    this.ctx.restore();
  }
  
  // Draw background category bands with more prominent distinction
  drawCategoryBands() {
    // Define the categories in the specific order we want them displayed
    const orderedCategories = [
      'Academic/Educational/Learning',
      'Social',
      'Meeting/Group Business',
      'Cultural',
      'Athletic/Sport',
      'Career/Professional',
      'Service/Volunteer',
      'Entertainment',
      'Other'
    ];
    
    // Ensure we have at least these categories even if CATEGORIES is not available
    const categoryBands = {};
    
    // Calculate positions for each category
    const totalCategories = orderedCategories.length;
    const bandHeight = 1.0 / totalCategories;
    
    orderedCategories.forEach((category, index) => {
      // Map categories to standardized display names
      let label;
      if (category === 'Academic/Educational/Learning') {
        label = 'Academic';
      } else if (category === 'Meeting/Group Business') {
        label = 'Meetings';
      } else if (category === 'Athletic/Sport') {
        label = 'Athletic';
      } else if (category === 'Career/Professional') {
        label = 'Professional';
      } else if (category === 'Service/Volunteer') {
        label = 'Service';
      } else {
        label = category;
      }
      
      categoryBands[category] = {
        centerY: (index + 0.5) * bandHeight,
        label: label
      };
    });
    
    // Draw bands as more visible background sections with borders
    for (const [category, band] of Object.entries(categoryBands)) {
      // Get color from CATEGORY_COLORS in data.js or use a default color
      let categoryColor = [128, 128, 128]; // Default gray
      if (CATEGORY_COLORS && CATEGORY_COLORS[category]) {
        categoryColor = CATEGORY_COLORS[category];
      }
      
      const y = band.centerY * this.height;
      const height = bandHeight * this.height;
      
      // Draw band with slightly higher opacity
      this.ctx.fillStyle = `rgba(${categoryColor[0]}, ${categoryColor[1]}, ${categoryColor[2]}, 0.1)`;
      this.ctx.fillRect(0, y - height/2, this.width, height);
      
      // Draw subtle border lines to separate bands
      this.ctx.strokeStyle = `rgba(${categoryColor[0]}, ${categoryColor[1]}, ${categoryColor[2]}, 0.3)`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y - height/2);
      this.ctx.lineTo(this.width, y - height/2);
      this.ctx.stroke();
      
      this.ctx.beginPath();
      this.ctx.moveTo(0, y + height/2);
      this.ctx.lineTo(this.width, y + height/2);
      this.ctx.stroke();
      
      // Draw the category name with larger, more visible text
      this.ctx.fillStyle = `rgba(${categoryColor[0]}, ${categoryColor[1]}, ${categoryColor[2]}, 0.85)`;
      this.ctx.font = 'bold 18px Arial';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(`${band.label}`, 15, y);
    }
  }
  
  // Render the evolution view 
  renderEvolutionView() {
    // Track selected student to draw last (on top)
    let selectedStudent = null;
    let selectedEvents = null;
    
    // Draw all student tiles 
    for (const student of dataManager.filteredStudents) {
      // Count events up to current month
      const eventsUpToNow = student.events.filter(e => e.month <= this.currentMonth);
      
      // Skip students with no events in the current timeframe
      if (eventsUpToNow.length === 0) continue;
      
      // Use a consistent sizing approach
      const baseSize = this.getTileSize(student);
      
      // Draw the student
      this.drawStudentTile(student, baseSize, eventsUpToNow.length, student.id === this.selectedStudentId);
    }
    
    // If a student is selected and we're not animating, add the glow effect
    if (this.selectedStudentId && !this._animation) {
      const selectedStudent = dataManager.getStudentById(this.selectedStudentId);
      if (selectedStudent) {
        // Calculate center of the viewport
        const centerX = this.width / 2 / this.zoomLevel - this.viewX;
        const centerY = this.height / 2 / this.zoomLevel - this.viewY;
        
        // Draw glow effect at the center
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        
        // Add glow effect
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, this.tileSize * 0.8, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fill();
        
        this.ctx.restore();
      }
    }
  }
  
  // Draw a student tile
  drawStudentTile(student, baseSize, eventCount, isSelectedAndCentered = false) {
    let x, y;
    
    // If selected and we're in the middle of animation, use animated position
    if (student.id === this.selectedStudentId && this._currentAnimationPosition) {
      x = this._currentAnimationPosition.x;
      y = this._currentAnimationPosition.y;
    }
    // If centered selected student, position is at origin (already centered by translation)
    else if (isSelectedAndCentered) {
      x = 0;
      y = 0;
    }
    // Otherwise use normal position
    else {
      const pos = dataManager.getStudentPosition(student.id);
      x = pos.x * this.width;
      y = pos.y * this.height;
    }
    
    // Get color based on current visualization settings
    let logoKey;
    
    switch (this.colorBy) {
      case 'category': {
        // Color based on primary category - Map to logo colors
        const category = student.primaryCategory;
        
        // Map category to logo color - using updated file names
        if (category.includes('Academic')) {
          logoKey = 'mustang_blue'; // SMU blue
        } else if (category.includes('Social')) {
          logoKey = 'mustang_yellow'; // SMU yellow
        } else if (category.includes('Meeting') || category.includes('Professional')) {
          logoKey = 'mustang_teal'; // SMU teal
        } else if (category.includes('Cultural')) {
          logoKey = 'mustang_lightblue'; // Formerly purple, now lightblue
        } else if (category.includes('Athletic') || category.includes('Sport')) {
          logoKey = 'mustang_red'; // SMU red  
        } else if (category.includes('Service') || category.includes('Volunteer')) {
          logoKey = 'mustang_lightred'; // Formerly green, now lightred
        } else if (category.includes('Entertainment')) {
          logoKey = 'mustang_lightteal'; // Formerly orange, now lightteal
        } else {
          logoKey = 'mustang_gray'; // Default gray for other/unknown
        }
        break;
      }
        
      case 'style': {
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
      }
        
      case 'intensity': {
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
      }
        
      default:
        logoKey = 'mustang_blue';
    }
    
    // Get the logo image
    const logoImage = this.logoImages[logoKey];
    
    // Draw the student as a logo
    this.ctx.save();
    this.ctx.translate(x, y);
    
    // Draw the logo if loaded and not broken - no shadows
    if (logoImage && logoImage.complete && logoImage.naturalWidth !== 0) {
      try {
        // Calculate logo size to fit within baseSize - larger than before
        const logoSize = baseSize * 1.5; // Increased for more prominent display
        const logoX = -logoSize / 2;
        const logoY = -logoSize / 2;
        
        // Draw the logo (wrapped in try-catch to handle broken images)
        this.ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
        
        // Add event count indicator
        this.drawEventCountIndicator(eventCount, baseSize);
        
        // Draw a small style indicator in the corner
        this.drawStyleIndicator(student.style, baseSize);
      } catch (error) {
        // If drawing fails, use fallback
        console.log(`Falling back to shape for ${logoKey} due to drawing error`);
        this.drawEnhancedFallbackTile(baseSize, student);
      }
    } else {
      // Fallback to enhanced shape if logo not loaded or broken
      this.drawEnhancedFallbackTile(baseSize, student);
    }
    
    // No stroke needed anymore - we'll use centering and scaling instead
    // Just add subtle highlight for hover
    if (student.id === this.hoveredStudentId) {
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      this.ctx.beginPath();
      this.ctx.arc(0, 0, baseSize * 0.8, 0, Math.PI * 2);
      this.ctx.fill();
    }
    
    // Display student information on hover when zoomed in
    if ((student.id === this.hoveredStudentId || isSelectedAndCentered) 
        && this.zoomLevel > 1.5) { // Show info at lower zoom level for better visibility
      // Display student ID
      this.ctx.fillStyle = 'white';
      this.ctx.strokeStyle = 'black';
      this.ctx.lineWidth = 0.5;
      this.ctx.font = 'bold 11px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'top';
      this.ctx.strokeText(student.id, 0, baseSize/2 + 5);
      this.ctx.fillText(student.id, 0, baseSize/2 + 5);
      
      // Display style and primary category
      if (this.zoomLevel > 2.5) {
        const styleName = student.style === 'super-connector' ? 'Super Connector' : 
                         student.style.charAt(0).toUpperCase() + student.style.slice(1);
        
        // Map category to standardized display name
        let categoryName;
        if (student.primaryCategory === 'Academic/Educational/Learning') {
          categoryName = 'Academic';
        } else if (student.primaryCategory === 'Meeting/Group Business') {
          categoryName = 'Meetings';
        } else if (student.primaryCategory === 'Athletic/Sport') {
          categoryName = 'Athletic';
        } else if (student.primaryCategory === 'Career/Professional') {
          categoryName = 'Professional';
        } else if (student.primaryCategory === 'Service/Volunteer') {
          categoryName = 'Service';
        } else {
          categoryName = student.primaryCategory;
        }
        
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.strokeText(`${styleName}`, 0, baseSize/2 + 20);
        this.ctx.fillText(`${styleName}`, 0, baseSize/2 + 20);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.strokeText(`${categoryName}`, 0, baseSize/2 + 32);
        this.ctx.fillText(`${categoryName}`, 0, baseSize/2 + 32);
      }
    }
    
    this.ctx.restore();
  }
  
  // Draw event count indicator
  drawEventCountIndicator(count, size) {
    // Skip if zero events in this month
    if (count === 0) return;
    
    // Position in bottom right corner
    const x = size * 0.4;
    const y = size * 0.4;
    
    // Draw circle background
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 0.15, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(204, 0, 53, 0.85)'; // SMU red
    this.ctx.fill();
    
    // Draw count number
    this.ctx.font = `bold ${size * 0.2}px Arial`;
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(count.toString(), x, y);
  }
  
  // Draw a style indicator
  drawStyleIndicator(style, size) {
    const indicatorSize = size * 0.25;
    const indicatorX = -size * 0.4;
    const indicatorY = -size * 0.4;
    
    switch (style) {
      case 'sampler':
        // Circle indicator
        this.ctx.fillStyle = 'rgba(53, 76, 161, 0.9)';
        this.ctx.beginPath();
        this.ctx.arc(indicatorX, indicatorY, indicatorSize/2, 0, Math.PI * 2);
        this.ctx.fill();
        break;
        
      case 'specialist':
        // Square indicator
        this.ctx.fillStyle = 'rgba(204, 0, 53, 0.9)';
        this.ctx.fillRect(indicatorX - indicatorSize/2, indicatorY - indicatorSize/2, indicatorSize, indicatorSize);
        break;
        
      case 'super-connector':
        // Cross indicator
        this.ctx.fillStyle = 'rgba(89, 195, 195, 0.9)';
        this.ctx.beginPath();
        // Horizontal line
        this.ctx.rect(indicatorX - indicatorSize/2, indicatorY - indicatorSize/6, indicatorSize, indicatorSize/3);
        // Vertical line
        this.ctx.rect(indicatorX - indicatorSize/6, indicatorY - indicatorSize/2, indicatorSize/3, indicatorSize);
        this.ctx.fill();
        break;
        
      case 'selective':
        // Diamond indicator
        this.ctx.fillStyle = 'rgba(249, 200, 14, 0.9)';
        this.ctx.beginPath();
        this.ctx.moveTo(indicatorX, indicatorY - indicatorSize/2);
        this.ctx.lineTo(indicatorX + indicatorSize/2, indicatorY);
        this.ctx.lineTo(indicatorX, indicatorY + indicatorSize/2);
        this.ctx.lineTo(indicatorX - indicatorSize/2, indicatorY);
        this.ctx.closePath();
        this.ctx.fill();
        break;
    }
  }
  
  // Enhanced fallback tile drawing with style-specific shapes
  drawEnhancedFallbackTile(size, student) {
    let fillColor;
    const alpha = 0.9;
    
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
        fillColor = 'rgba(100, 100, 100, 0.9)';
    }
    
    // Draw a more distinguished shape based on the student's style
    switch (student.style) {
      case 'sampler':
        this.drawEnhancedSamplerTile(size, fillColor);
        break;
      case 'specialist':
        this.drawEnhancedSpecialistTile(size, fillColor);
        break;
      case 'super-connector':
        this.drawEnhancedSuperConnectorTile(size, fillColor);
        break;
      case 'selective':
        this.drawEnhancedSelectiveTile(size, fillColor);
        break;
      default:
        this.drawSolidTile(size, fillColor);
    }
  }
  
  // Enhanced shape drawing methods with more distinctive styles
  drawEnhancedSamplerTile(size, fillColor) {
    // Circle with inner pattern
    this.ctx.beginPath();
    this.ctx.arc(0, 0, size/2, 0, Math.PI * 2);
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    
    // Add inner pattern - small dots
    const innerColor = 'rgba(255, 255, 255, 0.5)';
    this.ctx.fillStyle = innerColor;
    
    // Draw multiple small circles inside
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const distance = size * 0.25;
      const dotX = Math.cos(angle) * distance;
      const dotY = Math.sin(angle) * distance;
      
      this.ctx.beginPath();
      this.ctx.arc(dotX, dotY, size * 0.08, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  drawEnhancedSpecialistTile(size, fillColor) {
    // Solid square with inner pattern
    this.ctx.beginPath();
    this.ctx.rect(-size/2, -size/2, size, size);
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    
    // Add inner target pattern
    const innerColor = 'rgba(255, 255, 255, 0.5)';
    this.ctx.strokeStyle = innerColor;
    this.ctx.lineWidth = size * 0.05;
    
    // Draw inner square
    this.ctx.strokeRect(-size/4, -size/4, size/2, size/2);
  }
  
  drawEnhancedSuperConnectorTile(size, fillColor) {
    // Cross shape with connections
    const armWidth = size / 3;
    
    this.ctx.beginPath();
    // Horizontal arm
    this.ctx.rect(-size/2, -armWidth/2, size, armWidth);
    // Vertical arm
    this.ctx.rect(-armWidth/2, -size/2, armWidth, size);
    
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    
    // Add connection nodes at endpoints
    const nodeColor = 'rgba(255, 255, 255, 0.7)';
    this.ctx.fillStyle = nodeColor;
    
    const nodePositions = [
      [-size/2, 0], // Left
      [size/2, 0],  // Right
      [0, -size/2], // Top
      [0, size/2]   // Bottom
    ];
    
    for (const [nx, ny] of nodePositions) {
      this.ctx.beginPath();
      this.ctx.arc(nx, ny, size * 0.12, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
  
  drawEnhancedSelectiveTile(size, fillColor) {
    // Diamond with selected sections
    this.ctx.beginPath();
    this.ctx.moveTo(0, -size/2);
    this.ctx.lineTo(size/2, 0);
    this.ctx.lineTo(0, size/2);
    this.ctx.lineTo(-size/2, 0);
    this.ctx.closePath();
    
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    
    // Add highlight to represent selective focus
    const highlightColor = 'rgba(255, 255, 255, 0.6)';
    this.ctx.fillStyle = highlightColor;
    
    // Highlight one quarter of the diamond
    this.ctx.beginPath();
    this.ctx.moveTo(0, 0);
    this.ctx.lineTo(0, -size/2);
    this.ctx.lineTo(size/2, 0);
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  // Simple shape drawing methods
  drawSolidTile(size, fillColor) {
    this.ctx.beginPath();
    this.ctx.rect(-size/2, -size/2, size, size);
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
  }
  
  // Load the logo images
  loadLogoImages() {
    // Define the logo color variants needed with the updated file names
    const logoVariants = [
      { key: 'mustang_red', file: 'mustang_red.png' },
      { key: 'mustang_blue', file: 'mustang_blue.png' },
      { key: 'mustang_teal', file: 'mustang_teal.png' },
      { key: 'mustang_yellow', file: 'mustang_yellow.png' },
      { key: 'mustang_gray', file: 'mustang_gray.png' },
      { key: 'mustang_lightblue', file: 'mustang_lightblue.png' }, // Previously purple
      { key: 'mustang_lightred', file: 'mustang_lightred.png' },   // Previously green
      { key: 'mustang_lightteal', file: 'mustang_lightteal.png' }  // Previously orange
    ];
    
    // Initialize each logo variant
    logoVariants.forEach(variant => {
      const img = new Image();
      
      img.onload = () => {
        console.log(`${variant.key} logo loaded successfully`);
        this.logoImages[variant.key] = img;
        this.render(); // Re-render when image loads
      };
      
      img.onerror = (err) => {
        console.error(`Failed to load ${variant.key} logo:`, err);
        // Mark as null to ensure fallback is used
        this.logoImages[variant.key] = null;
      };
      
      // Add a timestamp to avoid caching issues
      img.src = variant.file + '?t=' + new Date().getTime();
    });
    
    console.log("Started loading mustang logo variants");
  }
  
  // Calculate monthly statistics
  calculateMonthlyStats() {
    // Create stats object with counters for each category
    const stats = {
      categoryCount: {},
      totalEvents: 0,
      activeStudents: 0,
      avgEventsPerActive: 0,
      // Additional stats
      monthlyGrowth: 0,
      topCategory: ''
    };
    
    // Initialize categoryCount with all categories from CATEGORIES array
    if (CATEGORIES) {
      CATEGORIES.forEach(category => {
        stats.categoryCount[category] = 0;
      });
    }
    
    // Count events by category up to current month
    let lastMonthEvents = 0;
    if (this.currentMonth > 1) {
      // Calculate events from previous month for growth rate
      for (const student of dataManager.filteredStudents) {
        for (const event of student.events) {
          if (event.month === this.currentMonth - 1) {
            lastMonthEvents++;
          }
        }
      }
    }
    
    // Count current month only events (not cumulative)
    let currentMonthEvents = 0;
    
    // Count current month stats
    for (const student of dataManager.filteredStudents) {
      let studentActive = false;
      let studentEventCount = 0;
      
      for (const event of student.events) {
        if (event.month === this.currentMonth) {
          stats.categoryCount[event.category]++;
          currentMonthEvents++;
          studentActive = true;
          studentEventCount++;
        }
      }
      
      if (studentActive) {
        stats.activeStudents++;
        stats.avgEventsPerActive += studentEventCount;
      }
    }
    
    stats.totalEvents = currentMonthEvents;
    
    // Calculate growth rate (month over month)
    if (lastMonthEvents > 0) {
      stats.monthlyGrowth = ((currentMonthEvents - lastMonthEvents) / lastMonthEvents) * 100;
    }
    
    // Determine top category
    let maxCount = 0;
    for (const [category, count] of Object.entries(stats.categoryCount)) {
      if (count > maxCount) {
        maxCount = count;
        stats.topCategory = category;
      }
    }
    
    // Calculate average events per active student
    if (stats.activeStudents > 0) {
      stats.avgEventsPerActive /= stats.activeStudents;
    }
    
    return stats;
  }
}