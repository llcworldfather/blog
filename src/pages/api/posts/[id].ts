// 单篇文章 API — GET 获取 / PUT 更新 / DELETE 删除
import type { APIRoute } from 'astro';
import { isAuthenticated } from '../../../utils/auth';
import { getPostById, updatePost, deletePost, type PostInput, type PostStatus } from '../../../utils/posts';

export const prerender = false;

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const post = await getPostById(params.id as string);
    if (!post) {
      return new Response(JSON.stringify({ error: '文章不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // 草稿仅登录后台可读取
    if (post.status === 'draft' && !isAuthenticated(request)) {
      return new Response(JSON.stringify({ error: '文章不存在' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify(post), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: '获取文章失败', detail: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const PUT: APIRoute = async ({ params, request }) => {
  try {
    const body = (await request.json()) as Partial<PostInput> & { status?: PostStatus };
    const status: PostStatus | undefined =
      body.status === 'draft' || body.status === 'published' ? body.status : undefined;

    // 一键发布时可能只传 status，需合并已有字段再校验
    if (status === 'published') {
      const existing = await getPostById(params.id as string);
      if (!existing) {
        return new Response(JSON.stringify({ error: '文章不存在' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      const title = body.title ?? existing.title;
      const slug = body.slug ?? existing.slug;
      const content = body.content ?? existing.content;
      const excerpt = body.excerpt ?? existing.excerpt;
      if (!title || title === '未命名草稿' || !slug || !content?.trim()) {
        return new Response(
          JSON.stringify({ error: '草稿内容不完整，请先编辑补充标题、slug 和正文后再发布' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
      if (!excerpt?.trim()) {
        return new Response(
          JSON.stringify({ error: '发布前请填写摘要' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const input: Partial<PostInput> = {};
    if (body.slug !== undefined) input.slug = body.slug;
    if (body.title !== undefined) input.title = body.title;
    if (body.mood !== undefined) input.mood = body.mood;
    if (body.tags !== undefined) input.tags = body.tags;
    if (body.excerpt !== undefined) input.excerpt = body.excerpt;
    if (body.content !== undefined) input.content = body.content;
    if (body.date) input.date = new Date(body.date as unknown as string);
    if (status) input.status = status;

    await updatePost(params.id as string, input);
    return new Response(JSON.stringify({ id: params.id, ...input }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: '更新文章失败', detail: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  try {
    await deletePost(params.id as string);
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: '删除文章失败', detail: String(e) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
