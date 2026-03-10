const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const target = args.find(arg => arg.startsWith('--target='))?.split('=')[1] || 'chrome';

const srcDir = path.join(__dirname, 'src');
const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist', target);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function build() {
  console.log(`Building TypeSmart Extension for ${target}...`);
  
  // Clean and create dist directory
  ensureDir(distDir);
  
  // Remove existing files
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
  }
  ensureDir(distDir);
  
  // Copy and adjust manifest
  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));
  
  // Adjust manifest for Firefox if needed
  if (target === 'firefox') {
    manifest.manifest_version = 2;
    manifest.browser_action = manifest.action;
    delete manifest.action;
    manifest.background.scripts = [manifest.background.service_worker];
    delete manifest.background.service_worker;
    manifest.permissions.push('https://*/');
  }
  
  fs.writeFileSync(path.join(distDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  
  // Copy content scripts
  copyDir(path.join(srcDir, 'content'), distDir);
  
  // Copy background script
  copyFile(path.join(srcDir, 'background', 'background.js'), path.join(distDir, 'background.js'));
  
  // Copy popup and options
  copyDir(publicDir, distDir);
  
  // Create placeholder icons
  createPlaceholderIcons(distDir);
  
  console.log(`✓ Build complete: ${distDir}`);
  
  // List files
  console.log('\nFiles created:');
  listFiles(distDir, '');
}

function createPlaceholderIcons(distDir) {
  const iconsDir = path.join(distDir, 'icons');
  ensureDir(iconsDir);
  
  const sizes = [16, 32, 48, 128];
  
  for (const size of sizes) {
    // Create a simple SVG-based placeholder
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
  <rect width="24" height="24" rx="4" fill="#6366f1"/>
  <path d="M12 6l-6 3 6 3 6-3-6-3z" fill="white" opacity="0.9"/>
  <path d="M6 12l6 3 6-3" stroke="white" stroke-width="1.5" fill="none"/>
  <path d="M6 15l6 3 6-3" stroke="white" stroke-width="1.5" fill="none"/>
</svg>`;
    fs.writeFileSync(path.join(iconsDir, `icon${size}.svg`), svgContent);
  }
  
  // Create a note about PNG icons
  fs.writeFileSync(
    path.join(iconsDir, 'README.txt'),
    `Replace these SVG files with actual PNG icons for the Chrome Web Store.

Required sizes: 16x16, 32x32, 48x48, 128x128

You can convert the SVG files to PNG using:
- Adobe Illustrator
- Inkscape
- Online converters like convertio.co

Or use the provided SVG files directly in your manifest.json for development.`
  );
}

function listFiles(dir, prefix) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const isLast = i === entries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const nextPrefix = prefix + (isLast ? '    ' : '│   ');
    
    console.log(`${prefix}${connector}${entry.name}`);
    
    if (entry.isDirectory()) {
      listFiles(path.join(dir, entry.name), nextPrefix);
    }
  }
}

// Build
build();
