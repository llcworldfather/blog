// 单个标签 API — GET 获取该标签下的所有文章
import type { APIRoute } from 'astro';
import { getPostsByTag } from '../../../utils/posts';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const tag = decodeURIComponent(params.tag as string);
    const posts = await getPostsByTag(tag);
    return new Response(JSON.stringify({ tag, count: posts.length, posts }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: '获取标签文章失败', detail: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};