// Test file to verify scratch functionality
// This file can be used to test the scratch canvas independently

export const testScratchCanvas = () => {
  console.log('Testing scratch canvas functionality...');
  
  // Test canvas creation
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    console.error('Canvas context not supported');
    return false;
  }
  
  // Test drawing operations
  canvas.width = 200;
  canvas.height = 200;
  
  // Fill with gradient
  const gradient = ctx.createLinearGradient(0, 0, 200, 200);
  gradient.addColorStop(0, '#d4af37');
  gradient.addColorStop(1, '#f4e4bc');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 200, 200);
  
  // Test scratch effect
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.arc(100, 100, 30, 0, Math.PI * 2);
  ctx.fill();
  
  // Test progress calculation
  const imageData = ctx.getImageData(0, 0, 200, 200);
  const pixels = imageData.data;
  let transparent = 0;
  let total = 0;
  
  for (let i = 3; i < pixels.length; i += 4) {
    total++;
    if (pixels[i] < 128) transparent++;
  }
  
  const progress = (transparent / total) * 100;
  console.log(`Scratch progress: ${progress.toFixed(2)}%`);
  
  return progress > 0;
};

export default testScratchCanvas;
