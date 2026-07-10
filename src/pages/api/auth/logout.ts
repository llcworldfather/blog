// 登出 API — POST 清除 session cookie
import type { APIRoute } from 'astro';
import { clearSessionCookieHeader } from '../../../utils/auth';

export const prerender = false;

export const POST: APIRoute = async () => {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': clearSessionCookieHeader(),
    },
  });
};