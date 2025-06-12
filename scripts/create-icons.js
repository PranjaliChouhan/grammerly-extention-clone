const fs = require('fs');
const { createCanvas } = require('canvas');

const sizes = [16, 48, 128];

function createIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Draw green circle
  ctx.beginPath();
  ctx.arc(size/2, size/2, size/2 - 1, 0, Math.PI * 2);
  ctx.fillStyle = '#15C39A';
  ctx.fill();

  // Draw white 'G'
  ctx.fillStyle = 'white';
  ctx.font = `bold ${size * 0.6}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('G', size/2, size/2);

  return canvas.toBuffer('image/png');
}

// Create icons directory if it doesn't exist
if (!fs.existsSync('./public/icons')) {
  fs.mkdirSync('./public/icons', { recursive: true });
}

// Generate icons for each size
sizes.forEach(size => {
  const iconBuffer = createIcon(size);
  fs.writeFileSync(`./public/icons/icon${size}.png`, iconBuffer);
  console.log(`Generated ${size}x${size} icon`);
}); 