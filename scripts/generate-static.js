const fs = require('fs');
const path = require('path');

const ROUTES = [
  '/',
  '/ilan-pazari',
  '/alim-ilanlari',
  '/sss',
  '/hakkimizda',
  '/gizlilik-politikasi',
  '/kullanici-sozlesmesi',
  '/iade-politikasi',
  '/mesafeli-satis-sozlesmesi',
  '/legal/telif-ihlali',
  '/blog',
  '/login',
  '/register',
  '/destek-sistemi'
];

const DIST_DIR = path.join(__dirname, '..', 'dist');

// Read the main index.html
const mainIndex = fs.readFileSync(path.join(DIST_DIR, 'index.html'), 'utf8');

ROUTES.forEach(route => {
  const dirPath = route === '/' 
    ? DIST_DIR 
    : path.join(DIST_DIR, route);
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  
  const filePath = path.join(dirPath, 'index.html');
  fs.writeFileSync(filePath, mainIndex);
  console.log(`Generated: ${filePath}`);
});

console.log('Static files generated for all routes!');
