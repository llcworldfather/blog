// 搜索 API — 全文检索已发布文章（标题/摘要/正文/标签）
import type { APIRoute } from 'astro';
import { getAllPosts } from '../../utils/posts';
import { searchPosts, getReadingStats } from '../../utils/reading';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  try {
    const q = url.searchParams.get('q')?.trim() ?? '';
    if (!q) {
      return new Response(JSON.stringify({ query: '', results: [] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const posts = await getAllPosts();
    const results = searchPosts(posts, q).map((p) => {
      const stats = getReadingStats(p.content);
      return {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        date: p.date,
        mood: p.mood,
        tags: p.tags,
        minutes: stats.minutes,
        words: stats.words,
      };
    });

    return new Response(JSON.stringify({ query: q, results }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: '搜索失败', detail: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
