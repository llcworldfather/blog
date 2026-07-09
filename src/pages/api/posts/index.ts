// 文章列表 API — GET 获取全部 / POST 创建新文章
import type { APIRoute } from 'astro';
import { getAllPosts, createPost, type PostInput } from '../../../utils/posts';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const posts = await getAllPosts();
    return new Response(JSON.stringify(posts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: '获取文章列表失败', detail: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as Partial<PostInput>;

    // 基础校验
    if (!body.slug || !body.title || !body.date || !body.mood || !body.content) {
      return new Response(
        JSON.stringify({ error: '缺少必填字段：slug, title, date, mood, content' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const input: PostInput = {
      slug: body.slug,
      title: body.title,
      date: new Date(body.date),
      mood: body.mood,
      tags: body.tags ?? [],
      excerpt: body.excerpt ?? '',
      content: body.content,
    };

    const id = await createPost(input);
    return new Response(JSON.stringify({ id, ...input }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: '创建文章失败', detail: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};