/**
 * app.js - Updated for Evolution View with Side Panels
 * Initializes application and UI controls for SMU Spirit Mosaic
 */

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing SMU Spirit Evolution View...');
  
  // Show loading message
  const loadingMessage = document.createElement('div');
  loadingMessage.id = 'loading-message';
  loadingMessage.style.position = 'absolute';
  loadingMessage.style.top = '50%';
  loadingMessage.style.left = '50%';
  loadingMessage.style.transform = 'translate(-50%, -50%)';
  loadingMessage.style.fontSize = '20px';
  loadingMessage.style.fontWeight = 'bold';
  loadingMessage.style.color = 'rgba(53, 76, 161, 0.8)';
  loadingMessage.textContent = 'Loading SMU Spirit Evolution Data...';
  document.getElementById('mosaic-container').appendChild(loadingMessage);
  
  // Process the data from CSV file
  // First ensure Papa Parse is loaded
  if (typeof Papa === 'undefined') {
    // Load Papa Parse dynamically if not already loaded
    loadPapaParseLibrary()
      .then(() => processData(loadingMessage))
      .catch(error => {
        console.error("Failed to load Papa Parse:", error);
        loadingMessage.textContent = 'Error loading data parser. Using fallback data.';
        dataManager.generateData(() => {
          initializeVisualization(loadingMessage);
        });
      });
  } else {
    // Papa Parse already loaded, proceed with data processing
    processData(loadingMessage);
  }
});

// Load Papa Parse library
function loadPapaParseLibrary() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Process the data and initialize visualization
function processData(loadingMessage) {
  dataManager.processCSVData(() => {
    initializeVisualization(loadingMessage);
  });
}

// Initialize the visualization
function initializeVisualization(loadingMessage) {
  // Create the mosaic visualization
  const mosaic = new SpiritMosaic('mosaic-container');
  
  // Render initial view
  mosaic.render();
  
  // Set up UI controls
  setupUIControls(mosaic);
  
  // Set up student details panel
  setupStudentDetailsPanel();
  
  // Set up month slider
  setupMonthSlider(mosaic);
  
  // Initialize stats panel
  updateStatsPanel(mosaic.getCurrentStats());
  
  // Remove loading message
  if (loadingMessage.parentNode) {
    loadingMessage.parentNode.removeChild(loadingMessage);
  }
  
  console.log('Evolution View initialized successfully');
}

// Set up month slider controls
function setupMonthSlider(mosaic) {
  const slider = document.getElementById('month-slider');
  const monthValue = document.getElementById('month-value');
  
  // Add month markers if they don't exist
  const monthMarkers = document.querySelector('.month-markers');
  if (monthMarkers && monthMarkers.children.length === 0) {
    const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthAbbr.forEach(month => {
      const marker = document.createElement('span');
      marker.textContent = month;
      monthMarkers.appendChild(marker);
    });
  }
  
  // Set up event listeners
  if (slider) {
    slider.addEventListener('input', function() {
      const month = parseInt(this.value, 10);
      const monthNames = [
        'January', 'February', 'March', 'April', 
        'May', 'June', 'July', 'August',
        'September', 'October', 'November', 'December'
      ];
      
      monthValue.textContent = monthNames[month - 1];
      
      // Update the visualization
      mosaic.setCurrentMonth(month);
      mosaic.render();
      
      // Update stats panel
      updateStatsPanel(mosaic.getCurrentStats());
    });
  }
}

// Update the statistics panel with current data - FIXED TO ALWAYS SHOW ALL CATEGORIES
function updateStatsPanel(stats) {
  const statsContent = document.querySelector('.stats-content');
  if (!statsContent) return;
  
  // Define all categories that should always be displayed
  const allCategories = [
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
  
  // Generate HTML for stats panel
  let html = `
    <div class="stats-section">
      <h4>Event Categories</h4>
  `;
  
  // Always display ALL categories defined in the list above, regardless of current month data
  for (const category of allCategories) {
    // Get count from stats data, default to 0 if not present
    const count = stats.categoryCount && stats.categoryCount[category] ? stats.categoryCount[category] : 0;
    
    // Format category name for display
    let displayCategory = category;
    if (category.includes('/')) {
      // Simplify category names with slashes
      displayCategory = category.split('/')[0];
    }
    
    // Calculate percentage (avoid division by zero)
    const percent = stats.totalEvents === 0 ? 0 : Math.round((count / stats.totalEvents) * 100);
    
    html += `
      <div class="stats-bar">
        <div class="stats-bar-label">${displayCategory}</div>
        <div class="stats-bar-container">
          <div class="stats-bar-fill ${category}" style="width: ${percent}%"></div>
        </div>
        <div class="stats-bar-value">${percent}% (${count})</div>
      </div>
    `;
  }
  
  // Add participation stats
  const participationPercent = dataManager.filteredStudents.length > 0 
    ? Math.round((stats.activeStudents / dataManager.filteredStudents.length) * 100)
    : 0;
  
  html += `
    </div>
    <div class="stats-section">
      <h4>Participation</h4>
      <div class="stats-info">
        <div>Active Students: <span class="stats-value">${stats.activeStudents} of ${dataManager.filteredStudents.length} (${participationPercent}%)</span></div>
        <div>Avg Events per Student: <span class="stats-value">${stats.avgEventsPerActive.toFixed(1)}</span></div>
  `;
  
  // Add growth rate if available
  if (stats.monthlyGrowth !== undefined) {
    const growthClass = stats.monthlyGrowth >= 0 ? 'positive' : 'negative';
    const growthPrefix = stats.monthlyGrowth >= 0 ? '+' : '';
    
    html += `
        <div>Monthly Growth: <span class="stats-value ${growthClass}">${growthPrefix}${stats.monthlyGrowth.toFixed(1)}%</span></div>
    `;
  }
  
  // Add top category if available
  if (stats.topCategory) {
    // Format category name for display
    let displayTopCategory = stats.topCategory;
    if (displayTopCategory.includes('/')) {
      // Simplify category names with slashes for display
      displayTopCategory = displayTopCategory.split('/')[0];
    }
    
    html += `
        <div>Top Category: <span class="stats-value ${stats.topCategory}">${displayTopCategory}</span></div>
    `;
  }
  
  html += `
      </div>
    </div>
  `;
  
  // Update the panel content
  statsContent.innerHTML = html;
}

// Set up UI control handlers
function setupUIControls(mosaic) {
  // Color by selector
  const colorBySelect = document.getElementById('color-by');
  if (colorBySelect) {
    colorBySelect.addEventListener('change', function() {
      mosaic.setColorBy(this.value);
      mosaic.render();
    });
  }
  
  // Category filter
  const filterCategorySelect = document.getElementById('filter-category');
  if (filterCategorySelect) {
    filterCategorySelect.addEventListener('change', function() {
      // Apply filters in data manager
      dataManager.applyFilters(this.value);
      
      // Update the visualization
      mosaic.render();
      
      // Update stats panel with new data
      updateStatsPanel(mosaic.getCurrentStats());
    });
  }
  
  // Student search
  const searchInput = document.getElementById('student-search');
  const searchBtn = document.getElementById('search-btn');
  
  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', function() {
      const searchTerm = searchInput.value.trim();
      if (searchTerm) {
        const students = dataManager.applyFilters(
          document.getElementById('filter-category').value,
          'all',
          searchTerm
        );
        
        if (students.length > 0) {
          mosaic.selectStudent(students[0].id);
          mosaic.render();
          updateStatsPanel(mosaic.getCurrentStats());
        } else {
          alert('No students found matching: ' + searchTerm);
        }
      }
    });
    
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchBtn.click();
      }
    });
  }
  
  // Zoom controls
  const zoomInBtn = document.getElementById('zoom-in');
  const zoomOutBtn = document.getElementById('zoom-out');
  const resetViewBtn = document.getElementById('reset-view');
  
  if (zoomInBtn) {
    zoomInBtn.addEventListener('click', function() {
      mosaic.zoomIn();
    });
  }
  
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener('click', function() {
      mosaic.zoomOut();
    });
  }
  
  if (resetViewBtn) {
    resetViewBtn.addEventListener('click', function() {
      mosaic.resetView();
    });
  }
}

// Set up the student details panel
function setupStudentDetailsPanel() {
  const detailsPanel = document.getElementById('student-details');
  if (!detailsPanel) return;
  
  const closeBtn = detailsPanel.querySelector('.close-btn');
  
  // Close button handler - dispatch event when panel is closed
  closeBtn.addEventListener('click', function() {
    detailsPanel.classList.add('hidden');
    
    // Create and dispatch a custom event when details panel is closed
    const event = new CustomEvent('studentDetailsClose');
    document.dispatchEvent(event);
  });
  
  // Listen for student selection events
  document.addEventListener('studentSelected', function(e) {
    const studentId = e.detail.studentId;
    
    if (studentId) {
      const student = dataManager.getStudentById(studentId);
      if (student) {
        renderStudentDetails(student);
        detailsPanel.classList.remove('hidden');
      }
    } else {
      detailsPanel.classList.add('hidden');
      
      // Dispatch close event when no student is selected
      const event = new CustomEvent('studentDetailsClose');
      document.dispatchEvent(event);
    }
  });
}

// Render student details in the panel
function renderStudentDetails(student) {
  const detailsContent = document.querySelector('.details-content');
  if (!detailsContent) return;
  
  // Calculate percentages for interest bars
  const totalEvents = student.events.length;
  const percentages = {};
  
  for (const category in student.categoryDistribution) {
    percentages[category] = Math.round((student.categoryDistribution[category] / totalEvents) * 100);
  }
  
  // Style name formatting
  let styleName = student.style;
  if (styleName === 'super-connector') {
    styleName = 'Super Connector';
  } else {
    styleName = styleName.charAt(0).toUpperCase() + styleName.slice(1);
  }
  
  // Generate HTML
  let html = `
    <div class="student-id">${student.id}</div>
    <div class="engagement-style ${student.style}">${styleName}</div>
    
    <div class="metrics">
      <div class="metric">
        <div class="metric-value">${totalEvents}</div>
        <div class="metric-label">Events</div>
      </div>
      <div class="metric">
        <div class="metric-value">${Object.values(student.categoryDistribution).filter(v => v > 0).length}</div>
        <div class="metric-label">Categories</div>
      </div>
    </div>
    
    <h4>Interest Breakdown</h4>
    <div class="interest-bars">
  `;
  
  // Only include categories with events
  for (const [category, count] of Object.entries(student.categoryDistribution)) {
    if (count === 0) continue;
    
    // Format category name for display
    let displayCategory = category;
    if (category.includes('/')) {
      // Simplify category names with slashes for display
      displayCategory = category.split('/')[0];
    }
    
    html += `
      <div class="interest-bar">
        <div class="bar-label">${displayCategory}</div>
        <div class="bar-container">
          <div class="bar-fill ${category}" style="width: ${percentages[category] || 0}%"></div>
        </div>
        <div class="bar-value">${percentages[category] || 0}%</div>
      </div>
    `;
  }
  
  html += `
    </div>
    
    <h4>Events Timeline</h4>
    <ul class="events-list">`;
  
  // Sort events by month
  const sortedEvents = [...student.events].sort((a, b) => a.month - b.month);
  
  // Add each event to the list
  for (const event of sortedEvents) {
    // Format category name for display in event list
    let displayCategory = event.category;
    if (displayCategory.includes('/')) {
      // Simplify category names with slashes for display
      displayCategory = displayCategory.split('/')[0];
    }
    
    html += `
      <li class="event-item">
        <span>${event.name}</span>
        <span class="event-category ${event.category}">${displayCategory}</span>
      </li>`;
  }
  
  html += `
    </ul>
  `;
  
  detailsContent.innerHTML = html;
}