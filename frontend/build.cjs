const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

if (fs.existsSync('frontend')) {
  console.log('[BUILD] Detected project root. Building frontend...');
  execSync('npm --prefix frontend install && npm --prefix frontend run build', { stdio: 'inherit' });
} else {
  console.log('[BUILD] Detected frontend directory. Building...');
  execSync('npm install && npm run build', { stdio: 'inherit' });
  // Ensure frontend/dist exists as fallback for vercel.json
  if (fs.existsSync('dist')) {
    fs.mkdirSync('frontend', { recursive: true });
    fs.cpSync('dist', path.join('frontend', 'dist'), { recursive: true });
  }
}
