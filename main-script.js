// Main application script for SMU Engagement Tapestry
// This script handles the UI interactions and P5.js setup

// Global variables
let dataTapestry;
let selectedStudentId = null;
let currentViewMode = 'image';
let currentFilter = 'all';
let isDragging = false;
let lastMouseX, lastMouseY;

// Mock data for demonstration purposes
const mockStudentData = {
  students: [
    {
      id: "SMU2025001",
      engagement_style: "sampler",
      events: [
        { month: 1, category: "academic", name: "First-Year Seminar" },
        { month: 2, category: "social", name: "Campus Club Fair" },
        { month: 3, category: "professional", name: "Career Workshop" },
        { month: 5, category: "cultural", name: "International Festival" },
        { month: 7, category: "athletic", name: "Intramural Sports" }
      ]
    },
    {
      id: "SMU2025002",
      engagement_style: "specialist",
      events: [
        { month: 1, category: "academic", name: "Research Project" },
        { month: 2, category: "academic", name: "Study Group" },
        { month: 3, category: "academic", name: "Department Lecture" },
        { month: 5, category: "academic", name: "Academic Conference" },
        { month: 6, category: "academic", name: "Honors Presentation" },
        { month: 7, category: "academic", name: "Thesis Workshop" }
      ]
    },
    {
      id: "SMU2025003",
      engagement_style: "super-connector",
      events: [
        { month: 1, category: "social", name: "Student Government" },
        { month: 2, category: "professional", name: "Leadership Summit" },
        { month: 3, category: "cultural", name: "Arts Exhibition" },
        { month: 4, category: "athletic", name: "Rally Event" },
        { month: 5, category: "academic", name: "Interdisciplinary Project" },
        { month: 6, category: "social", name: "Campus Tour Guide" },
        { month: 7, category: "professional", name: "Alumni Networking" }
      ]
    },
    {
      id: "SMU2025004",
      engagement_style: "selective",
      events: [
        { month: 2, category: "athletic", name: "Varsity Sports" },
        { month: 3, category: "athletic", name: "Team Training" },
        { month: 4, category: "athletic", name: "Championship Game" },
        { month: 6, category: "social", name: "Team Social Event" }
      ]
    },
    {
      id: "SMU2025005",
      engagement_style: "specialist",
      events: [
        { month: 1, category: "professional", name: "Business Case Competition" },
        { month: 2, category: "professional", name: "Mock Interviews" },
        { month: 4, category: "professional", name: "Networking Event" },
        { month: 5, category: "professional", name: "Industry Panel" },
        { month: 7, category: "professional", name: "Summer Internship" }
      ]
    },
    {
      id: "SMU2025006",
      engagement_style: "sampler",
      events: [
        { month: 1, category: "cultural", name: "Theater Production" },
        { month: 3, category: "academic", name: "Library Workshop" },
        { month: 4, category: "social", name: "Community Service" },
        { month: 6, category: "professional", name: "Career Fair" }
      ]
    },
    {
      id: "SMU2025007",
      engagement_style: "super-connector",
      events: [
        { month: 1, category: "social", name: "Residence Hall Council" },
        { month: 2, category: "social", name: "Campus Event Planning" },
        { month: 3, category: "social", name: "Spring Festival" },
        { month: 4, category: "cultural", name: "Diversity Workshop" },
        { month: 5, category: "athletic", name: "Sports Club" },
        { month: 6, category: "academic", name: "Peer Tutoring" },
        { month: 7, category: "professional", name: "Student Ambassador" }
      ]
    },
    {
      id: "SMU2025008",
      engagement_style: "selective",
      events: [
        { month: 2, category: "cultural", name: "Music Ensemble" },
        { month: 3, category: "cultural", name: "Concert Performance" },
        { month: 5, category: "cultural", name: "Music Workshop" },
        { month: 7, category: "cultural", name: "Summer Arts Program" }
      ]
    }
  ]
};

// Generate more mock students
for (let i = 9; i <= 40; i++) {
  const studentId = `SMU2025${i.toString().padStart(3, '0')}`;
  const styles = ["sampler", "specialist", "super-connector", "selective"];
  const categories = ["academic", "social", "professional", "cultural", "athletic"];
  
  const style = styles[Math.floor(Math.random() * styles.length)];
  const eventCount = 3 + Math.floor(Math.random() * 5); // 3-7 events
  const events = [];
  
  for (let j = 0; j < eventCount; j++) {
    const month = 1 + Math.floor(Math.random() * 7); // months 1-7
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    events.push({
      month,
      category,
      name: `${category.charAt(0).toUpperCase() + category.slice(1)} Event ${j+1}`
    });
  }
  
  mockStudentData.students.push({
    id: studentId,
    engagement_style: style,
    events
  });
}

// Initialize the P5.js sketch
let sketch;
window.addEventListener('DOMContentLoaded', () => {
  sketch = new p5(p => {
  p.preload = function() {
    // Any resources that need to be preloaded
  };
  
  p.setup = function() {
    const canvasContainer = document.getElementById('visualization-canvas');
    const canvas = p.createCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    canvas.parent('visualization-canvas');
    
    // Initialize the data tapestry
    dataTapestry = new DataTapestry(p, mockStudentData, p.width, p.height);
    dataTapestry.preload(); // Load resources
    
    // Disable right-click context menu on canvas
    document.getElementById('visualization-canvas').addEventListener('contextmenu', e => e.preventDefault());
    
    // Setup UI event listeners
    setupEventListeners();
    
    // Set initial view
    updateViewMode('image');
    updateFilter('all');
  };
  
  p.draw = function() {
    // Render the data tapestry
    dataTapestry.display(currentViewMode, currentFilter, selectedStudentId);
  };
  
  p.windowResized = function() {
    const canvasContainer = document.getElementById('visualization-canvas');
    p.resizeCanvas(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    
    // Update tapestry dimensions if needed
    dataTapestry.width = p.width;
    dataTapestry.height = p.height;
  };
  
  p.mousePressed = function() {
    // Check if the mouse is over the canvas
    if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
      // Start dragging
      isDragging = true;
      lastMouseX = p.mouseX;
      lastMouseY = p.mouseY;
      
      // Check if clicked on a thread
      const thread = dataTapestry.findThreadAtPosition(p.mouseX, p.mouseY);
      if (thread) {
        // Select this thread
        selectStudent(thread.student.id);
      }
    }
    
    // Allow default behavior (to not interfere with UI buttons)
    return true;
  };
  
  p.mouseDragged = function() {
    if (isDragging) {
      // Calculate mouse movement
      const dx = p.mouseX - lastMouseX;
      const dy = p.mouseY - lastMouseY;
      
      // Pan the view
      dataTapestry.pan(dx, dy);
      
      // Update last mouse position
      lastMouseX = p.mouseX;
      lastMouseY = p.mouseY;
      
      // Prevent default behavior
      return false;
    }
  };
  
  p.mouseReleased = function() {
    // Stop dragging
    isDragging = false;
  };
  
  p.mouseWheel = function(event) {
    // Zoom in/out based on scroll direction
    const zoomAmount = event.delta > 0 ? -0.05 : 0.05;
    dataTapestry.zoom(zoomAmount, p.mouseX, p.mouseY);
    
    // Prevent default behavior
    return false;
  };
});
});