// 简单的密码认证工具 — 基于 cookie session
import { createHash } from 'node:crypto';

// 管理员密码 — 从环境变量读取，默认值仅用于开发
const ADMIN_PASSWORD = import.meta.env.ADMIN_PASSWORD || 'shiguang-2026';
const SESSION_SECRET = import.meta.env.SESSION_SECRET || 'shiguang-secret-key';

// session 有效期 7 天
const SESSION_MAX_AGE = 7 * 24 * 60 * 60;

/**
 * 生成 session token（HMAC 签名）
 */
export function createSessionToken(): string {
  const payload = { exp: Date.now() + SESSION_MAX_AGE * 1000 };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = createHash('sha256')
    .update(data + SESSION_SECRET)
    .digest('hex');
  return `${data}.${sig}`;
}

/**
 * 验证 session token
 */
export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [data, sig] = parts;
  const expectedSig = createHash('sha256')
    .update(data + SESSION_SECRET)
    .digest('hex');
  if (sig !== expectedSig) return false;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
    return payload.exp > Date.now();
  } catch {
    return false;
  }
}

/**
 * 校验密码
 */
export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

/**
 * 从请求 cookie 中提取 session token
 */
export function getSessionFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/session=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * 判断请求是否已认证
 */
export function isAuthenticated(request: Request): boolean {
  const token = getSessionFromRequest(request);
  return verifySessionToken(token);
}

/**
 * 生成设置 session cookie 的响应头
 */
export function sessionCookieHeader(token: string): string {
  return `session=${token}; Path=/; HttpOnly; Max-Age=${SESSION_MAX_AGE}; SameSite=Strict`;
}

/**
 * 生成清除 session cookie 的响应头
 */
export function clearSessionCookieHeader(): string {
  return 'session=; Path=/; HttpOnly; Max-Age=0; SameSite=Strict';
}