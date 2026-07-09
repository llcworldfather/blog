// 种子脚本 — 将 src/content/posts/ 下的 Markdown 文章上传到 Firestore
// 用法：node scripts/seed-posts.mjs
import { readdir, readFile } from 'node:fs/promises';
import { join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, '..', 'src', 'content', 'posts');

const firebaseConfig = {
  apiKey: 'AIzaSyDbcza3N64-X6T4DhsKGTuGCvx3mmrxzeE',
  authDomain: 'blog-be5f3.firebaseapp.com',
  projectId: 'blog-be5f3',
  storageBucket: 'blog-be5f3.firebasestorage.app',
  messagingSenderId: '252389607357',
  appId: '1:252389607357:web:857fd1b3f59dabd25db4d4',
  measurementId: 'G-RP26Y1QPSP',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 简易 frontmatter 解析
function parseFrontmatter(raw) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const fmText = match[1];
  const content = match[2];
  const data = {};

  // 逐行解析简单的 YAML
  let currentKey = null;
  for (const line of fmText.split('\n')) {
    if (line.startsWith('  - ')) {
      // 数组项
      if (currentKey) {
        if (!Array.isArray(data[currentKey])) data[currentKey] = [];
        data[currentKey].push(line.slice(4).trim().replace(/^["']|["']$/g, ''));
      }
    } else if (line.includes(':')) {
      const idx = line.indexOf(':');
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      if (val === '') {
        currentKey = key;
        data[key] = [];
      } else {
        currentKey = null;
        data[key] = val.replace(/^["']|["']$/g, '');
      }
    }
  }

  return { data, content };
}

async function main() {
  console.log('📖 读取 Markdown 文章目录:', POSTS_DIR);
  const files = (await readdir(POSTS_DIR)).filter((f) => f.endsWith('.md'));
  console.log(`找到 ${files.length} 篇文章`);

  let created = 0;
  let skipped = 0;

  for (const file of files) {
    const raw = await readFile(join(POSTS_DIR, file), 'utf-8');
    const { data, content } = parseFrontmatter(raw);
    const slug = basename(file, extname(file));

    // 检查是否已存在
    const q = query(collection(db, 'posts'), where('slug', '==', slug));
    const existing = await getDocs(q);
    if (!existing.empty) {
      console.log(`⏭  跳过（已存在）: ${slug}`);
      skipped++;
      continue;
    }

    await addDoc(collection(db, 'posts'), {
      slug,
      title: data.title ?? slug,
      date: new Date(data.date),
      mood: data.mood ?? '晴',
      tags: data.tags ?? [],
      excerpt: data.excerpt ?? '',
      content: content.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log(`✅ 已上传: ${slug} — ${data.title}`);
    created++;
  }

  console.log(`\n完成！新增 ${created} 篇，跳过 ${skipped} 篇。`);
  process.exit(0);
}

main().catch((e) => {
  console.error('种子脚本失败:', e);
  process.exit(1);
});