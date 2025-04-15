/**
 * data.js - Data management for SMU Spirit Mosaic
 * Processes the real event attendance data from CSV
 */

// Constants for data management and mapping
// Define in the same order as they should appear in the visualization
const CATEGORIES = [
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

const STYLES = ['sampler', 'specialist', 'super-connector', 'selective'];
const MONTHS = 12; // 12 months in a year

// Color mapping (for visualization)
const CATEGORY_COLORS = {
  'Academic/Educational/Learning': [53, 76, 161],       // SMU blue
  'Social': [249, 200, 14],                            // SMU yellow
  'Meeting/Group Business': [89, 195, 195],            // SMU teal
  'Cultural': [180, 100, 180],                         // Purple
  'Athletic/Sport': [204, 0, 53],                      // SMU red
  'Career/Professional': [0, 150, 136],                // Teal variant
  'Service/Volunteer': [76, 175, 80],                  // Green
  'Entertainment': [255, 152, 0],                      // Orange
  'Other': [128, 128, 128]                             // Gray
};

const STYLE_PATTERNS = {
  sampler: { pattern: 'dotted', textureScale: 0.8 },
  specialist: { pattern: 'solid', textureScale: 0.2 },
  'super-connector': { pattern: 'cross', textureScale: 0.5 },
  selective: { pattern: 'dashed', textureScale: 0.4 }
};

// Event type normalization mapping
const EVENT_TYPE_MAPPING = {
  // Map from CSV event types to our category system
  'Academic/Educational/Learning': 'Academic/Educational/Learning',
  'Social': 'Social',
  'Meeting/Group Business': 'Meeting/Group Business',
  'Cultural': 'Cultural',
  'Athletic': 'Athletic/Sport',
  'Sport': 'Athletic/Sport',
  'Career': 'Career/Professional',
  'Professional': 'Career/Professional',
  'Career Development': 'Career/Professional',
  'Service': 'Service/Volunteer',
  'Volunteer': 'Service/Volunteer',
  'Community Service': 'Service/Volunteer',
  'Entertainment': 'Entertainment',
  'Performance': 'Entertainment',
  'Arts': 'Cultural',
  'Diversity': 'Cultural',
  'Leadership': 'Meeting/Group Business',
  'Wellness': 'Social',
  'Lecture': 'Academic/Educational/Learning',
  'Workshop': 'Academic/Educational/Learning',
  'Club Meeting': 'Meeting/Group Business',
  // Default category
  'Other': 'Other'
};

// Tags to category mapping for refinement
const TAG_MAPPING = {
  'academic': 'Academic/Educational/Learning',
  'research': 'Academic/Educational/Learning',
  'lecture': 'Academic/Educational/Learning',
  'study': 'Academic/Educational/Learning',
  'career': 'Career/Professional',
  'networking': 'Career/Professional',
  'leadership': 'Meeting/Group Business',
  'social': 'Social',
  'club': 'Meeting/Group Business',
  'service': 'Service/Volunteer',
  'volunteer': 'Service/Volunteer',
  'culture': 'Cultural',
  'international': 'Cultural',
  'arts': 'Cultural',
  'diversity': 'Cultural',
  'athletic': 'Athletic/Sport',
  'sports': 'Athletic/Sport',
  'fitness': 'Athletic/Sport',
  'entertainment': 'Entertainment'
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
  
  // Process the CSV data using fetch API instead of window.fs
  async processCSVData(callback) {
    console.log("Processing event attendance data...");
    
    try {
      // Load the CSV data using fetch
      const response = await fetch('2025_eventattendance_4.7.25.csv');
      if (!response.ok) {
        throw new Error(`Failed to load CSV: ${response.status} ${response.statusText}`);
      }
      
      const csvText = await response.text();
      console.log("CSV data loaded successfully");
      
      // Parse the CSV
      const parseResult = Papa.parse(csvText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';']
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
      console.log("Falling back to generated data...");
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
    // Normalize event type to handle case variations
    const normalizedType = eventType.trim();
    
    // First try direct mapping
    if (EVENT_TYPE_MAPPING[normalizedType]) {
      return EVENT_TYPE_MAPPING[normalizedType];
    }
    
    // Try partial match for event type
    for (const [key, value] of Object.entries(EVENT_TYPE_MAPPING)) {
      if (normalizedType.includes(key)) {
        return value;
      }
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
    
    // Default to Other as a fallback
    return 'Other';
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
    let primaryCategory = CATEGORIES[0]; // Default to first category
    
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
      'Academic/Educational/Learning': [
        'Research Symposium', 'Study Group', 'Department Lecture', 
        'Academic Conference', 'Thesis Workshop', 'Library Workshop',
        'Exam Prep Session', 'Faculty Mixer', 'Honors Presentation'
      ],
      'Social': [
        'Campus Club Fair', 'Residence Hall Social', 'Student Government',
        'Campus Event Planning', 'Spring Festival', 'Student Mixer', 
        'Campus Tour Guide', 'Social Club Meeting'
      ],
      'Meeting/Group Business': [
        'Committee Meeting', 'Board Meeting', 'Leadership Summit',
        'Planning Session', 'Project Update', 'Club Business Meeting',
        'Organization Direction Meeting', 'Executive Board Meeting'
      ],
      'Career/Professional': [
        'Career Workshop', 'Industry Panel', 'Networking Event',
        'Mock Interviews', 'Career Fair', 'Business Case Competition',
        'Alumni Networking', 'Internship Seminar'
      ],
      'Cultural': [
        'International Festival', 'Arts Exhibition', 'Theater Production',
        'Music Ensemble', 'Concert Performance', 'Cultural Celebration',
        'Diversity Workshop', 'Film Screening', 'Museum Visit'
      ],
      'Athletic/Sport': [
        'Intramural Sports', 'Varsity Game', 'Team Training',
        'Championship Game', 'Rally Event', 'Sports Club',
        'Fitness Class', 'Athletic Fundraiser', 'Spirit Day'
      ],
      'Service/Volunteer': [
        'Community Service', 'Volunteer Day', 'Food Drive',
        'Charity Fundraiser', 'Habitat for Humanity', 'Campus Cleanup',
        'Mentoring Program', 'Outreach Event'
      ],
      'Entertainment': [
        'Comedy Show', 'Movie Night', 'Campus Concert',
        'Talent Show', 'Game Night', 'DJ Event',
        'Dance Party', 'Open Mic Night'
      ],
      'Other': [
        'Campus Event', 'Special Event', 'Info Session',
        'Resource Fair', 'Miscellaneous Meeting', 'Pop-up Event',
        'Campus Walk', 'Vendor Fair'
      ]
    };
    
    // If category doesn't exist in our mapping, use Other
    const events = eventsByCategory[category] || eventsByCategory['Other'];
    const selectedEvent = events[Math.floor(Math.random() * events.length)];
    const monthName = monthNames[month - 1];
    
    return `${selectedEvent} (${monthName})`;
  }
  
  // Create abstract positions for visualization based on student data
  createAbstractPositions() {
    // Define the specific order of categories to match the bands
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
    
    // Assign vertical positioning based on primary categories
    const categoryPositions = {};
    const totalCategories = orderedCategories.length;
    const bandHeight = 1.0 / totalCategories;
    
    // Create mapping of category to position
    orderedCategories.forEach((category, index) => {
      categoryPositions[category] = {
        centerY: (index + 0.5) * bandHeight,
        spreadY: bandHeight * 0.7  // Reduce vertical spread slightly
      };
    });
    
    // Count students per category for better distribution
    const categoryStudentCounts = {};
    orderedCategories.forEach(category => {
      categoryStudentCounts[category] = 0;
    });
    
    // Count students in each category
    this.students.forEach(student => {
      if (categoryStudentCounts[student.primaryCategory] !== undefined) {
        categoryStudentCounts[student.primaryCategory]++;
      }
    });
    
    // Clear the existing positions
    this.positions = new Map();
    
    // Track used positions to avoid overlap
    const usedPositions = new Map();
    const minDistance = 0.03; // Minimum distance between students
    
    // Generate positions for each student
    for (const student of this.students) {
      // Get the primary category band
      const band = categoryPositions[student.primaryCategory] || 
                 { centerY: 0.5, spreadY: 0.2 }; // Default if category not found
      
      // Get count of students in this category
      const categoryCount = categoryStudentCounts[student.primaryCategory] || 1;
      
      // Determine spread factor based on number of students in category
      // More students = more spread out horizontally
      const spreadFactor = Math.min(0.9, Math.max(0.6, 
                         0.6 + (categoryCount / this.students.length)));
      
      // Try to find a non-overlapping position
      let positionFound = false;
      let attempts = 0;
      let x, y;
      
      while (!positionFound && attempts < 10) {
        // Calculate base position with better spread
        x = 0.05 + (Math.random() * spreadFactor); // Spread across x-axis
        
        // Adjust y based on category with controlled randomness
        y = band.centerY + (Math.random() * band.spreadY - band.spreadY/2);
        
        // Adjust position slightly based on style with less variation
        switch (student.style) {
          case 'sampler':
            // Samplers are slightly scattered
            x += (Math.random() - 0.5) * 0.05; // Reduced scatter
            y += (Math.random() - 0.5) * 0.05;
            break;
          
          case 'specialist':
            // Specialists cluster more tightly in their category band
            y = band.centerY + (Math.random() * band.spreadY * 0.5 - band.spreadY * 0.25);
            break;
            
          case 'super-connector':
            // Super-connectors tend to bridge between categories but less extreme
            y = band.centerY + (Math.random() * band.spreadY - band.spreadY/2);
            break;
            
          case 'selective':
            // Selectives have less tight clusters
            x = 0.1 + Math.floor(Math.random() * 8) * 0.1 + (Math.random() - 0.5) * 0.02;
            break;
        }
        
        // Ensure positions stay within bounds
        x = Math.max(0.05, Math.min(0.95, x));
        y = Math.max(0.05, Math.min(0.95, y));
        
        // Check if position is too close to existing positions
        positionFound = true;
        for (const [existingId, existingPos] of usedPositions.entries()) {
          const distance = Math.sqrt(
            Math.pow(existingPos.x - x, 2) + 
            Math.pow(existingPos.y - y, 2)
          );
          
          if (distance < minDistance) {
            positionFound = false;
            break;
          }
        }
        
        attempts++;
      }
      
      // Store the position
      this.positions.set(student.id, { x, y, fixed: false });
      usedPositions.set(student.id, { x, y });
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