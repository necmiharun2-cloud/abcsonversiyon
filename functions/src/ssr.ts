import { onRequest } from 'firebase-functions/v2/https';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

// SEO-critical routes that need prerendering
const SEO_ROUTES = [
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
  '/destek-sistemi',
  '/roblox',
  '/cd-key',
  '/hediye-kartlari',
  '/cekilisler',
  '/magazalar',
  '/tum-kategoriler'
];

export const ssr = onRequest(
  { memory: '1GiB', timeoutSeconds: 30, region: 'europe-west1' },
  async (req, res) => {
    const path = req.path || '/';
    
    // Check if this route needs SSR
    const needsSSR = SEO_ROUTES.some(route => 
      path === route || path.startsWith(route + '/') ||
      path.startsWith('/blog/') ||
      path.startsWith('/ilan/')
    );
    
    if (!needsSSR) {
      // Return SPA fallback for non-SEO routes
      res.redirect(302, `https://sosyal-490917.web.app${path}`);
      return;
    }
    
    try {
      const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      });
      
      const page = await browser.newPage();
      const url = `https://sosyal-490917.web.app${path}`;
      
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
      await page.waitForTimeout(1500);
      
      const html = await page.content();
      await browser.close();
      
      // Set cache headers
      res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
      res.set('Content-Type', 'text/html; charset=utf-8');
      
      // Remove noscript redirect and add crawled content indicators
      const modifiedHtml = html
        .replace(/<noscript>.*?<\/noscript>/s, '')
        .replace('</body>', '<!-- SSR rendered by Firebase Function --></body>');
      
      res.status(200).send(modifiedHtml);
    } catch (error) {
      console.error('SSR error:', error);
      // Fallback to SPA
      res.redirect(302, `https://sosyal-490917.web.app${path}`);
    }
  }
);

// Simple bot detection helper
function isBot(userAgent: string): boolean {
  const botPatterns = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'facebookexternalhit', 'twitterbot', 'linkedinbot',
    'whatsapp', 'slackbot', 'applebot'
  ];
  return botPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern)
  );
}

// Alternative: Bot-only SSR
export const botSsr = onRequest(
  { memory: '1GiB', timeoutSeconds: 30, region: 'europe-west1' },
  async (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const path = req.path || '/';
    
    if (!isBot(userAgent)) {
      res.redirect(302, `https://sosyal-490917.web.app${path}`);
      return;
    }
    
    try {
      const browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
      });
      
      const page = await browser.newPage();
      const url = `https://sosyal-490917.web.app${path}`;
      
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 20000 });
      await page.waitForTimeout(1500);
      
      const html = await page.content();
      await browser.close();
      
      res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
      res.status(200).send(html);
    } catch (error) {
      console.error('Bot SSR error:', error);
      res.redirect(302, `https://sosyal-490917.web.app${path}`);
    }
  }
);
