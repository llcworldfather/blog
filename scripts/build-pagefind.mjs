/**
 * 构建后为 Firestore 文章生成 Pagefind 索引。
 * 因文章页为 SSR，需先写出可索引 HTML，再跑 pagefind。
 * Firestore 不可达时跳过（搜索页会回退到 /api/search）。
 */
import { mkdirSync, writeFileSync, rmSync, existsSync, cpSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { marked } from 'marked';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const sourceDir = join(root, '.pagefind-source');

const firebaseConfig = {
  apiKey: 'AIzaSyDbcza3N64-X6T4DhsKGTuGCvx3mmrxzeE',
  authDomain: 'blog-be5f3.firebaseapp.com',
  projectId: 'blog-be5f3',
  storageBucket: 'blog-be5f3.firebasestorage.app',
  messagingSenderId: '252389607357',
  appId: '1:252389607357:web:857fd1b3f59dabd25db4d4',
};

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

async function main() {
  console.log('[pagefind] fetching published posts…');
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const db = getFirestore(app);

  let posts = [];
  try {
    const snap = await withTimeout(
      getDocs(query(collection(db, 'posts'), orderBy('date', 'desc'))),
      15000,
      'Firestore'
    );
    posts = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p) => p.status !== 'draft');
  } catch (e) {
    console.warn('[pagefind] skip indexing:', e.message || e);
    try { await deleteApp(app); } catch {}
    process.exit(0);
  }

  if (existsSync(sourceDir)) rmSync(sourceDir, { recursive: true, force: true });
  mkdirSync(sourceDir, { recursive: true });

  writeFileSync(
    join(sourceDir, 'index.html'),
    `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="utf-8"><title>拾光札记</title></head><body><h1>拾光札记</h1></body></html>`
  );

  for (const post of posts) {
    const dir = join(sourceDir, 'posts', post.slug);
    mkdirSync(dir, { recursive: true });
    const htmlBody = marked.parse(String(post.content ?? ''));
    const tags = (post.tags || []).join(', ');
    writeFileSync(
      join(dir, 'index.html'),
      `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(post.title)} — 拾光札记</title>
  <meta name="description" content="${escapeHtml(post.excerpt)}" />
</head>
<body>
  <article data-pagefind-body>
    <h1 data-pagefind-meta="title">${escapeHtml(post.title)}</h1>
    <p data-pagefind-meta="mood">${escapeHtml(post.mood)}</p>
    <p data-pagefind-meta="tags">${escapeHtml(tags)}</p>
    <p>${escapeHtml(post.excerpt)}</p>
    <div>${htmlBody}</div>
  </article>
  <a href="/posts/${escapeHtml(post.slug)}/">阅读原文</a>
</body>
</html>`
    );
  }

  console.log(`[pagefind] indexed ${posts.length} posts, running pagefind…`);

  const primaryOut = join(root, 'public', 'pagefind');
  if (existsSync(primaryOut)) rmSync(primaryOut, { recursive: true, force: true });

  const result = spawnSync(
    'npx',
    ['pagefind', '--site', sourceDir, '--output-path', primaryOut],
    { stdio: 'inherit', shell: true, cwd: root }
  );

  if (result.status !== 0) {
    console.warn('[pagefind] indexing failed (search API fallback still works)');
    try { await deleteApp(app); } catch {}
    process.exit(0);
  }

  const outCandidates = [
    join(root, 'dist', 'client', 'pagefind'),
    join(root, '.vercel', 'output', 'static', 'pagefind'),
    join(root, 'dist', 'pagefind'),
  ];

  for (const dest of outCandidates) {
    const parent = dirname(dest);
    if (!existsSync(parent)) continue;
    try {
      if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
      cpSync(primaryOut, dest, { recursive: true });
      console.log(`[pagefind] copied → ${dest}`);
    } catch (e) {
      console.warn(`[pagefind] skip copy to ${dest}:`, e.message);
    }
  }

  if (existsSync(sourceDir)) rmSync(sourceDir, { recursive: true, force: true });
  console.log('[pagefind] done');
  try { await deleteApp(app); } catch {}
  process.exit(0);
}

main().catch((e) => {
  console.warn('[pagefind] skipped:', e.message || e);
  process.exit(0);
});
