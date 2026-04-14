import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { Prerenderer } from 'vite-plugin-prerenderer';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      Prerenderer({
        routes: [
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
          '/tum-kategoriler',
          '/server-tanitimi',
          '/topluluk',
          '/firsatlar',
          '/yayincilar',
        ],
        renderer: '@vite-plugin-prerenderer/renderer-puppeteer',
      }),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: [
        {
          find: /^@\//,
          replacement: path.resolve(process.cwd(), 'src') + '/',
        },
      ],
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
