import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const results = [];

// Check Hero.astro
const hero = readFileSync('E:/blog/src/components/Hero.astro', 'utf8');
if (hero.includes('getAllPosts')) {
  results.push('Hero.astro: FIXED (uses getAllPosts)');
} else if (hero.includes('getCollection')) {
  results.push('Hero.astro: NOT FIXED (still uses getCollection)');
} else {
  results.push('Hero.astro: UNKNOWN');
}

// Check firebase installed
const firebasePkg = 'E:/blog/node_modules/firebase/package.json';
if (existsSync(firebasePkg)) {
  const pkg = JSON.parse(readFileSync(firebasePkg, 'utf8'));
  results.push(`firebase: installed (${pkg.version})`);
} else {
  results.push('firebase: NOT INSTALLED');
}

// Check marked installed
const markedPkg = 'E:/blog/node_modules/marked/package.json';
if (existsSync(markedPkg)) {
  const pkg = JSON.parse(readFileSync(markedPkg, 'utf8'));
  results.push(`marked: installed (${pkg.version})`);
} else {
  results.push('marked: NOT INSTALLED');
}

// Check @astrojs/node installed
const nodePkg = 'E:/blog/node_modules/@astrojs/node/package.json';
if (existsSync(nodePkg)) {
  const pkg = JSON.parse(readFileSync(nodePkg, 'utf8'));
  results.push(`@astrojs/node: installed (${pkg.version})`);
} else {
  results.push('@astrojs/node: NOT INSTALLED');
}

writeFileSync('E:/blog/src/verify-result.txt', results.join('\n'), 'utf8');
