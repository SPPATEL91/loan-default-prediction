const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

if (fs.existsSync('frontend')) {
  console.log('[BUILD] Detected project root. Building frontend...');
  execSync('npm --prefix frontend install && npm --prefix frontend run build', { stdio: 'inherit' });
} else if (fs.existsSync(path.join('..', 'frontend'))) {
  console.log('[BUILD] Running from subdirectory. Building ../frontend...');
  execSync('npm --prefix ../frontend install && npm --prefix ../frontend run build', { stdio: 'inherit' });
  const srcDist = path.join('..', 'frontend', 'dist');
  if (fs.existsSync(srcDist)) {
    fs.mkdirSync('dist', { recursive: true });
    fs.cpSync(srcDist, 'dist', { recursive: true });
    fs.mkdirSync(path.join('frontend', 'dist'), { recursive: true });
    fs.cpSync(srcDist, path.join('frontend', 'dist'), { recursive: true });
  }
} else {
  console.log('[BUILD] Detected frontend directory. Building...');
  execSync('npm install && npm run build', { stdio: 'inherit' });
  if (fs.existsSync('dist')) {
    fs.mkdirSync(path.join('frontend', 'dist'), { recursive: true });
    fs.cpSync('dist', path.join('frontend', 'dist'), { recursive: true });
  }
}
