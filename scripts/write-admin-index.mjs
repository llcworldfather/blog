import { writeFileSync } from 'node:fs';

const content = `---
import BaseLayout from '../../layouts/BaseLayout.astro';

export const prerender = false;
---

<BaseLayout title="管理后台" description="文章管理">
  <section class="admin-page">
    <div class="wrap">
      <div class="admin-header">
        <div class="admin-title-group">
          <span class="admin-label">MANAGE</span>
          <h1>文章管理</h1>
        </div>
        <a href="/admin/new" class="btn-new">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>
          写新文章
        </a>
      </div>

      <div id="admin-list">
        <div class="admin-loading">
          <div class="loading-dot"></div>
          <span>加载中…</span>
        </div>
      </div>
    </div>
  </section>

  <script>
    const list = document.getElementById('admin-list') as HTMLElement;

    async function loadPosts() {
      try {
        const res = await fetch('/api/posts');
        const posts = await res.json();
        renderPosts(posts);
      } catch (e) {
        list.innerHTML = '<div class="admin-empty"><p>加载失败，请先运行 npm run seed 上传文章</p></div>';
      }
    }

    function renderPosts(posts: any[]) {
      if (!posts || posts.length === 0) {
        list.innerHTML = '<div class="admin-empty"><p>还没有文章</p><a href="/admin/new" class="btn-new-sm">写第一篇</a></div>';
        return;
      }

      list.innerHTML = '<div class="post-cards">' + posts.map((p, i) => 
        '<article class="post-card" style="animation-delay:' + (i * 0.05) + 's">' +
          '<div class="card-main">' +
            '<div class="card-meta">' +
              '<span class="card-date">' + new Date(p.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) + '</span>' +
              '<span class="card-mood">' + p.mood + '</span>' +
            '</div>' +
            '<h3 class="card-title"><a href="/posts/' + p.slug + '" target="_blank">' + p.title + '</a></h3>' +
            '<p class="card-excerpt">' + (p.excerpt || '').substring(0, 80) + (p.excerpt && p.excerpt.length > 80 ? '…' : '') + '</p>' +
            '<div class="card-tags">' + (p.tags || []).map((t) => '<span class="card-tag">' + t + '</span>').join('') + '</div>' +
          '</div>' +
          '<div class="card-actions">' +
            '<a href="/posts/' + p.slug + '" target="_blank" class="card-btn card-btn-view" title="查看">👁</a>' +
            '<a href="/admin/edit/' + p.id + '" class="card-btn card-btn-edit" title="编辑">✎</a>' +
            '<button class="card-btn card-btn-del" data-id="' + p.id + '" data-title="' + p.title + '" title="删除">✕</button>' +
          '</div>' +
        '</article>'
      ).join('') + '</div>';

      list.querySelectorAll('.card-btn-del').forEach((btn) => {
        btn.addEventListener('click', async (e) => {
          const target = e.currentTarget as HTMLButtonElement;
          const id = target.dataset.id;
          const title = target.dataset.title;
          if (!confirm('确定删除「' + title + '」吗？\\n此操作不可撤销。')) return;
          target.closest('.post-card')?.classList.add('deleting');
          try {
            const res = await fetch('/api/posts/' + id, { method: 'DELETE' });
            if (res.ok) { loadPosts(); } else { alert('删除失败'); target.closest('.post-card')?.classList.remove('deleting'); }
          } catch { alert('删除失败'); target.closest('.post-card')?.classList.remove('deleting'); }
        });
      });
    }

    loadPosts();
  </script>
</BaseLayout>

<style>
  .admin-page { padding: 72px 0 96px; }
  .admin-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 48px; padding-bottom: 28px; border-bottom: 1px solid var(--line); }
  .admin-title-group { display: flex; flex-direction: column; gap: 6px; }
  .admin-label { font-family: 'JetBrains Mono', monospace; font-size: 11px; letter-spacing: 0.2em; color: var(--ink-faint); text-transform: uppercase; }
  .admin-header h1 { font-size: 36px; font-weight: 900; margin: 0; letter-spacing: 0.02em; }
  .btn-new { display: inline-flex; align-items: center; gap: 8px; font-family: 'JetBrains Mono', monospace; font-size: 13px; padding: 11px 22px; background: var(--ink); color: var(--paper); border-radius: 3px; transition: all 0.25s ease; box-shadow: var(--shadow); }
  .btn-new:hover { background: var(--accent); transform: translateY(-1px); }
  .btn-new-sm { display: inline-block; font-family: 'JetBrains Mono', monospace; font-size: 13px; padding: 8px 18px; background: var(--ink); color: var(--paper); border-radius: 3px; margin-top: 16px; transition: background 0.2s ease; }
  .btn-new-sm:hover { background: var(--accent); }
  .admin-loading { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 80px 0; color: var(--ink-faint); font-size: 14px; }
  .loading-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: pulse 1.2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
  .admin-empty { text-align: center; padding: 80px 0; color: var(--ink-faint); }
  .admin-empty p { font-size: 15px; margin: 0 0 8px; }
  .post-cards { display: flex; flex-direction: column; gap: 16px; }
  .post-card { display: flex; background: var(--paper-alt); border: 1px solid var(--line); border-radius: 4px; overflow: hidden; transition: all 0.25s ease; opacity: 0; transform: translateY(10px); animation: cardIn 0.4s ease forwards; }
  @keyframes cardIn { to { opacity: 1; transform: translateY(0); } }
  .post-card:hover { border-color: var(--accent-soft); box-shadow: 0 4px 12px rgba(43,38,32,0.06); }
  .post-card.deleting { opacity: 0.4; transform: scale(0.98); }
  .card-main { flex: 1; padding: 20px 24px; }
  .card-meta { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .card-date { font-family: 'EB Garamond', serif; font-style: italic; font-size: 14px; color: var(--ink-faint); }
  .card-mood { font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 2px 8px; border: 1px solid var(--line); border-radius: 20px; color: var(--accent); background: rgba(91,75,138,0.05); }
  .card-title { font-size: 18px; font-weight: 600; margin: 0 0 8px; line-height: 1.4; }
  .card-title a:hover { color: var(--accent); }
  .card-excerpt { font-size: 14px; color: var(--ink-soft); margin: 0 0 12px; line-height: 1.5; }
  .card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .card-tag { font-family: 'JetBrains Mono', monospace; font-size: 11px; padding: 2px 8px; border: 1px solid var(--line); border-radius: 20px; color: var(--moss); background: rgba(124,138,82,0.06); }
  .card-actions { display: flex; flex-direction: column; gap: 1px; background: var(--line); border-left: 1px solid var(--line); }
  .card-btn { display: flex; align-items: center; justify-content: center; width: 48px; flex: 1; background: var(--paper-alt); color: var(--ink-soft); transition: all 0.2s ease; cursor: pointer; border: none; font-size: 16px; }
  .card-btn:hover { background: var(--paper-deep); }
  .card-btn-view:hover { color: var(--accent); }
  .card-btn-edit:hover { color: var(--moss); }
  .card-btn-del:hover { color: #c0392b; background: rgba(192,57,43,0.08); }
  @media (max-width: 720px) {
    .admin-header { flex-direction: column; align-items: flex-start; gap: 20px; }
    .card-main { padding: 16px 18px; }
    .card-actions { flex-direction: row; width: 100%; border-left: none; border-top: 1px solid var(--line); }
    .card-btn { width: auto; height: 44px; }
  }
</style>
`;

writeFileSync('E:/blog/src/pages/admin/index.astro', content, 'utf8');
console.log('admin/index.astro written successfully');