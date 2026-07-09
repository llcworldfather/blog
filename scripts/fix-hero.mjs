import { readFileSync, writeFileSync } from 'node:fs';

const lines = readFileSync('src/components/Hero.astro', 'utf8').split('\n');
lines[1] = "import { getAllPosts } from '../utils/posts';";
lines[3] = 'const posts = await getAllPosts();';
writeFileSync('src/components/Hero.astro', lines.join('\n'), 'utf8');

const out = readFileSync('src/components/Hero.astro', 'utf8');
console.log('===OUTPUT===');
console.log(out.substring(0, 200));
console.log('===END===');