/**
 * app.js - Application initialization and UI controls for SMU Spirit Mosaic
 */

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing SMU Spirit Mosaic application...');
  
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
  loadingMessage.textContent = 'Loading SMU Spirit Mosaic...';
  document.getElementById('mosaic-container').appendChild(loadingMessage);
  
  // Initialize data
  dataManager.generateData(() => {
    // Create the mosaic visualization
    const mosaic = new SpiritMosaic('mosaic-container');
    
    // Render initial view
    mosaic.render();
    
    // Start animation
    mosaic.startAnimation();
    
    // Set up UI controls
    setupUIControls(mosaic);
    
    // Set up student details panel
    setupStudentDetailsPanel();
    
    // Remove loading message
    if (loadingMessage.parentNode) {
      loadingMessage.parentNode.removeChild(loadingMessage);
    }
    
    console.log('Application initialized successfully');
  });
});

// Set up UI control handlers
function setupUIControls(mosaic) {
  // Display mode selector
  const displayModeSelect = document.getElementById('display-mode');
  displayModeSelect.addEventListener('change', function() {
    mosaic.update(this.value, mosaic.colorBy, document.getElementById('filter-category').value);
  });
  
  // Color by selector
  const colorBySelect = document.getElementById('color-by');
  colorBySelect.addEventListener('change', function() {
    mosaic.update(mosaic.displayMode, this.value, document.getElementById('filter-category').value);
  });
  
  // Category filter
  const filterCategorySelect = document.getElementById('filter-category');
  filterCategorySelect.addEventListener('change', function() {
    mosaic.update(mosaic.displayMode, mosaic.colorBy, this.value);
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
    
    <h4>Connections</h4>
    <p>${student.connections ? student.connections.length : 'No'} connections to other students</p>
  `;
  
  detailsContent.innerHTML = html;
}