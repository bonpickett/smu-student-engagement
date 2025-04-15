/**
 * data.js - Data management for SMU Spirit Mosaic
 * Processes the real event attendance data from CSV
 */

// Constants for data generation and mapping
const CATEGORIES = ['academic', 'social', 'professional', 'cultural', 'athletic'];
const STYLES = ['sampler', 'specialist', 'super-connector', 'selective'];
const MONTHS = 12; // 12 months in a year

// Color mapping (for visualization)
const CATEGORY_COLORS = {
  academic: [53, 76, 161],       // SMU blue
  social: [249, 200, 14],        // SMU yellow
  professional: [89, 195, 195],  // SMU teal
  cultural: [128, 128, 128],     // Gray
  athletic: [204, 0, 53]         // SMU red
};

const STYLE_PATTERNS = {
  sampler: { pattern: 'dotted', textureScale: 0.8 },
  specialist: { pattern: 'solid', textureScale: 0.2 },
  'super-connector': { pattern: 'cross', textureScale: 0.5 },
  selective: { pattern: 'dashed', textureScale: 0.4 }
};

// Event type to category mapping
const EVENT_TYPE_MAPPING = {
  // We'll set these based on actual data types
  'Academic': 'academic',
  'Athletics': 'athletic',
  'Career': 'professional',
  'Cultural': 'cultural',
  'Arts': 'cultural',
  'Diversity': 'cultural',
  'Community Service': 'social',
  'Social': 'social',
  'Leadership': 'professional',
  'Wellness': 'social',
  'Lecture': 'academic',
  'Workshop': 'professional',
  'Club Meeting': 'social',
  // Default category
  'Other': 'social'
};

// Tags to category mapping for refinement
const TAG_MAPPING = {
  'academic': 'academic',
  'research': 'academic',
  'lecture': 'academic',
  'study': 'academic',
  'career': 'professional',
  'networking': 'professional',
  'leadership': 'professional',
  'social': 'social',
  'club': 'social',
  'service': 'social',
  'culture': 'cultural',
  'international': 'cultural',
  'arts': 'cultural',
  'diversity': 'cultural',
  'athletic': 'athletic',
  'sports': 'athletic',
  'fitness': 'athletic'
};

// Class to manage student data
class StudentDataManager {
  constructor() {
    this.students = [];
    this.positions = new Map();
    this.filteredStudents = [];
    this.currentFilters = {
      category: 'all',
      style: 'all',
      search: ''
    };
    
    // Tracking for raw CSV data
    this.rawEvents = [];
  }
  
  // Process the CSV data
  async processCSVData(callback) {
    console.log("Processing event attendance data...");
    
    try {
      // Load the CSV data
      const response = await window.fs.readFile('2025_eventattendance_4.7.25.csv', { encoding: 'utf8' });
      
      // Parse the CSV
      const parseResult = Papa.parse(response, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      
      this.rawEvents = parseResult.data;
      console.log(`Loaded ${this.rawEvents.length} event attendance records`);
      
      // Process the data into student profiles
      this.processEventData();
      
      // Create abstract positions for visualization
      this.createAbstractPositions();
      
      // Apply initial filters
      this.applyFilters();
      
      if (callback) callback();
      
    } catch (error) {
      console.error("Error processing CSV data:", error);
      // Fall back to generated data if CSV processing fails
      this.generateData(callback);
    }
  }
  
  // Process the event data into student profiles
  processEventData() {
    // Reset students array
    this.students = [];
    
    // Group events by student
    const studentEvents = {};
    
    // Process each event record
    this.rawEvents.forEach(record => {
      const netId = record['Net ID'];
      const eventName = record['Event name'];
      const eventType = record['Event type'] || 'Other';
      const eventTags = record['Event tags'] || '';
      let eventDate = record['Event date'];
      
      // Skip if missing critical data
      if (!netId || !eventName || !eventDate) return;
      
      // Parse date and extract month
      let month = 1; // Default to January
      try {
        const date = new Date(eventDate);
        if (!isNaN(date)) {
          month = date.getMonth() + 1; // 1-12 for Jan-Dec
        }
      } catch (e) {
        console.warn("Couldn't parse date:", eventDate);
      }
      
      // Determine category based on event type and tags
      let category = this.determineCategory(eventType, eventTags);
      
      // Create or update student events
      if (!studentEvents[netId]) {
        studentEvents[netId] = [];
      }
      
      // Add this event
      studentEvents[netId].push({
        name: eventName,
        category,
        month
      });
    });
    
    // Create student objects
    for (const [netId, events] of Object.entries(studentEvents)) {
      // Skip if no events
      if (events.length === 0) continue;
      
      // Calculate category distribution
      const categoryDistribution = {};
      CATEGORIES.forEach(cat => { categoryDistribution[cat] = 0; });
      
      events.forEach(event => {
        categoryDistribution[event.category]++;
      });
      
      // Determine primary category
      const primaryCategory = this.calculatePrimaryCategory(categoryDistribution);
      
      // Determine engagement style based on events pattern
      const style = this.determineEngagementStyle(events, categoryDistribution);
      
      // Create the student object
      const student = {
        id: netId,
        style,
        events,
        categoryDistribution,
        connections: [],
        primaryCategory
      };
      
      this.students.push(student);
    }
    
    console.log(`Created ${this.students.length} student profiles`);
    
    // Generate connections between students
    this.generateConnections();
  }
  
  // Determine category from event type and tags
  determineCategory(eventType, eventTags) {
    // First try to map by event type
    if (EVENT_TYPE_MAPPING[eventType]) {
      return EVENT_TYPE_MAPPING[eventType];
    }
    
    // If that fails, try using tags
    if (eventTags) {
      const tags = eventTags.toLowerCase().split(',').map(tag => tag.trim());
      
      for (const tag of tags) {
        if (TAG_MAPPING[tag]) {
          return TAG_MAPPING[tag];
        }
      }
    }
    
    // Default to social as a fallback
    return 'social';
  }
  
  // Determine engagement style based on event pattern
  determineEngagementStyle(events, categoryDistribution) {
    // Calculate metrics to determine style
    const categoryCount = Object.values(categoryDistribution).filter(count => count > 0).length;
    const totalEvents = events.length;
    
    // Get the highest category count
    const maxCategoryCount = Math.max(...Object.values(categoryDistribution));
    const primaryCategoryRatio = maxCategoryCount / totalEvents;
    
    if (categoryCount >= 4 && primaryCategoryRatio < 0.4) {
      // Super-connector: Spans many categories with no single dominant one
      return 'super-connector';
    } else if (primaryCategoryRatio > 0.7) {
      // Specialist: Highly focused on one category
      return 'specialist';
    } else if (totalEvents <= 5 && categoryCount <= 2) {
      // Selective: Few events, limited categories
      return 'selective';
    } else {
      // Sampler: Tries a variety of things
      return 'sampler';
    }
  }
  
  // Generate student data (fallback if CSV processing fails)
  generateData(callback) {
    console.log("Generating fallback student data...");
    this.students = [];
    
    // Generate students with realistic distributions of engagement
    for (let i = 0; i < 400; i++) {
      const id = `SMU2025${String(i+1).padStart(3, '0')}`;
      const style = STYLES[Math.floor(Math.random() * STYLES.length)];
      const student = this.createStudent(id, style);
      
      this.students.push(student);
    }
    
    console.log(`Generated ${this.students.length} students`);
    
    // Create abstract positions for visualization
    this.createAbstractPositions();
    
    this.applyFilters(); // Initialize filtered students
    
    if (callback) callback();
    
    return this.students;
  }
  
  // Create a single student with realistic engagement patterns (fallback method)
  createStudent(id, style, forcedPrimaryCategory = null) {
    // Determine number of events based on style
    let eventCount;
    switch (style) {
      case 'sampler':
        eventCount = 4 + Math.floor(Math.random() * 3); // 4-6 events
        break;
      case 'specialist':
        eventCount = 5 + Math.floor(Math.random() * 4); // 5-8 events
        break;
      case 'super-connector':
        eventCount = 7 + Math.floor(Math.random() * 5); // 7-11 events
        break;
      case 'selective':
        eventCount = 3 + Math.floor(Math.random() * 3); // 3-5 events
        break;
      default:
        eventCount = 5 + Math.floor(Math.random() * 3); // 5-7 events
    }
    
    // Initialize category distribution
    const categoryDistribution = {};
    CATEGORIES.forEach(cat => { categoryDistribution[cat] = 0; });
    
    // Choose a primary category if not forced
    const primaryCategory = forcedPrimaryCategory || 
                          CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    
    // Create events
    const events = [];
    
    for (let i = 0; i < eventCount; i++) {
      // Determine month (1-12)
      const month = 1 + Math.floor(Math.random() * MONTHS);
      
      // Determine category based on student style
      let category;
      
      switch (style) {
        case 'specialist':
          // Specialists focus heavily on one category
          category = (Math.random() < 0.8) ? primaryCategory 
                   : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
          break;
          
        case 'sampler': {
          // Samplers try different categories
          // Avoid repeating the same category consecutively
          const previousCategory = events.length > 0 ? events[events.length-1].category : null;
          do {
            category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
          } while (category === previousCategory && CATEGORIES.length > 1);
          break;
        }
          
        case 'super-connector': {
          // Ensure super-connectors have at least one of each category if possible
          const missingCategories = CATEGORIES.filter(cat => categoryDistribution[cat] === 0);
          if (missingCategories.length > 0 && i < CATEGORIES.length) {
            category = missingCategories[0];
          } else {
            category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
          }
          break;
        }
          
        case 'selective': {
          // Selectives focus on 1-2 categories
          if (i === 0 || (i === 1 && Math.random() < 0.5)) {
            // First (and maybe second) event establishes their focus areas
            category = i === 0 ? primaryCategory 
                     : CATEGORIES.filter(c => c !== primaryCategory)[Math.floor(Math.random() * (CATEGORIES.length - 1))];
          } else {
            // Subsequent events mostly in those same categories
            const focusCategories = CATEGORIES.filter(cat => categoryDistribution[cat] > 0);
            category = focusCategories[Math.floor(Math.random() * focusCategories.length)];
          }
          break;
        }
          
        default:
          category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      }
      
      // Increment category count
      categoryDistribution[category]++;
      
      // Create the event with a realistic name
      const event = {
        month,
        category,
        name: this.generateEventName(category, month)
      };
      
      events.push(event);
    }
    
    // Sort events by month
    events.sort((a, b) => a.month - b.month);
    
    // Create connections to other students (for network view)
    // Will be populated later based on shared events
    const connections = [];
    
    return {
      id,
      style,
      events,
      categoryDistribution,
      connections,
      primaryCategory: this.calculatePrimaryCategory(categoryDistribution)
    };
  }
  
  // Calculate the primary category based on event distribution
  calculatePrimaryCategory(categoryDistribution) {
    let maxCount = 0;
    let primaryCategory = 'academic'; // Default
    
    for (const [category, count] of Object.entries(categoryDistribution)) {
      if (count > maxCount) {
        maxCount = count;
        primaryCategory = category;
      }
    }
    
    return primaryCategory;
  }
  
  // Generate a realistic event name (fallback method)
  generateEventName(category, month) {
    const monthNames = [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];
    
    const eventsByCategory = {
      academic: [
        'Research Symposium', 'Study Group', 'Department Lecture', 
        'Academic Conference', 'Thesis Workshop', 'Library Workshop',
        'Exam Prep Session', 'Faculty Mixer', 'Honors Presentation'
      ],
      social: [
        'Campus Club Fair', 'Residence Hall Social', 'Student Government',
        'Campus Event Planning', 'Spring Festival', 'Community Service',
        'Student Mixer', 'Campus Tour Guide', 'Social Club Meeting'
      ],
      professional: [
        'Career Workshop', 'Leadership Summit', 'Industry Panel',
        'Networking Event', 'Mock Interviews', 'Career Fair',
        'Business Case Competition', 'Alumni Networking', 'Internship Seminar'
      ],
      cultural: [
        'International Festival', 'Arts Exhibition', 'Theater Production',
        'Music Ensemble', 'Concert Performance', 'Cultural Celebration',
        'Diversity Workshop', 'Film Screening', 'Museum Visit'
      ],
      athletic: [
        'Intramural Sports', 'Varsity Game', 'Team Training',
        'Championship Game', 'Rally Event', 'Sports Club',
        'Fitness Class', 'Athletic Fundraiser', 'Spirit Day'
      ]
    };
    
    const events = eventsByCategory[category];
    const selectedEvent = events[Math.floor(Math.random() * events.length)];
    const monthName = monthNames[month - 1];
    
    return `${selectedEvent} (${monthName})`;
  }
  
  // Create abstract positions for visualization based on student data
  createAbstractPositions() {
    // Create clusters based on primary categories and styles
    const categoryBands = {
      academic: { centerY: 0.2, spreadY: 0.15 },
      professional: { centerY: 0.35, spreadY: 0.15 },
      social: { centerY: 0.5, spreadY: 0.15 },
      cultural: { centerY: 0.65, spreadY: 0.15 },
      athletic: { centerY: 0.8, spreadY: 0.15 }
    };
    
    // Clear the existing positions
    this.positions = new Map();
    
    // Generate positions for each student
    for (const student of this.students) {
      // Get the primary category band
      const band = categoryBands[student.primaryCategory];
      
      // Calculate base position with some randomness
      const baseX = 0.1 + (Math.random() * 0.8); // Spread across x-axis
      
      // Adjust y based on category but with some randomness
      const bandY = band.centerY + (Math.random() * band.spreadY - band.spreadY/2);
      
      // Adjust position slightly based on style
      let x = baseX;
      let y = bandY;
      
      // Add some clustering based on style
      switch (student.style) {
        case 'sampler':
          // Samplers are more scattered
          x += (Math.random() - 0.5) * 0.1;
          y += (Math.random() - 0.5) * 0.1;
          break;
        
        case 'specialist':
          // Specialists cluster more tightly in their category band
          y = band.centerY + (Math.random() * band.spreadY * 0.5 - band.spreadY * 0.25);
          break;
          
        case 'super-connector':
          // Super-connectors tend to bridge between categories
          y = band.centerY + (Math.random() * band.spreadY * 1.5 - band.spreadY * 0.75);
          break;
          
        case 'selective':
          // Selectives have small tight clusters
          x = 0.2 + Math.floor(Math.random() * 4) * 0.2 + (Math.random() - 0.5) * 0.05;
          break;
      }
      
      // Ensure positions stay within bounds
      x = Math.max(0.05, Math.min(0.95, x));
      y = Math.max(0.05, Math.min(0.95, y));
      
      // Store the position
      this.positions.set(student.id, { x, y, fixed: false });
    }
  }
  
  // Apply filters to the student data
  applyFilters(category = 'all', style = 'all', search = '') {
    this.currentFilters = { category, style, search };
    
    this.filteredStudents = this.students.filter(student => {
      // Category filter
      if (category !== 'all' && student.primaryCategory !== category) {
        return false;
      }
      
      // Style filter
      if (style !== 'all' && student.style !== style) {
        return false;
      }
      
      // Search filter
      if (search && !student.id.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      
      return true;
    });
    
    return this.filteredStudents;
  }
  
  // Get a student by ID
  getStudentById(id) {
    return this.students.find(student => student.id === id);
  }
  
  // Get student position (for visualization)
  getStudentPosition(id) {
    return this.positions.get(id) || { x: 0.5, y: 0.5, fixed: false };
  }
  
  // Generate connections between students based on shared interests
  generateConnections() {
    // Reset connections
    this.students.forEach(student => {
      student.connections = [];
    });
    
    // Create a map of events to students
    const eventMap = new Map();
    
    // Populate the map
    this.students.forEach(student => {
      student.events.forEach(event => {
        const eventKey = `${event.category}-${event.month}-${event.name}`;
        if (!eventMap.has(eventKey)) {
          eventMap.set(eventKey, []);
        }
        eventMap.get(eventKey).push(student.id);
      });
    });
    
    // Create connections based on shared events
    for (const [eventKey, studentIds] of eventMap.entries()) {
      // Only create connections if multiple students share the event
      if (studentIds.length > 1) {
        for (let i = 0; i < studentIds.length; i++) {
          for (let j = i + 1; j < studentIds.length; j++) {
            const studentA = this.getStudentById(studentIds[i]);
            const studentB = this.getStudentById(studentIds[j]);
            
            if (studentA && studentB) {
              // Add connection to both students
              studentA.connections.push({
                studentId: studentB.id,
                eventKey
              });
              
              studentB.connections.push({
                studentId: studentA.id,
                eventKey
              });
            }
          }
        }
      }
    }
    
    console.log("Generated student connections");
  }
}

// Create and export the data manager
const dataManager = new StudentDataManager();