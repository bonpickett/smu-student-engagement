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
  
  // Setup and initialization
  document.addEventListener('DOMContentLoaded', function() {
    const viz = new p5(initSketchViz, 'visualization-canvas');
    
    // Handle window resize
    window.addEventListener('resize', function() {
      const container = document.getElementById('visualization-canvas');
      if (viz) {
        viz.resizeCanvas(container.offsetWidth, container.offsetHeight);
      }
    });
  });