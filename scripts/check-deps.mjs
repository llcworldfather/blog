import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const result = [];

const firebasePath = 'E:/blog/node_modules/firebase/package.json';
if (existsSync(firebasePath)) {
  const pkg = JSON.parse(readFileSync(firebasePath, 'utf8'));
  result.push(`firebase: ${pkg.version}`);
} else {
  result.push('firebase: NOT INSTALLED');
}

const markedPath = 'E:/blog/node_modules/marked/package.json';
if (existsSync(markedPath)) {
  const pkg = JSON.parse(readFileSync(markedPath, 'utf8'));
  result.push(`marked: ${pkg.version}`);
} else {
  result.push('marked: NOT INSTALLED');
}

const nodePath = 'E:/blog/node_modules/@astrojs/node/package.json';
if (existsSync(nodePath)) {
  const pkg = JSON.parse(readFileSync(nodePath, 'utf8'));
  result.push(`@astrojs/node: ${pkg.version}`);
} else {
  result.push('@astrojs/node: NOT INSTALLED');
}

writeFileSync('E:/blog/scripts/deps-result.txt', result.join('\n'), 'utf8');