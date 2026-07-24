import { spawnSync } from 'node:child_process';

const target = process.argv[2];
if (!target || !['vercel', 'edgeone'].includes(target)) {
  console.error('Usage: node scripts/build-with-target.mjs <vercel|edgeone>');
  process.exit(1);
}

process.env.DEPLOY_TARGET = target;
console.log(`[build] DEPLOY_TARGET=${target}`);

const result = spawnSync('npx', ['astro', 'build'], {
  stdio: 'inherit',
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
