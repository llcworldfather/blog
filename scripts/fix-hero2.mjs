import { readFileSync, writeFileSync } from 'node:fs';

const p = 'E:/blog/src/components/Hero.astro';
const c = readFileSync(p, 'utf8');
const n = c
  .replace("import { getCollection } from 'astro:content';", "import { getAllPosts } from '../utils/posts';")
  .replace("const posts = await getCollection('posts');", "const posts = await getAllPosts();");
writeFileSync(p, n);
console.log('written, new content first 100 chars:');
console.log(n.substring(0, 100));