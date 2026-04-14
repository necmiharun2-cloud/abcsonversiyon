#!/usr/bin/env node
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTES = [
  '/',
  '/ilan-pazari',
  '/alim-ilanlari',
  '/magazalar',
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
  '/destek-sistemi',
  '/roblox',
  '/cd-key',
  '/hediye-kartlari',
  '/cekilisler',
  '/tum-kategoriler'
];

const DIST_DIR = path.join(__dirname, '..', 'dist');

function startServer() {
  return new Promise((resolve, reject) => {
    console.log('Starting preview server...');
    const server = spawn('npx', ['serve', 'dist', '-s', '-l', '4173'], {
      stdio: 'pipe',
      shell: true
    });
    
    server.stdout.on('data', (data) => {
      if (data.toString().includes('Accepting connections')) {
        console.log('Server ready!');
        resolve(server);
      }
    });
    
    server.stderr.on('data', (data) => {
      // Ignore stderr
    });
    
    setTimeout(() => resolve(server), 3000);
  });
}

async function prerender() {
  console.log('Starting prerender...');
  
  const server = await startServer();
  await new Promise(r => setTimeout(r, 2000));
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();
      const url = `http://localhost:4173${route}`;
      
      console.log(`Prerendering: ${route}`);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.waitForTimeout(2000);
      
      const html = await page.content();
      
      // Write to file
      const filePath = route === '/' 
        ? path.join(DIST_DIR, 'index.html')
        : path.join(DIST_DIR, route, 'index.html');
      
      // Create directory if needed
      if (route !== '/') {
        fs.mkdirSync(path.join(DIST_DIR, route), { recursive: true });
      }
      
      fs.writeFileSync(filePath, html);
      console.log(`✓ Saved: ${filePath}`);
      
      await page.close();
    } catch (error) {
      console.error(`✗ Failed: ${route} - ${error.message}`);
    }
  }
  
  await browser.close();
  server.kill();
  console.log('Prerender complete!');
}

prerender().catch(console.error);
