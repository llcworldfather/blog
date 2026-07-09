// 单篇文章 API — GET 获取 / PUT 更新 / DELETE 删除
import type { APIRoute } from 'astro';
import { getPostById, updatePost, deletePost, type PostInput } from '../../../utils/posts';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  try {
    const post = await getPostById(params.id as string);
    if (!post) {
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
    const body = (await request.json()) as Partial<PostInput>;
    const input: Partial<PostInput> = {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
    };
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