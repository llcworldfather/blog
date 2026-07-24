import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import edgeone from '@edgeone/astro';

// Vercel 构建会自动注入 VERCEL=1；腾讯云 EdgeOne 请设置 DEPLOY_TARGET=edgeone
const deployTarget =
  process.env.DEPLOY_TARGET ||
  (process.env.VERCEL ? 'vercel' : null) ||
  (process.env.EDGEONE || process.env.EDGEONE_PAGES ? 'edgeone' : null) ||
  'vercel';

const adapter = deployTarget === 'edgeone' ? edgeone() : vercel();

// https://astro.build/config
export default defineConfig({
  site: 'https://shiguang-zhaji.example.com',
  adapter,
  integrations: [sitemap()],
});
