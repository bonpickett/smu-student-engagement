/**
 * data.js - Data management for SMU Spirit Mosaic
 * Generates and manages student engagement data
 */

// Constants for data generation
const CATEGORIES = ['academic', 'social', 'professional', 'cultural', 'athletic'];
const STYLES = ['sampler', 'specialist', 'super-connector', 'selective'];
const MONTHS = 8; // 8 months in a school year
const TOTAL_STUDENTS = 400; // Number of students to generate
const SPECIAL_PATTERN_STUDENTS = 100; // Students that will form the pattern

// Color mapping (for visualization)
const CATEGORY_COLORS = {
  academic: [53, 76, 161],       // SMU blue
  social: [249, 200, 14],        // SMU yellow
  professional: [89, 195, 195],  // SMU teal
  cultural: [180, 100, 180],     // Purple
  athletic: [204, 0, 53]         // SMU red
};

const STYLE_PATTERNS = {
  sampler: { pattern: 'dotted', textureScale: 0.8 },
  specialist: { pattern: 'solid', textureScale: 0.2 },
  'super-connector': { pattern: 'cross', textureScale: 0.5 },
  selective: { pattern: 'dashed', textureScale: 0.4 }
};

// SMU Pattern coordinates - approximation of mustang shape
const SMU_PATTERN = [
  // Body core
  [0.4, 0.4], [0.45, 0.4], [0.5, 0.4], [0.55, 0.4], [0.6, 0.4],
  [0.4, 0.45], [0.45, 0.45], [0.5, 0.45], [0.55, 0.45], [0.6, 0.45],
  [0.4, 0.5], [0.45, 0.5], [0.5, 0.5], [0.55, 0.5], [0.6, 0.5],
  
  // Head (right side)
  [0.65, 0.35], [0.7, 0.3], [0.75, 0.28], [0.8, 0.3], [0.7, 0.35], [0.7, 0.4],
  
  // Tail (left side)
  [0.35, 0.35], [0.3, 0.3], [0.25, 0.25], [0.2, 0.3], [0.3, 0.4],
  
  // Legs
  [0.4, 0.55], [0.4, 0.6], [0.4, 0.65],  // Back left leg
  [0.5, 0.55], [0.5, 0.6], [0.5, 0.65],  // Back right leg
  [0.6, 0.55], [0.6, 0.6], [0.6, 0.65]   // Front leg
];

// Class to manage student data
class StudentDataManager {
  constructor() {
    this.students = [];
    this.patternAssignments = new Map();
    this.filteredStudents = [];
    this.currentFilters = {
      category: 'all',
      style: 'all',
      search: ''
    };
  }
  
  // Generate student data
  generateData() {
    console.log("Generating student data...");
    this.students = [];
    
    // Generate special pattern students first (for SMU logo/mascot)
    for (let i = 0; i < SPECIAL_PATTERN_STUDENTS && i < SMU_PATTERN.length; i++) {
      const patternPos = SMU_PATTERN[i];
      const id = `SMU2025${String(i+1).padStart(3, '0')}`;
      const style = STYLES[Math.floor(Math.random() * STYLES.length)];
      
      // For pattern students, we'll bias towards SMU blue (academic)
      // and red (athletic) to create the school colors in the pattern
      let primaryCategory;
      if (i % 3 === 0) {
        primaryCategory = 'athletic'; // SMU red
      } else {
        primaryCategory = 'academic'; // SMU blue
      }
      
      const student = this.createStudent(id, style, primaryCategory);
      
      // Store pattern position
      this.patternAssignments.set(id, {
        x: patternPos[0],
        y: patternPos[1],
        fixed: true // These positions are fixed for the pattern
      });
      
      this.students.push(student);
    }
    
    // Generate remaining random students
    for (let i = SPECIAL_PATTERN_STUDENTS; i < TOTAL_STUDENTS; i++) {
      const id = `SMU2025${String(i+1).padStart(3, '0')}`;
      const style = STYLES[Math.floor(Math.random() * STYLES.length)];
      const student = this.createStudent(id, style);
      
      // Random position for non-pattern students
      this.patternAssignments.set(id, {
        x: 0.1 + Math.random() * 0.8, // Keep away from edges
        y: 0.1 + Math.random() * 0.8,
        fixed: false
      });
      
      this.students.push(student);
    }
    
    console.log(`Generated ${this.students.length} students`);
    this.applyFilters(); // Initialize filtered students
    return this.students;
  }
  
  // Create a single student with realistic engagement patterns
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
      // Determine month (1-8)
      const month = 1 + Math.floor(Math.random() * MONTHS);
      
      // Determine category based on student style
      let category;
      
      switch (style) {
        case 'specialist':
          // Specialists focus heavily on one category
          category = (Math.random() < 0.8) ? primaryCategory 
                   : CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
          break;
          
        case 'sampler':
          // Samplers try different categories
          // Avoid repeating the same category consecutively
          const previousCategory = events.length > 0 ? events[events.length-1].category : null;
          do {
            category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
          } while (category === previousCategory && CATEGORIES.length > 1);
          break;
          
        case 'super-connector':
          // Ensure super-connectors have at least one of each category if possible
          const missingCategories = CATEGORIES.filter(cat => categoryDistribution[cat] === 0);
          if (missingCategories.length > 0 && i < CATEGORIES.length) {
            category = missingCategories[0];
          } else {
            category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
          }
          break;
          
        case 'selective':
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
  
  // Generate a realistic event name
  generateEventName(category, month) {
    const monthNames = [
      'January', 'February', 'March', 'April', 
      'May', 'June', 'July', 'August'
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
    return this.patternAssignments.get(id) || { x: 0.5, y: 0.5, fixed: false };
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