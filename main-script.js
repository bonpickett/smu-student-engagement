// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Create the p5 instance with our sketch
    new p5(function(p) {
      let tapestry;
      let studentData;
      let filterBy = 'all'; // Default filter
      let viewMode = 'image'; // Default view mode: 'image' or 'abstract'
      let searchTerm = ''; // Default search term
      let selectedStudent = null; // Selected student for detail view
      let isDragging = false;
      let lastMouseX = 0;
      let lastMouseY = 0;
      
      // Preload function to load assets before setup
      p.preload = function() {
        console.log("Preloading data...");
        
        // Initialize empty student data structure
        studentData = {
          students: [],
          totalGroups: 199 // From our CSV analysis
        };
        
        // Load in the sample student data
        loadStudentData();
      };
      
      // Setup function - called once when the sketch starts
      p.setup = function() {
        console.log("Setting up visualization...");
        const container = document.getElementById('visualization-canvas');
        
        // Create canvas
        p.createCanvas(container.offsetWidth, container.offsetHeight);
        
        p.colorMode(p.RGB);
        p.textFont('Arial');
        p.frameRate(30);
        
        // Initialize the tapestry visualization
        tapestry = new DataTapestry(p, studentData, p.width, p.height);
        tapestry.preload();
        
        // Position tracking for dragging
        lastMouseX = p.mouseX;
        lastMouseY = p.mouseY;
        
        // Setup UI controls
        setupControls();
      };
      
      // Draw function - called continuously for animation
      p.draw = function() {
        p.background(245);
        
        if (tapestry) {
          tapestry.display(filterBy, viewMode, searchTerm, selectedStudent);
        }
      };
      
      // Handle window resize
      p.windowResized = function() {
        const container = document.getElementById('visualization-canvas');
        p.resizeCanvas(container.offsetWidth, container.offsetHeight);
        if (tapestry) tapestry.resize();
      };
      
      // Mouse interaction functions
      p.mousePressed = function() {
        if (p.mouseX > 0 && p.mouseX < p.width && p.mouseY > 0 && p.mouseY < p.height) {
          isDragging = true;
          lastMouseX = p.mouseX;
          lastMouseY = p.mouseY;
          return false; // Prevent default behavior
        }
      };
      
      p.mouseDragged = function() {
        if (isDragging && tapestry) {
          // Move the tapestry view
          const dx = p.mouseX - lastMouseX;
          const dy = p.mouseY - lastMouseY;
          tapestry.pan(dx, dy);
          
          lastMouseX = p.mouseX;
          lastMouseY = p.mouseY;
          return false; // Prevent default behavior
        }
      };
      
      p.mouseReleased = function() {
        // Check if this was a click (not a drag)
        if (isDragging && 
            Math.abs(p.mouseX - lastMouseX) < 5 && 
            Math.abs(p.mouseY - lastMouseY) < 5) {
          // It was a click - check for thread selection
          if (tapestry) {
            selectedStudent = tapestry.checkClick(p.mouseX, p.mouseY);
            if (selectedStudent) {
              showStudentDetails(selectedStudent);
            }
          }
        }
        
        isDragging = false;
      };
      
      p.mouseMoved = function() {
        if (tapestry) {
          const hoveredThread = tapestry.checkHover(p.mouseX, p.mouseY);
          
          // Change cursor when hovering over a thread
          if (hoveredThread) {
            p.cursor(p.HAND);
          } else {
            p.cursor(p.ARROW);
          }
        }
      };
      
      p.mouseWheel = function(event) {
        if (tapestry) {
          if (event.delta > 0) {
            tapestry.zoomOut(p.mouseX, p.mouseY);
          } else {
            tapestry.zoomIn(p.mouseX, p.mouseY);
          }
        }
        return false; // Prevent default scrolling
      };
      
      // Setup UI controls
      function setupControls() {
        // Filter buttons for different thread types
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterBy = this.dataset.filter;
          });
        });
        
        // View mode buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
          btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            viewMode = this.dataset.view;
          });
        });
        
        // Student search
        document.getElementById('student-search').addEventListener('input', function() {
          searchTerm = this.value.toLowerCase();
        });
        
        // Zoom controls
        document.getElementById('zoom-in').addEventListener('click', function() {
          if (tapestry) tapestry.zoomIn();
        });
        
        document.getElementById('zoom-out').addEventListener('click', function() {
          if (tapestry) tapestry.zoomOut();
        });
        
        document.getElementById('reset-view').addEventListener('click', function() {
          if (tapestry) tapestry.resetView();
        });
        
        // Close student details event handler - we'll add this after panel is created
        document.addEventListener('click', function(e) {
          if (e.target && e.target.id === 'close-details') {
            document.getElementById('student-details').classList.add('hidden');
            selectedStudent = null;
          }
        });
      }
      
      // Load sample student data
      function loadStudentData() {
        // Sample student data from our CSV analysis
        const sampleData = [
          {
            id: "student1",
            name: "Alex Johnson",
            degree: "Dedman College",
            engagementStyle: "Super Connector",
            primaryCategory: "academic",
            breadth: { uniqueGroups: 15, groupDiversityPercentile: 92 },
            depth: { totalEvents: 45, avgEventsPerGroup: 3.0, totalEventsPercentile: 88 },
            events: generateMonthlyEvents(45, "academic")
          },
          {
            id: "student2",
            name: "Taylor Smith",
            degree: "Cox School of Business",
            engagementStyle: "Sampler",
            primaryCategory: "social",
            breadth: { uniqueGroups: 12, groupDiversityPercentile: 85 },
            depth: { totalEvents: 25, avgEventsPerGroup: 2.1, totalEventsPercentile: 65 },
            events: generateMonthlyEvents(25, "social")
          },
          {
            id: "student3",
            name: "Jordan Williams",
            degree: "Meadows School of the Arts",
            engagementStyle: "Specialist",
            primaryCategory: "cultural",
            breadth: { uniqueGroups: 5, groupDiversityPercentile: 40 },
            depth: { totalEvents: 32, avgEventsPerGroup: 6.4, totalEventsPercentile: 75 },
            events: generateMonthlyEvents(32, "cultural")
          },
          {
            id: "student4",
            name: "Morgan Lee",
            degree: "Lyle School of Engineering",
            engagementStyle: "Selective",
            primaryCategory: "professional",
            breadth: { uniqueGroups: 3, groupDiversityPercentile: 25 },
            depth: { totalEvents: 12, avgEventsPerGroup: 4.0, totalEventsPercentile: 40 },
            events: generateMonthlyEvents(12, "professional")
          },
          {
            id: "student5",
            name: "Casey Zhang",
            degree: "Dedman College",
            engagementStyle: "Super Connector",
            primaryCategory: "academic",
            breadth: { uniqueGroups: 18, groupDiversityPercentile: 95 },
            depth: { totalEvents: 65, avgEventsPerGroup: 3.6, totalEventsPercentile: 92 },
            events: generateMonthlyEvents(65, "academic")
          },
          {
            id: "student6",
            name: "Riley Martinez",
            degree: "Cox School of Business",
            engagementStyle: "Sampler",
            primaryCategory: "social",
            breadth: { uniqueGroups: 14, groupDiversityPercentile: 88 },
            depth: { totalEvents: 20, avgEventsPerGroup: 1.4, totalEventsPercentile: 60 },
            events: generateMonthlyEvents(20, "social")
          },
          {
            id: "student7",
            name: "Avery Wilson",
            degree: "Simmons School of Education",
            engagementStyle: "Specialist",
            primaryCategory: "cultural",
            breadth: { uniqueGroups: 4, groupDiversityPercentile: 35 },
            depth: { totalEvents: 28, avgEventsPerGroup: 7.0, totalEventsPercentile: 70 },
            events: generateMonthlyEvents(28, "cultural")
          },
          {
            id: "student8",
            name: "Jordan Parker",
            degree: "Dedman College",
            engagementStyle: "Selective",
            primaryCategory: "athletic",
            breadth: { uniqueGroups: 5, groupDiversityPercentile: 40 },
            depth: { totalEvents: 15, avgEventsPerGroup: 3.0, totalEventsPercentile: 45 },
            events: generateMonthlyEvents(15, "athletic")
          }
        ];
        
        // Add our sample data to the student data
        studentData.students = sampleData;
        console.log(`Loaded ${studentData.students.length} student profiles`);
      }
      
      // Generate events for a student
      function generateMonthlyEvents(totalCount, primaryCategory) {
        // Generate events distributed across the academic year
        const events = [];
        const categories = ['academic', 'social', 'professional', 'cultural', 'athletic'];
        const groups = ['Student Organization', 'Department', 'Residence Life', 'Graduate Student Organization'];
        
        // Ensure primary category is most common
        const primaryCategoryProb = 0.7;
        
        // Distribute events across months (with some concentration in middle of academic year)
        const monthDistribution = [0.08, 0.12, 0.15, 0.12, 0.08, 0.12, 0.15, 0.12, 0.06];
        
        for (let month = 0; month < 9; month++) {
          // Calculate events for this month (with some randomness)
          const targetCount = Math.round(totalCount * monthDistribution[month]);
          const monthlyCount = Math.max(0, targetCount + Math.floor(Math.random() * 3) - 1);
          
          for (let i = 0; i < monthlyCount; i++) {
            // Determine category (biased toward primary)
            let category = primaryCategory;
            if (Math.random() > primaryCategoryProb) {
              // Pick a different category
              category = categories.filter(c => c !== primaryCategory)[
                Math.floor(Math.random() * (categories.length - 1))
              ];
            }
            
            // Create event
            events.push({
              name: `Event ${events.length + 1}`,
              category: category,
              group: groups[Math.floor(Math.random() * groups.length)],
              month: month,
              importance: Math.random() * 0.5 + 0.5 // Importance between 0.5 and 1.0
            });
          }
        }
        
        return events;
      }
      
      // Show student details when a thread is clicked
      function showStudentDetails(student) {
        // Display student details in the side panel
        const detailsPanel = document.getElementById('student-details');
        detailsPanel.classList.remove('hidden');
        
        // Count events by category
        const eventsByCategory = {
          'academic': 0,
          'social': 0,
          'professional': 0,
          'cultural': 0,
          'athletic': 0
        };
        
        student.events.forEach(event => {
          if (eventsByCategory[event.category] !== undefined) {
            eventsByCategory[event.category]++;
          }
        });
        
        // Count events by month
        const eventsByMonth = Array(9).fill(0); // 9 academic months
        student.events.forEach(event => {
          if (event.month >= 0 && event.month < 9) {
            eventsByMonth[event.month]++;
          }
        });
        
        // Generate HTML for student details
        let html = `
          <div class="details-header">
            <h3>Student Profile</h3>
            <button id="close-details" class="close-btn">&times;</button>
          </div>
          
          <div class="profile-summary">
            <div class="student-id">${student.id}</div>
            <div class="engagement-style ${student.engagementStyle.toLowerCase().replace(' ', '-')}">
              ${student.engagementStyle}
            </div>
            <div class="metrics-grid">
              <div class="metric">
                <span class="metric-value">${student.breadth.uniqueGroups}</span>
                <span class="metric-label">Groups</span>
              </div>
              <div class="metric">
                <span class="metric-value">${student.depth.totalEvents}</span>
                <span class="metric-label">Events</span>
              </div>
              <div class="metric">
                <span class="metric-value">${student.primaryCategory}</span>
                <span class="metric-label">Primary Interest</span>
              </div>
              <div class="metric">
                <span class="metric-value">${student.depth.avgEventsPerGroup.toFixed(1)}</span>
                <span class="metric-label">Avg/Group</span>
              </div>
            </div>
          </div>
          
          <h4>Interest Distribution</h4>
          <div class="interest-bars">
        `;
        
        // Add bars for each category
        Object.keys(eventsByCategory).forEach(category => {
          const percentage = student.depth.totalEvents > 0 ? 
            (eventsByCategory[category] / student.depth.totalEvents) * 100 : 0;
          
          html += `
            <div class="interest-bar">
              <span class="bar-label">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
              <div class="bar-container">
                <div class="bar-fill ${category}" style="width: ${percentage}%"></div>
              </div>
              <span class="bar-value">${eventsByCategory[category]}</span>
            </div>
          `;
        });
        
        html += `
          </div>
          
          <h4>Engagement Timeline</h4>
          <div class="timeline-chart">
            <canvas id="timeline-canvas" width="220" height="100"></canvas>
          </div>
          
          <div class="thread-highlight">
            <button id="highlight-thread" class="highlight-btn">Highlight Thread in Tapestry</button>
          </div>
        `;
        
        detailsPanel.innerHTML = html;
        
        // Draw the timeline chart
        setTimeout(() => {
          drawTimelineChart(student, eventsByMonth);
        }, 100);
        
        // Add event listener for highlight button
        setTimeout(() => {
          document.getElementById('highlight-thread').addEventListener('click', function() {
            // Highlighting is already handled since selectedStudent is set
          });
        }, 100);
      }
      
      // Draw timeline chart in the student details panel
      function drawTimelineChart(student, eventsByMonth) {
        const canvas = document.getElementById('timeline-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Find the maximum events for scaling
        const maxEvents = Math.max(...eventsByMonth, 1);
        
        // Draw the timeline bars
        const barWidth = (width - 20) / eventsByMonth.length;
        const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
        
        // Draw axes
        ctx.strokeStyle = '#999';
        ctx.beginPath();
        ctx.moveTo(10, height - 25);
        ctx.lineTo(width - 10, height - 25);
        ctx.stroke();
        
        // Draw bars
        eventsByMonth.forEach((count, i) => {
          const barHeight = count > 0 ? (count / maxEvents) * (height - 40) : 0;
          const x = 10 + i * barWidth;
          const y = height - 25 - barHeight;
          
          // Get category color based on primary category
          let barColor;
          switch (student.primaryCategory) {
            case 'academic':
              barColor = 'rgba(53, 76, 161, 0.7)'; // SMU blue
              break;
            case 'social':
              barColor = 'rgba(249, 200, 14, 0.7)'; // SMU yellow
              break;
            case 'professional':
              barColor = 'rgba(89, 195, 195, 0.7)'; // SMU teal
              break;
            case 'cultural':
              barColor = 'rgba(180, 100, 180, 0.7)'; // Purple
              break;
            case 'athletic':
              barColor = 'rgba(204, 0, 53, 0.7)'; // SMU red
              break;
            default:
              barColor = 'rgba(100, 100, 100, 0.7)';
          }
          
          // Draw the bar
          ctx.fillStyle = barColor;
          ctx.fillRect(x, y, barWidth - 2, barHeight);
          
          // Draw month label
          ctx.fillStyle = '#999';
          ctx.font = '8px Arial';
          ctx.textAlign = 'center';
          ctx.fillText(months[i], x + (barWidth - 2) / 2, height - 10);
          
          // Draw count on top of bar if large enough
          if (barHeight > 15) {
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(count.toString(), x + (barWidth - 2) / 2, y + 12);
          }
        });
      }
    }, 'visualization-canvas');
  });