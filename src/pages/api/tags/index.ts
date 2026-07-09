// 标签 API — GET 获取所有标签及计数
import type { APIRoute } from 'astro';
import { getAllTags } from '../../../utils/posts';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const tags = await getAllTags();
    return new Response(JSON.stringify(tags), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: '获取标签失败', detail: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};