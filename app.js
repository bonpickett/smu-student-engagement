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
  
  // Import Papa Parse for CSV handling
  importPapaParseLibrary()
    .then(() => {
      // Process the data from CSV file
      dataManager.processCSVData(() => {
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
      });
    })
    .catch(error => {
      console.error("Failed to load Papa Parse:", error);
      loadingMessage.textContent = 'Error loading data parser. Please refresh.';
    });
});

// Import Papa Parse library for CSV parsing
function importPapaParseLibrary() {
  return new Promise((resolve, reject) => {
    if (window.Papa) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Set up month slider controls
function setupMonthSlider(mosaic) {
  const slider = document.getElementById('month-slider');
  const monthValue = document.getElementById('month-value');
  
  // Add month markers if they don't exist
  const monthMarkers = document.querySelector('.month-markers');
  if (monthMarkers.children.length === 0) {
    const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthAbbr.forEach(month => {
      const marker = document.createElement('span');
      marker.textContent = month;
      monthMarkers.appendChild(marker);
    });
  }
  
  // Set up event listeners
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

// Update the statistics panel with current data
function updateStatsPanel(stats) {
  const statsContent = document.querySelector('.stats-content');
  
  // Generate HTML for stats panel
  let html = `
    <div class="stats-section">
      <h4>Event Categories</h4>
  `;
  
  // Add category bars
  for (const [category, count] of Object.entries(stats.categoryCount)) {
    if (stats.totalEvents === 0) continue;
    
    const percent = Math.round((count / stats.totalEvents) * 100);
    html += `
      <div class="stats-bar">
        <div class="stats-bar-label">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
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
    html += `
        <div>Top Category: <span class="stats-value ${stats.topCategory}">${stats.topCategory.charAt(0).toUpperCase() + stats.topCategory.slice(1)}</span></div>
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
  colorBySelect.addEventListener('change', function() {
    mosaic.setColorBy(this.value);
    mosaic.render();
  });
  
  // Category filter
  const filterCategorySelect = document.getElementById('filter-category');
  filterCategorySelect.addEventListener('change', function() {
    // Apply filters in data manager
    dataManager.applyFilters(this.value);
    
    // Update the visualization
    mosaic.render();
    
    // Update stats panel with new data
    updateStatsPanel(mosaic.getCurrentStats());
  });
  
  // Student search
  const searchInput = document.getElementById('student-search');
  const searchBtn = document.getElementById('search-btn');
  
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
  
  // Zoom controls
  const zoomInBtn = document.getElementById('zoom-in');
  zoomInBtn.addEventListener('click', function() {
    mosaic.zoomIn();
  });
  
  const zoomOutBtn = document.getElementById('zoom-out');
  zoomOutBtn.addEventListener('click', function() {
    mosaic.zoomOut();
  });
  
  const resetViewBtn = document.getElementById('reset-view');
  resetViewBtn.addEventListener('click', function() {
    mosaic.resetView();
  });
}

// Set up the student details panel
function setupStudentDetailsPanel() {
  const detailsPanel = document.getElementById('student-details');
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
      <div class="interest-bar">
        <div class="bar-label">Academic</div>
        <div class="bar-container">
          <div class="bar-fill academic" style="width: ${percentages.academic || 0}%"></div>
        </div>
        <div class="bar-value">${percentages.academic || 0}%</div>
      </div>
      <div class="interest-bar">
        <div class="bar-label">Social</div>
        <div class="bar-container">
          <div class="bar-fill social" style="width: ${percentages.social || 0}%"></div>
        </div>
        <div class="bar-value">${percentages.social || 0}%</div>
      </div>
      <div class="interest-bar">
        <div class="bar-label">Professional</div>
        <div class="bar-container">
          <div class="bar-fill professional" style="width: ${percentages.professional || 0}%"></div>
        </div>
        <div class="bar-value">${percentages.professional || 0}%</div>
      </div>
      <div class="interest-bar">
        <div class="bar-label">Cultural</div>
        <div class="bar-container">
          <div class="bar-fill cultural" style="width: ${percentages.cultural || 0}%"></div>
        </div>
        <div class="bar-value">${percentages.cultural || 0}%</div>
      </div>
      <div class="interest-bar">
        <div class="bar-label">Athletic</div>
        <div class="bar-container">
          <div class="bar-fill athletic" style="width: ${percentages.athletic || 0}%"></div>
        </div>
        <div class="bar-value">${percentages.athletic || 0}%</div>
      </div>
    </div>
    
    <h4>Events Timeline</h4>
    <ul class="events-list">`;
  
  // Sort events by month
  const sortedEvents = [...student.events].sort((a, b) => a.month - b.month);
  
  // Add each event to the list
  for (const event of sortedEvents) {
    html += `
      <li class="event-item">
        <span>${event.name}</span>
        <span class="event-category ${event.category}">${event.category.charAt(0).toUpperCase() + event.category.slice(1)}</span>
      </li>`;
  }
  
  html += `
    </ul>
  `;
  
  detailsContent.innerHTML = html;
}