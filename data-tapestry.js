// Utility function for distance calculations
function distToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    
    if (lenSq === 0) {
      // Points are the same
      return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1));
    }
    
    // Calculate projection
    let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    
    return Math.sqrt((px - projX) * (px - projX) + (py - projY) * (py - projY));
  }
  
  // Thread class for representing a student's engagement journey
  class Thread {
    constructor(p, student, path, properties) {
      this.p = p;
      this.student = student;
      this.path = path; // Array of {x, y, month} points
      this.properties = properties;
      this.boundingBox = this.calculateBoundingBox();
      
      // Calculate control points for smooth curves
      this.calculateCurves();
    }
    
    calculateBoundingBox() {
      let minX = Infinity, minY = Infinity;
      let maxX = -Infinity, maxY = -Infinity;
      
      this.path.forEach(point => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
      
      // Add padding for thickness
      const padding = this.properties.thickness * 5;
      return {
        x: minX - padding,
        y: minY - padding,
        width: maxX - minX + padding * 2,
        height: maxY - minY + padding * 2
      };
    }
    
    calculateCurves() {
      // For each segment, calculate control points for bezier
      this.segments = [];
      
      for (let i = 0; i < this.path.length - 1; i++) {
        const start = this.path[i];
        const end = this.path[i + 1];
        
        // If either point is a control point, skip
        if (start.control || end.control) continue;
        
        // Find control points for this segment
        let control1, control2;
        
        if (i + 1 < this.path.length - 1 && this.path[i + 1].control) {
          // Next point is a control point
          control1 = this.path[i + 1];
          
          if (i + 2 < this.path.length - 1 && this.path[i + 2].control) {
            // Use two control points
            control2 = this.path[i + 2];
            i += 2; // Skip these control points
          } else {
            // Only one control point, mirror it
            control2 = {
              x: control1.x + (end.x - control1.x),
              y: control1.y + (end.y - control1.y)
            };
            i += 1; // Skip this control point
          }
        } else {
          // No control points, use default bezier controls
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          control1 = {
            x: start.x + dx * 0.5,
            y: start.y + dy * 0.3
          };
          control2 = {
            x: start.x + dx * 0.5,
            y: start.y + dy * 0.7
          };
        }
        
        this.segments.push({
          start: start,
          control1: control1,
          control2: control2,
          end: end
        });
      }
    }
    
    display(viewMode, time, dimmed, highlighted) {
      const p = this.p;
      
      // Set drawing properties
      p.noFill();
      
      // Determine thread opacity
      let opacity = dimmed ? 80 : 220;
      if (highlighted) opacity = 255;
      
      // Set thread color
      p.stroke(
        p.red(this.properties.color),
        p.green(this.properties.color),
        p.blue(this.properties.color),
        opacity
      );
      
      // Set thread thickness
      const baseThickness = this.properties.thickness;
      const thickness = highlighted ? baseThickness * 1.5 : baseThickness;
      p.strokeWeight(thickness);
      
      // Add texture if needed
      if (this.properties.texture > 0.1) {
        p.drawingContext.setLineDash([5 * this.properties.texture, 3 * this.properties.texture]);
      } else {
        p.drawingContext.setLineDash([]);
      }
      
      // Draw thread segments
      for (const segment of this.segments) {
        // Add subtle animation based on time
        const animAmt = highlighted ? 3 : 1;
        const offsetY = highlighted ? 
                       Math.sin(time * 2 + segment.start.x * 0.01) * animAmt : 
                       0;
        
        p.bezier(
          segment.start.x, segment.start.y + offsetY,
          segment.control1.x, segment.control1.y + offsetY,
          segment.control2.x, segment.control2.y + offsetY,
          segment.end.x, segment.end.y + offsetY
        );
        
        // Draw knots at events
        if (segment.start.events) {
          this.drawKnots(segment.start.x, segment.start.y + offsetY, segment.start.events, highlighted);
        }
        if (segment.end.events) {
          this.drawKnots(segment.end.x, segment.end.y + offsetY, segment.end.events, highlighted);
        }
      }
      
      // Reset line style
      p.drawingContext.setLineDash([]);
      
      // Draw student ID for highlighted threads
      if (highlighted) {
        p.fill(p.red(this.properties.color), p.green(this.properties.color), p.blue(this.properties.color));
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(14);
        
        // Find a good position for the label
        // For simplicity, we'll use the middle of the path
        const middleIndex = Math.floor(this.path.length / 2);
        const labelX = this.path[middleIndex].x;
        const labelY = this.path[middleIndex].y - 20;
        
        // Draw label background
        p.fill(255, 240);
        p.rect(labelX - 50, labelY - 10, 100, 20, 5);
        
        // Draw label text
        p.fill(p.red(this.properties.color), p.green(this.properties.color), p.blue(this.properties.color));
        p.text(this.student.id, labelX, labelY);
      }
    }
    
    drawKnots(x, y, events, highlighted) {
      const p = this.p;
      
      // If multiple events at this point, arrange them in a small cluster
      const eventCount = events.length;
      const maxEventsToShow = highlighted ? 5 : Math.min(3, eventCount);
      const radius = highlighted ? 8 : 6;
      
      for (let i = 0; i < maxEventsToShow; i++) {
        const event = events[i];
        const angle = (i / maxEventsToShow) * p.TWO_PI;
        const offsetX = eventCount > 1 ? Math.cos(angle) * radius : 0;
        const offsetY = eventCount > 1 ? Math.sin(angle) * radius : 0;
        
        // Draw the knot
        this.drawKnot(x + offsetX, y + offsetY, event, highlighted);
      }
      
      // If there are more events than we're showing, add an indicator
      if (eventCount > maxEventsToShow) {
        p.push();
        p.fill(255);
        p.stroke(100);
        p.strokeWeight(1);
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(8);
        p.text(`+${eventCount - maxEventsToShow}`, x, y - radius - 5);
        p.pop();
      }
    }
    
    drawKnot(x, y, event, highlighted) {
      const p = this.p;
      
      // Draw a knot to represent an event
      const knotSize = highlighted ? 8 : 6;
      
      // Draw filled knot
      p.noStroke();
      p.fill(
        p.red(this.properties.color),
        p.green(this.properties.color),
        p.blue(this.properties.color),
        highlighted ? 230 : 180
      );
      
      // Draw different shapes based on event category
      switch (event.category) {
        case 'academic':
          // Circle
          p.ellipse(x, y, knotSize, knotSize);
          break;
        case 'social':
          // Square
          p.rect(x - knotSize/2, y - knotSize/2, knotSize, knotSize);
          break;
        case 'professional':
          // Diamond
          p.push();
          p.translate(x, y);
          p.rotate(p.PI/4);
          p.rect(-knotSize/2, -knotSize/2, knotSize, knotSize);
          p.pop();
          break;
        case 'cultural':
          // Triangle
          p.push();
          p.beginShape();
          p.vertex(x, y - knotSize/2);
          p.vertex(x - knotSize/2, y + knotSize/2);
          p.vertex(x + knotSize/2, y + knotSize/2);
          p.endShape(p.CLOSE);
          p.pop();
          break;
        case 'athletic':
          // Star
          p.push();
          p.beginShape();
          for (let i = 0; i < 5; i++) {
            const angle = p.TWO_PI * i / 5 - p.PI/2;
            const x1 = x + Math.cos(angle) * knotSize/2;
            const y1 = y + Math.sin(angle) * knotSize/2;
            p.vertex(x1, y1);
            
            const angleInner = angle + p.TWO_PI/10;
            const x2 = x + Math.cos(angleInner) * knotSize/4;
            const y2 = y + Math.sin(angleInner) * knotSize/4;
            p.vertex(x2, y2);
          }
          p.endShape(p.CLOSE);
          p.pop();
          break;
        default:
          // Default circle
          p.ellipse(x, y, knotSize, knotSize);
      }
    }
    
    containsPoint(x, y) {
      // Quick check using bounding box
      if (x < this.boundingBox.x || x > this.boundingBox.x + this.boundingBox.width ||
          y < this.boundingBox.y || y > this.boundingBox.y + this.boundingBox.height) {
        return false;
      }
      
      // Check distance to each segment
      const p = this.p;
      const threshold = this.properties.thickness * 3; // Clickable area around thread
      
      for (const segment of this.segments) {
        // Check multiple points along the curve
        const steps = 10;
        
        for (let t = 0; t < steps; t++) {
          const t1 = t / steps;
          const t2 = (t + 1) / steps;
          
          const x1 = p.bezierPoint(segment.start.x, segment.control1.x, segment.control2.x, segment.end.x, t1);
          const y1 = p.bezierPoint(segment.start.y, segment.control1.y, segment.control2.y, segment.end.y, t1);
          const x2 = p.bezierPoint(segment.start.x, segment.control1.x, segment.control2.x, segment.end.x, t2);
          const y2 = p.bezierPoint(segment.start.y, segment.control1.y, segment.control2.y, segment.end.y, t2);
          
          // Distance from point to line segment
          const dist = distToSegment(x, y, x1, y1, x2, y2);
          if (dist < threshold) {
            return true;
          }
        }
      }
      
      return false;
    }
  }
  
  // DataTapestry class
  class DataTapestry {
    constructor(p, studentData, width, height) {
      this.p = p;
      this.data = studentData;
      this.width = width;
      this.height = height;
      this.threads = [];
      this.baseImage = null;
      this.guidingPoints = [];
      this.highlightAreas = [];
      
      // Configuration parameters
      this.config = {
        threadMinThickness: 1,
        threadMaxThickness: 4,
        categoryColors: {
          academic: p.color(53, 76, 161),    // SMU blue
          social: p.color(249, 200, 14),     // SMU yellow
          professional: p.color(89, 195, 195), // SMU teal
          cultural: p.color(180, 100, 180),  // Purple
          athletic: p.color(204, 0, 53),     // SMU red
          default: p.color(169, 169, 169)    // Dark Gray
        },
        texturePatterns: {
          specialist: 3,
          balanced: 5,
          sampler: 8
        }
      };
      
      // View parameters
      this.viewX = 0;
      this.viewY = 0;
      this.zoomLevel = 1.0;
      this.minZoom = 0.5;
      this.maxZoom = 4.0;
      
      // Animation parameters
      this.time = 0;
      
      // Thread layout parameters
      this.threadSpacing = 15;
    }
    
    preload() {
      // Load the mustang SVG
      console.log("Loading mustang.svg...");
      this.p.loadImage('mustang.svg', 
        img => {
          console.log("SVG loaded successfully!");
          this.baseImage = img;
          this.generateGuidingPoints();
        },
        err => {
          console.error("Failed to load SVG:", err);
          this.generateGuidingPoints();
        }
      );
    }
    
    generateGuidingPoints() {
      console.log("Generating guiding points...");
      // Create a mustang-like shape pattern of points
      this.guidingPoints = [];
      
      const p = this.p;
      const centerX = this.width / 2;
      const centerY = this.height / 2;
      const width = this.width * 0.7;
      const height = this.height * 0.6;
      
      // Create points for a mustang-like silhouette
      // Body points
      for (let x = -0.3; x < 0.3; x += 0.02) {
        for (let y = -0.1; y < 0.1; y += 0.02) {
          const px = centerX + x * width;
          const py = centerY + y * height;
          this.guidingPoints.push({
            x: px,
            y: py,
            weight: 1.0
          });
        }
      }
      
      // Head points (right side)
      for (let x = 0.3; x < 0.5; x += 0.02) {
        for (let y = -0.15; y < 0.05; y += 0.02) {
          const px = centerX + x * width;
          const py = centerY + y * height;
          this.guidingPoints.push({
            x: px,
            y: py,
            weight: 1.0
          });
        }
      }
      
      // Tail points (left side)
      for (let x = -0.45; x < -0.3; x += 0.02) {
        for (let y = -0.15; y < 0.05; y += 0.02) {
          const px = centerX + x * width;
          const py = centerY + y * height;
          this.guidingPoints.push({
            x: px,
            y: py,
            weight: 1.0
          });
        }
      }
      
      // Legs
      for (let legPosition of [-0.25, -0.1, 0.1, 0.25]) {
        for (let y = 0.1; y < 0.3; y += 0.02) {
          const px = centerX + legPosition * width;
          const py = centerY + y * height;
          this.guidingPoints.push({
            x: px,
            y: py,
            weight: 1.0
          });
        }
      }
      
      console.log(`Created ${this.guidingPoints.length} guiding points`);
      
      // Now that we have guiding points, initialize threads
      this.initializeThreads();
    }
    
    initializeThreads() {
      console.log("Initializing threads...");
      // Create threads for each student
      this.data.students.forEach((student, index) => {
        const threadProperties = this.calculateThreadProperties(student);
        const threadPath = this.calculateThreadPath(student, index);
        
        const thread = new Thread(
          this.p,
          student,
          threadPath,
          threadProperties
        );
        
        this.threads.push(thread);
      });
      
      console.log(`Created ${this.threads.length} threads`);
    }
    
    calculateThreadPath(student, studentIndex) {
      const path = [];
      const p = this.p;
      
      // Determine if this is a vertical or horizontal thread
      const isVertical = studentIndex % 3 === 0;
      
      if (isVertical) {
        // Create a vertical thread
        const relativeIndex = Math.floor(studentIndex / 3);
        const totalThreads = Math.ceil(this.data.students.length / 3);
        const normalizedPos = relativeIndex / totalThreads;
        
        // Calculate horizontal position
        const xPosition = p.map(normalizedPos, 0, 1, p.width * 0.1, p.width * 0.9) + 
                        p.random(-this.threadSpacing/2, this.threadSpacing/2);
        
        // Start position
        path.push({ 
          x: xPosition, 
          y: p.height * 0.1,
          month: 0 
        });
        
        // Generate points for each month with event
        let lastY = p.height * 0.1;
        
        // Group events by month
        const eventsByMonth = {};
        student.events.forEach(event => {
          if (!eventsByMonth[event.month]) {
            eventsByMonth[event.month] = [];
          }
          eventsByMonth[event.month].push(event);
        });
        
        // For each month (0-8)
        for (let month = 0; month <= 8; month++) {
          if (eventsByMonth[month] && eventsByMonth[month].length > 0) {
            // Calculate vertical position based on month
            const monthY = p.map(month, 0, 8, p.height * 0.2, p.height * 0.8);
            
            // Add control point for curve
            if (month > 0) {
              path.push({
                x: xPosition + p.random(-this.threadSpacing/3, this.threadSpacing/3),
                y: (lastY + monthY) / 2,
                month: month - 0.5,
                control: true
              });
            }
            
            // Add point for this month with deviation
            const deviation = p.random(-this.threadSpacing/2, this.threadSpacing/2) * 
                             (eventsByMonth[month].length / 5);
            
            path.push({ 
              x: xPosition + deviation,
              y: monthY,
              month: month,
              events: eventsByMonth[month]
            });
            
            lastY = monthY;
          }
        }
        
        // End position (only add if we don't already have a point near end)
        if (lastY < p.height * 0.8) {
          path.push({ 
            x: xPosition, 
            y: p.height * 0.9,
            month: 8 
          });
        }
      } else {
        // Create a horizontal thread
        const relativeIndex = Math.floor(studentIndex / 3);
        const normalizedPos = (relativeIndex % 20) / 20; // 20 horizontal threads max
        
        // Calculate vertical position
        const yPosition = p.map(normalizedPos, 0, 1, p.height * 0.15, p.height * 0.85) + 
                        p.random(-this.threadSpacing/3, this.threadSpacing/3);
        
        // Start position
        path.push({ 
          x: p.width * 0.1, 
          y: yPosition,
          month: 0 
        });
        
        // Group events by month
        const eventsByMonth = {};
        student.events.forEach(event => {
          if (!eventsByMonth[event.month]) {
            eventsByMonth[event.month] = [];
          }
          eventsByMonth[event.month].push(event);
        });
        
        // For each month (0-8)
        for (let month = 0; month <= 8; month++) {
          if (eventsByMonth[month] && eventsByMonth[month].length > 0) {
            // Calculate horizontal position based on month
            const monthX = p.map(month, 0, 8, p.width * 0.15, p.width * 0.85);
            
            // Add control point for curve
            path.push({
              x: monthX - p.random(10, 30),
              y: yPosition + p.random(-this.threadSpacing/3, this.threadSpacing/3),
              month: month - 0.5,
              control: true
            });
            
            // Add point for this month with deviation
            const deviation = p.random(-this.threadSpacing/2, this.threadSpacing/2) * 
                             (eventsByMonth[month].length / 5);
            
            path.push({ 
              x: monthX,
              y: yPosition + deviation,
              month: month,
              events: eventsByMonth[month]
            });
          }
        }
        
        // Add end position
        path.push({ 
          x: p.width * 0.9, 
          y: yPosition,
          month: 8 
        });
      }
      
      return path;
    }
    
    calculateThreadProperties(student) {
      const p = this.p;
      
      // Determine primary category for the student
      const categoryCounts = {
        academic: 0,
        social: 0,
        professional: 0,
        cultural: 0,
        athletic: 0
      };
      
      student.events.forEach(event => {
        if (categoryCounts[event.category] !== undefined) {
          categoryCounts[event.category]++;
        }
      });
      
      let primaryCategory = 'default';
      let maxCount = 0;
      
      for (const category in categoryCounts) {
        if (categoryCounts[category] > maxCount) {
          maxCount = categoryCounts[category];
          primaryCategory = category;
        }
      }
      
      // Calculate thread thickness based on total events
      const totalEvents = student.events.length;
      const normalizedThickness = p.map(
        totalEvents,
        1,
        20,
        this.config.threadMinThickness,
        this.config.threadMaxThickness
      );
      const thickness = p.constrain(normalizedThickness, this.config.threadMinThickness, this.config.threadMaxThickness);
      
      // Calculate texture based on engagement style
      let texture = 0;
      switch (student.engagement_style) {
        case 'sampler':
          texture = 0.8;
          break;
        case 'specialist':
          texture = 0.2;
          break;
        case 'super-connector':
          texture = 0.5;
          break;
        case 'selective':
          texture = 0.4;
          break;
        default:
          texture = 0.3;
      }
      
      return {
        color: this.config.categoryColors[primaryCategory],
        thickness: thickness,
        texture: texture
      };
    }
    
    display(viewMode, filterCategory, selectedStudentId) {
      const p = this.p;
      
      p.background(255);
      
      // Apply view transformation
      p.push();
      p.translate(this.viewX, this.viewY);
      p.scale(this.zoomLevel);
      
      // Update animation time
      this.time += 0.02;
      
      // Draw threads
      this.threads.forEach(thread => {
        // Check filter conditions
        const category = this.getPrimaryCategory(thread.student);
        
        const categoryMatch = filterCategory === 'all' || category === filterCategory;
        if (!categoryMatch) return;
        
        const isSelected = thread.student.id === selectedStudentId;
        const isDimmed = selectedStudentId && !isSelected;
        
        // Draw the thread
        thread.display(viewMode, this.time, isDimmed, isSelected);
      });
      
      p.pop();
    }
    
    getPrimaryCategory(student) {
      // Determine primary category for the student
      const categoryCounts = {
        academic: 0,
        social: 0,
        professional: 0,
        cultural: 0,
        athletic: 0
      };
      
      student.events.forEach(event => {
        if (categoryCounts[event.category] !== undefined) {
          categoryCounts[event.category]++;
        }
      });
      
      let primaryCategory = 'default';
      let maxCount = 0;
      
      for (const category in categoryCounts) {
        if (categoryCounts[category] > maxCount) {
          maxCount = categoryCounts[category];
          primaryCategory = category;
        }
      }
      
      return primaryCategory;
    }
    
    findThreadAtPosition(mouseX, mouseY) {
      // Apply inverse view transformation
      const x = (mouseX - this.viewX) / this.zoomLevel;
      const y = (mouseY - this.viewY) / this.zoomLevel;
      
      // Find thread that contains this point
      for (const thread of this.threads) {
        if (thread.containsPoint(x, y)) {
          return thread;
        }
      }
      
      return null;
    }
    
    pan(dx, dy) {
      this.viewX += dx;
      this.viewY += dy;
      
      // Optional: Add bounds checking if needed
    }
    
    zoom(amount, centerX, centerY) {
      // Store current mouse position in world coordinates
      const worldX = (centerX - this.viewX) / this.zoomLevel;
      const worldY = (centerY - this.viewY) / this.zoomLevel;
      
      // Adjust zoom level
      this.zoomLevel = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoomLevel + amount));
      
      // Adjust view to keep the point under the mouse fixed
      this.viewX = centerX - worldX * this.zoomLevel;
      this.viewY = centerY - worldY * this.zoomLevel;
    }
    
    resetView() {
      this.viewX = 0;
      this.viewY = 0;
      this.zoomLevel = 1.0;
    }
  }
  
  // Export classes for use in other files
  window.Thread = Thread;
  window.DataTapestry = DataTapestry;