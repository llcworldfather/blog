import { readFileSync, writeFileSync } from 'node:fs';

const c = readFileSync('E:/blog/src/components/Hero.astro', 'utf8');
const lines = c.split('\n');
writeFileSync('E:/blog/scripts/hero-check.txt', `Line 2: ${lines[1]}\nLine 4: ${lines[3]}\n`, 'utf8');