const fs = require('fs');
const path = require('path');

const colorMap = {
  '#2b2d3e': '#111218',
  '#383b50': '#1a1b23',
  '#454963': '#23242f',
  '#5b61ff': '#8b5cf6',
  '#4a50e0': '#7c3aed',
  '#232736': '#1a1b23',
  '#1a1d27': '#111218',
  '#2b3142': '#23242f',
  '#32394d': '#2d2e3b'
};

function replaceColors(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceColors(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;
      for (const [oldColor, newColor] of Object.entries(colorMap)) {
        if (content.includes(oldColor)) {
          content = content.split(oldColor).join(newColor);
          modified = true;
        }
      }
      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

replaceColors(path.join(__dirname, 'src'));
