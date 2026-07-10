// Astro 中间件 — 保护 admin 页面和 API 写操作
import { defineMiddleware } from 'astro:middleware';
import { isAuthenticated } from './utils/auth';

export const onRequest = defineMiddleware((context, next) => {
  const { url, request } = context;
  const path = url.pathname;

  // 登录页和登录/登出 API 不需要认证
  if (path === '/admin/login' || path === '/api/auth/login' || path === '/api/auth/logout') {
    return next();
  }

  // 保护 /admin 下的所有页面（除了 login）
  if (path.startsWith('/admin')) {
    if (!isAuthenticated(request)) {
      return context.redirect('/admin/login');
    }
  }

  // 保护 API 写操作（POST/PUT/DELETE）
  if (path.startsWith('/api/posts') || path.startsWith('/api/tags')) {
    const method = request.method;
    if (method === 'POST' || method === 'PUT' || method === 'DELETE') {
      if (!isAuthenticated(request)) {
        return new Response(JSON.stringify({ error: '未授权，请先登录' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }
  }

  return next();
});