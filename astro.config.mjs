import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  site: 'https://shiguang-zhaji.example.com',
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  integrations: [sitemap()],
});
