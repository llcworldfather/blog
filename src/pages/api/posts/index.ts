// 文章列表 API — GET 获取全部 / POST 创建新文章
import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../utils/auth';
import { getAllPosts, createPost, type PostInput, type PostStatus } from '../../../utils/posts';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  try {
    // 已登录后台可拿到草稿；公开请求只返回已发布
    const includeDrafts = isAuthenticated(request);
    const posts = await getAllPosts({ includeDrafts });
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
    const body = (await request.json()) as Partial<PostInput> & { status?: PostStatus };
    const status: PostStatus = body.status === 'draft' ? 'draft' : 'published';

    if (status === 'published') {
      if (!body.slug || !body.title || !body.date || !body.mood || !body.content) {
        return new Response(
          JSON.stringify({ error: '缺少必填字段：slug, title, date, mood, content' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    } else if (!body.title && !body.slug) {
      return new Response(JSON.stringify({ error: '草稿至少需要标题或 slug' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const input: PostInput = {
      slug: body.slug || `draft-${Date.now()}`,
      title: body.title || '未命名草稿',
      date: new Date(body.date || Date.now()),
      mood: body.mood || '晴',
      tags: body.tags ?? [],
      excerpt: body.excerpt ?? '',
      content: body.content ?? '',
      status,
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
