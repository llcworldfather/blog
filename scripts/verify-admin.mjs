import { readFileSync, writeFileSync } from 'node:fs';

const results = [];

// Check index.astro
const index = readFileSync('E:/blog/src/pages/admin/index.astro', 'utf8');
results.push('index.astro has post-card: ' + index.includes('post-card'));
results.push('index.astro has admin-table: ' + index.includes('admin-table'));

// Check new.astro
const newFile = readFileSync('E:/blog/src/pages/admin/new.astro', 'utf8');
results.push('new.astro has NEW POST label: ' + newFile.includes('NEW POST'));
results.push('new.astro has old style (border-radius 2px): ' + newFile.includes('border-radius: 2px'));

// Check edit/[id].astro
const edit = readFileSync('E:/blog/src/pages/admin/edit/[id].astro', 'utf8');
results.push('edit has EDIT POST label: ' + edit.includes('EDIT POST'));
results.push('edit has old style (border-radius 2px): ' + edit.includes('border-radius: 2px'));

writeFileSync('E:/blog/scripts/admin-verify.txt', results.join('\n'), 'utf8');