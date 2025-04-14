# SMU Spirit Mosaic

An interactive visualization showing student engagement patterns at SMU, displaying each student as a tile in a mosaic that forms larger SMU-related imagery when viewed from a distance.

## Features

- **Interactive Mosaic**: Students are represented as tiles that collectively form an SMU mustang shape
- **Multiple View Modes**:
  - **Mosaic View**: Shows the overall pattern with colored tiles
  - **Network View**: Emphasizes connections between students with similar activities
  - **Evolution View**: Animates student engagement over time through the academic year
- **Color Coding**:
  - By primary engagement category (Academic, Social, Professional, Cultural, Athletic)
  - By engagement style (Sampler, Specialist, Super Connector, Selective)
  - By engagement intensity
- **Interactive Controls**:
  - Pan and zoom to explore the visualization
  - Filter students by category
  - Search for specific students
  - View detailed student profiles
- **Responsive Design**: Works on desktop and mobile devices

## Technical Overview

The visualization is built using vanilla JavaScript with HTML5 Canvas for rendering. The code is organized as follows:

- **index.html**: Main HTML structure and user interface
- **style.css**: Styling for the UI components
- **data.js**: Responsible for generating and managing student data
- **mosaic.js**: Core visualization logic for rendering the interactive mosaic
- **app.js**: Application initialization and UI control handlers

## Getting Started

1. Clone this repository
2. Open index.html in a web browser
   - No build process or server required!
   - All data is generated on page load

## Implementation Details

### Data Structure

- Students are represented with engagement styles, categories, and events
- Each student's position is determined in one of two ways:
  - Pattern students: Positioned to form the SMU mustang outline
  - Non-pattern students: Positioned around the pattern

### Visualization Techniques

- **Tiles**: Each student is represented as a tile with:
  - Color indicating primary category or style
  - Shape/pattern indicating engagement style
  - Size representing overall engagement level
- **Connections**: Lines between students who share similar events
- **Animation**: Time-based animation showing engagement evolution

### Interactivity

- Pan: Click and drag to move around the canvas
- Zoom: Mouse wheel or zoom buttons
- Selection: Click on a tile to view detailed student information
- Filtering: Use the controls to show specific subsets of data

## Browser Compatibility

- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- HTML5 Canvas support required

## Future Enhancements

- Save/export visualization as image
- Additional data analysis and metrics
- Improved performance for very large datasets
- More advanced animation options